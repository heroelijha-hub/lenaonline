import { getSettings } from '@/actions/settings';
import CheckoutClient from './CheckoutClient';
import prisma from '@/lib/prisma';

export default async function CheckoutPage() {
  const settings = await getSettings();
  
  // N'envoyer au client QUE les paramètres nécessaires, pour des raisons de sécurité
  const paymentSettings = {
    ENABLE_STRIPE: settings.ENABLE_STRIPE !== undefined ? settings.ENABLE_STRIPE : 'true',
    ENABLE_PAYPAL: settings.ENABLE_PAYPAL !== undefined ? settings.ENABLE_PAYPAL : 'true',
    ENABLE_BANK_TRANSFER: settings.ENABLE_BANK_TRANSFER !== undefined ? settings.ENABLE_BANK_TRANSFER : 'true',
    BANK_TRANSFER_CHECKOUT_MESSAGE: settings.BANK_TRANSFER_CHECKOUT_MESSAGE || '',
  };

  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    include: { methods: { where: { isActive: true } } }
  });

  return <CheckoutClient settings={paymentSettings} zones={zones} />;
}
