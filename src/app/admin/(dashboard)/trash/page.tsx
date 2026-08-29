import TrashPageClient from './TrashPageClient';
import { getTranslations } from 'next-intl/server';
import { getTrashedProducts, getTrashedMedia } from '@/actions/trash';

export const metadata = {
  title: 'Corbeille | Shopelios Admin',
};

export default async function TrashPage() {
  const trashedProducts = await getTrashedProducts();
  const trashedMedia = await getTrashedMedia();

  return (
    <TrashPageClient 
      initialProducts={trashedProducts} 
      initialMedia={trashedMedia} 
    />
  );
}
