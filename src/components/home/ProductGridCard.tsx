'use client';
import Image from 'next/image';

import { useRouter } from 'next/navigation';
import Price from '@/components/Price';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import QuickViewModal from '@/components/product/QuickViewModal';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

const Star = ({ filled = true }: { filled?: boolean }) => (
  <svg 
    className={`w-3.5 h-3.5 ${filled ? 'text-orange-500' : 'text-gray-300'}`} 
    fill="currentColor" 
    viewBox="0 0 20 20"
  >
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {t('add_to_cart')}
            </button>
          </div>
        )}
      </div>

      <QuickViewModal 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
        product={product} 
      />
    </div>
  );
}
