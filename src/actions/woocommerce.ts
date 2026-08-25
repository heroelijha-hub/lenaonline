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
 * Main action to import WooCommerce Categories and their hierarchy
 */
export async function importWooCommerceCategories(url: string, consumerKey: string, consumerSecret: string) {
  await requireAdmin();
  const baseUrl = url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/wp-json/wc/v3/products/categories`;

  try {
    let allCategories: any[] = [];
    let page = 1;
    let hasMore = true;

    // Fetch all categories (assuming < 1000 categories for now to avoid infinite loops, but paginated)
    while (hasMore && page <= 20) {
      const response = await fetch(`${apiUrl}?per_page=100&page=${page}`, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Erreur API WooCommerce (Catégories): ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("L'API WooCommerce a retourné une réponse inattendue lors de la récupération des catégories.");
      }

      const cats = await response.json();
      if (cats.length === 0) {
        hasMore = false;
      } else {
        allCategories = [...allCategories, ...cats];
        page++;
      }
    }

    if (allCategories.length === 0) return { success: true, count: 0 };

    // 1st Pass: Create all categories to get their UUIDs
    const wcIdToUuidMap: Record<number, string> = {};

    for (const wcCat of allCategories) {
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
      wcIdToUuidMap[wcCat.id] = category.id;
    }

    // 2nd Pass: Link parents
    for (const wcCat of allCategories) {
      if (wcCat.parent && wcCat.parent > 0) {
        const parentUuid = wcIdToUuidMap[wcCat.parent];
        const childUuid = wcIdToUuidMap[wcCat.id];

        if (parentUuid && childUuid) {
          await prisma.category.update({
            where: { id: childUuid },
            data: { parentId: parentUuid }
          });
        }
      }
    }

    revalidatePath('/admin/categories');
    return { success: true, count: allCategories.length };

  } catch (error: any) {
    console.error('Error importing categories from WooCommerce:', error);
    return { success: false, message: error.message || 'Une erreur est survenue lors de l\'importation des catégories.' };
  }
}

/**
 * Gets the total number of products to import
 */
export async function countWooCommerceProducts(url: string, consumerKey: string, consumerSecret: string) {
  await requireAdmin();
  const baseUrl = url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/wp-json/wc/v3/products`;

  try {
    const response = await fetch(`${apiUrl}?per_page=1`, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Erreur API WooCommerce: ${response.status} ${response.statusText}`);
    }

    const totalStr = response.headers.get('x-wp-total');
    if (!totalStr) {
      return { success: false, message: "Impossible de déterminer le nombre total de produits (header x-wp-total manquant)." };
    }

    const total = parseInt(totalStr, 10);
    return { success: true, total };
  } catch (error: any) {
    console.error('Error counting WooCommerce products:', error);
    return { success: false, message: error.message || 'Une erreur inattendue est survenue.' };
  }
}

/**
 * Main action to import a specific batch of products from WooCommerce
 */
export async function importWooCommerceProductsBatch(url: string, consumerKey: string, consumerSecret: string, page: number = 1, perPage: number = 5) {
  await requireAdmin();

  const baseUrl = url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/wp-json/wc/v3/products`;

  try {
    const response = await fetch(`${apiUrl}?per_page=${perPage}&page=${page}`, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Erreur API WooCommerce: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Non-JSON response from WooCommerce API.");
      throw new Error("L'API WooCommerce a retourné une réponse inattendue (HTML au lieu de JSON). Cela arrive souvent suite à une limitation de sécurité de votre hébergeur (pare-feu ou anti-spam) après plusieurs requêtes. Vous pouvez relancer l'importation, elle reprendra là où elle s'est arrêtée.");
    }

    let products;
    try {
      products = await response.json();
    } catch (err) {
      throw new Error("Impossible de lire les données renvoyées par WooCommerce. Vous pouvez relancer l'importation pour continuer.");
    }
    
    if (!Array.isArray(products) || products.length === 0) {
      return { success: true, count: 0 };
    }

    let importedCount = 0;

    for (const wcProduct of products) {
      // Check if product with same title already exists
      const existingProduct = await prisma.product.findFirst({
        where: { title: wcProduct.name }
      });

      if (existingProduct) {
        continue; // Skip this product
      }

      const categoryIds: string[] = [];
      if (wcProduct.categories && Array.isArray(wcProduct.categories)) {
        for (const wcCat of wcProduct.categories) {
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

      const baseSlug = wcProduct.slug || wcProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const uniqueSlug = await generateUniqueSlug(baseSlug);

      const price = parseFloat(wcProduct.price || wcProduct.regular_price || '0');
      const compareAtPrice = parseFloat(wcProduct.regular_price || '0');

      let stock: number | null = null;
      if (wcProduct.manage_stock && wcProduct.stock_quantity !== null) {
        stock = parseInt(wcProduct.stock_quantity, 10);
      }

      await prisma.product.create({
        data: {
          title: wcProduct.name,
          slug: uniqueSlug,
          description: wcProduct.description || '',
          shortDescription: wcProduct.short_description || '',
          price: price,
          compareAtPrice: (compareAtPrice > price) ? compareAtPrice : null,
          images: cloudinaryImageUrls,
          stock: stock,
          type: 'SIMPLE',
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
    console.error('Error importing batch from WooCommerce:', error);
    return { success: false, message: error.message || 'Une erreur inattendue est survenue.' };
  }
}
