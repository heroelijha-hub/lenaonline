'use server';

import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Helper to upload an image from a URL to Cloudinary
 */
async function uploadImageFromUrlToCloudinary(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise<string>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'shopelios/woocommerce-import' },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error(`Error downloading/uploading image ${imageUrl}:`, error);
    return null;
  }
}

/**
 * Generates a unique slug
 */
async function generateUniqueSlug(baseSlug: string) {
  let slug = baseSlug || 'product';
  let isUnique = false;
  let counter = 1;
  let currentSlug = slug;

  while (!isUnique) {
    const existing = await prisma.product.findUnique({ where: { slug: currentSlug } });
    if (!existing) {
      isUnique = true;
    } else {
      currentSlug = `${slug}-${counter}`;
      counter++;
    }
  }
  return currentSlug;
}

/**
 * Main action to import products from WooCommerce
 */
export async function importWooCommerceProducts(url: string, consumerKey: string, consumerSecret: string) {
  await requireAdmin();

  // Clean URL
  const baseUrl = url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/wp-json/wc/v3/products`;

  try {
    let allProducts: any[] = [];
    let page = 1;
    let hasMore = true;

    // Fetch all products with pagination
    while (hasMore) {
      const response = await fetch(`${apiUrl}?per_page=100&page=${page}`, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
          'Content-Type': 'application/json'
        },
        cache: 'no-store' // Avoid caching the API response
      });

      if (!response.ok) {
        throw new Error(`WooCommerce API Error: ${response.status} ${response.statusText}`);
      }

      const products = await response.json();
      
      if (products.length === 0) {
        hasMore = false;
      } else {
        allProducts = [...allProducts, ...products];
        page++;
      }
    }

    if (allProducts.length === 0) {
      return { success: false, message: 'No products found on the store.' };
    }

    let importedCount = 0;

    // Process each product
    for (const wcProduct of allProducts) {
      // 1. Handle Categories
      const categoryIds: string[] = [];
      if (wcProduct.categories && Array.isArray(wcProduct.categories)) {
        for (const wcCat of wcProduct.categories) {
          // Find or create category
          let category = await prisma.category.findUnique({
            where: { name: wcCat.name }
          });

          if (!category) {
            category = await prisma.category.create({
              data: {
                name: wcCat.name,
                slug: wcCat.slug || wcCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              }
            });
          }
          categoryIds.push(category.id);
        }
      }

      // 2. Handle Images (Download & Upload to Cloudinary)
      const cloudinaryImageUrls: string[] = [];
      if (wcProduct.images && Array.isArray(wcProduct.images)) {
        for (const wcImg of wcProduct.images) {
          if (wcImg.src) {
            const secureUrl = await uploadImageFromUrlToCloudinary(wcImg.src);
            if (secureUrl) {
              cloudinaryImageUrls.push(secureUrl);
            }
          }
        }
      }

      // 3. Create the Product
      const baseSlug = wcProduct.slug || wcProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const uniqueSlug = await generateUniqueSlug(baseSlug);

      // Determine price
      const price = parseFloat(wcProduct.price || wcProduct.regular_price || '0');
      const compareAtPrice = parseFloat(wcProduct.regular_price || '0');

      // Determine stock
      let stock: number | null = null;
      if (wcProduct.manage_stock && wcProduct.stock_quantity !== null) {
        stock = parseInt(wcProduct.stock_quantity, 10);
      }

      await prisma.product.create({
        data: {
          title: wcProduct.name,
          slug: uniqueSlug,
          description: wcProduct.description,
          shortDescription: wcProduct.short_description,
          price: price,
          compareAtPrice: (compareAtPrice > price) ? compareAtPrice : null,
          images: cloudinaryImageUrls,
          stock: stock,
          type: 'SIMPLE', // Default to simple for v1
          categories: {
            connect: categoryIds.map(id => ({ id }))
          }
        }
      });

      importedCount++;
    }

    revalidatePath('/admin/products');
    return { success: true, count: importedCount };

  } catch (error: any) {
    console.error('Error importing from WooCommerce:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
