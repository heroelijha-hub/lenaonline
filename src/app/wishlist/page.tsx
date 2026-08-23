import WishlistClient from './WishlistClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist | Shopelios',
  description: 'Manage your favorite products on Shopelios',
};

export default function WishlistPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
        <WishlistClient />
      </div>
    </div>
  );
}
