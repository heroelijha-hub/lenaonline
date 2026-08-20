'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { processCheckout, validateCoupon } from '@/actions/checkout';
import { useCurrency } from '@/components/CurrencyProvider';

interface CheckoutClientProps {
  settings: {
    ENABLE_STRIPE: string;
    ENABLE_PAYPAL: string;
    ENABLE_BANK_TRANSFER: string;
  }
}

export default function CheckoutClient({ settings }: CheckoutClientProps) {
  const router = useRouter();
  const { items: cart, getTotalPrice, clearCart } = useCartStore();
  
  const [shippingMethod, setShippingMethod] = useState<'free' | 'standard' | 'express'>('free');
  
  const enableBankTransfer = settings.ENABLE_BANK_TRANSFER !== 'false';
  const enableStripe = settings.ENABLE_STRIPE !== 'false';
  const enablePaypal = settings.ENABLE_PAYPAL !== 'false';
  
  const defaultPaymentMethod = enableBankTransfer ? 'BANK_TRANSFER' : enableStripe ? 'STRIPE' : enablePaypal ? 'PAYPAL' : '';
  const [paymentMethod, setPaymentMethod] = useState<string>(defaultPaymentMethod);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, type: 'PERCENTAGE' | 'FIXED_AMOUNT', value: number} | null>(null);
  const [couponError, setCouponError] = useState('');
  const { formatPrice } = useCurrency();

  // Constants for shipping prices
  const shippingCosts = {
    free: 0,
    standard: 21.87,
    express: 53.87
  };

  const cartTotal = getTotalPrice();
  
  // Calculate Discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      discountAmount = cartTotal * (appliedCoupon.value / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const finalTotal = Math.max(0, cartTotal - discountAmount) + shippingCosts[shippingMethod];

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode) return;
    
    const res = await validateCoupon(couponCode);
    if (res.error) {
      setCouponError(res.error);
      setAppliedCoupon(null);
    } else if (res.coupon) {
      setAppliedCoupon(res.coupon as any);
      setShowCouponInput(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!paymentMethod) {
      alert("Veuillez sélectionner un moyen de paiement.");
      return;
    }
    
    setIsProcessing(true);
    
    const formData = new FormData(e.currentTarget);
    
    const res = await processCheckout(formData, cart, finalTotal, paymentMethod as any);
    
    if (res.error) {
      alert(res.error);
      setIsProcessing(false);
      return;
    }

    if (res.redirectUrl) {
      clearCart();
      router.push(res.redirectUrl);
    } else if (paymentMethod === 'PAYPAL') {
      clearCart();
      alert('Ouverture de PayPal (Simulation)... Commande ' + res.orderId);
      router.push('/checkout/success?orderId=' + res.orderId);
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Colonne de Gauche : Formulaire de Facturation */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="bg-gray-50 p-4 rounded text-sm text-gray-700">
            Vous avez un coupon? <button type="button" onClick={() => setShowCouponInput(!showCouponInput)} className="text-orange-600 hover:underline font-medium">Cliquez ici pour saisir votre code</button>
          </div>
          
          {showCouponInput && !appliedCoupon && (
            <div className="bg-white p-4 border border-gray-200 rounded">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Code promo" 
                  className="flex-grow px-4 py-2 border border-gray-200 rounded focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
                <button type="button" onClick={handleApplyCoupon} className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors">
                  Appliquer
                </button>
              </div>
              {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
            </div>
          )}
          
          {appliedCoupon && (
            <div className="bg-green-50 p-4 rounded text-sm text-green-700 flex justify-between items-center border border-green-200">
              <span>Code promo <strong>{appliedCoupon.code}</strong> appliqué avec succès !</span>
              <button type="button" onClick={() => setAppliedCoupon(null)} className="text-red-500 hover:underline font-medium text-xs">Retirer</button>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded text-sm text-gray-700">
            Déjà client? <Link href="/login" className="text-orange-600 hover:underline font-medium">Cliquez ici pour vous connecter</Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Détails De Facturation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
              <input type="text" name="firstName" required className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
              <input type="text" name="lastName" required className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pays/région <span className="text-red-500">*</span></label>
            <select name="country" required className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded focus:ring-orange-500 focus:border-orange-500">
              <option value="Belgique">Belgique</option>
              <option value="France">France</option>
              <option value="Suisse">Suisse</option>
              <option value="Canada">Canada</option>
            </select>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro et nom de rue <span className="text-red-500">*</span></label>
              <input type="text" name="address1" placeholder="Numéro de voie et nom de la rue" required className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <input type="text" name="address2" placeholder="Bâtiment, appartement, lot, etc. (facultatif)" className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code postal <span className="text-red-500">*</span></label>
            <input type="text" name="postalCode" required className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded focus:ring-orange-500 focus:border-orange-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville <span className="text-red-500">*</span></label>
            <input type="text" name="city" required className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded focus:ring-orange-500 focus:border-orange-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (facultatif)</label>
            <input type="tel" name="phone" className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded focus:ring-orange-500 focus:border-orange-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail <span className="text-red-500">*</span></label>
            <input type="email" name="email" required className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded focus:ring-orange-500 focus:border-orange-500" />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="createAccount" name="createAccount" className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500" />
            <label htmlFor="createAccount" className="text-sm text-gray-700 cursor-pointer">Créer un compte ?</label>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input type="checkbox" id="shipToDifferentAddress" name="shipToDifferentAddress" className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500" />
            <label htmlFor="shipToDifferentAddress" className="text-lg font-bold text-gray-900 cursor-pointer">Expédier à une autre adresse ?</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes de commande (facultatif)</label>
            <textarea 
              name="orderNotes" 
              rows={3} 
              placeholder="Commentaires concernant votre commande, ex. : consignes de livraison."
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded focus:ring-orange-500 focus:border-orange-500"
            ></textarea>
          </div>

        </div>

        {/* Colonne de Droite : Récapitulatif et Paiement */}
        <div className="lg:col-span-5">
          <div className="bg-gray-50 p-6 sm:p-8 rounded-lg border border-gray-100 sticky top-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Votre Commande</h2>
            
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between font-bold text-sm text-gray-900 mb-4">
                <span>Produit</span>
                <span>Sous-total</span>
              </div>
              
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between text-sm text-gray-600 mb-4">
                  <div className="pr-4">
                    {item.title} <strong className="text-gray-900">× {item.quantity}</strong>
                  </div>
                  <div className="whitespace-nowrap font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-b border-gray-200 pb-4 mb-4 flex justify-between text-sm font-bold text-gray-900">
              <span>Sous-total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>

            {appliedCoupon && (
              <div className="border-b border-gray-200 pb-4 mb-4 flex justify-between text-sm font-bold text-green-600">
                <span>Réduction ({appliedCoupon.code})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="border-b border-gray-200 pb-4 mb-4 flex justify-between text-sm text-gray-900">
              <span className="font-bold">Expédition</span>
              <div className="text-right space-y-2">
                <label className="flex items-center justify-end gap-2 cursor-pointer">
                  <span className="text-gray-600">Livraison gratuite</span>
                  <input type="radio" name="shippingMethod" value="free" checked={shippingMethod === 'free'} onChange={() => setShippingMethod('free')} className="text-orange-600 focus:ring-orange-500" />
                </label>
                <label className="flex items-center justify-end gap-2 cursor-pointer">
                  <span className="text-gray-600">Livraison standard: {formatPrice(shippingCosts.standard)}</span>
                  <input type="radio" name="shippingMethod" value="standard" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="text-orange-600 focus:ring-orange-500" />
                </label>
                <label className="flex items-center justify-end gap-2 cursor-pointer">
                  <span className="text-gray-600">Livraison expresse: {formatPrice(shippingCosts.express)}</span>
                  <input type="radio" name="shippingMethod" value="express" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="text-orange-600 focus:ring-orange-500" />
                </label>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold text-gray-900 mb-8">
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>

            {/* Accordéon de méthodes de paiement */}
            <div className="space-y-4 mb-8">
              {!enableBankTransfer && !enableStripe && !enablePaypal && (
                <div className="p-4 bg-red-50 text-red-600 rounded text-sm text-center font-medium">
                  Aucun moyen de paiement n'est actuellement disponible.
                </div>
              )}

              {/* Virement Bancaire */}
              {enableBankTransfer && (
                <div className="border border-gray-200 rounded overflow-hidden">
                  <label className="flex items-center p-4 bg-gray-100 cursor-pointer border-b border-gray-200">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="BANK_TRANSFER"
                      checked={paymentMethod === 'BANK_TRANSFER'} 
                      onChange={() => setPaymentMethod('BANK_TRANSFER')}
                      className="w-4 h-4 text-orange-600 mr-3 focus:ring-orange-500" 
                    />
                    <span className="font-medium text-gray-900">Virement bancaire</span>
                  </label>
                  {paymentMethod === 'BANK_TRANSFER' && (
                    <div className="p-4 bg-gray-50 text-sm text-gray-600">
                      <p className="bg-gray-200/50 p-4 rounded text-gray-600">
                        Afin de finaliser votre commande, un e-mail contenant nos coordonnées bancaires vous sera envoyé et dès réception de votre règlement, nous procéderons au traitement de votre commande.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Stripe (Carte Bancaire) */}
              {enableStripe && (
                <div className="border border-gray-200 rounded overflow-hidden">
                  <label className="flex items-center p-4 bg-gray-100 cursor-pointer border-b border-gray-200">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="STRIPE"
                      checked={paymentMethod === 'STRIPE'} 
                      onChange={() => setPaymentMethod('STRIPE')}
                      className="w-4 h-4 text-orange-600 mr-3 focus:ring-orange-500" 
                    />
                    <span className="font-medium text-gray-900">Carte Bancaire (Stripe)</span>
                  </label>
                  {paymentMethod === 'STRIPE' && (
                    <div className="p-4 bg-gray-50 text-sm text-gray-600">
                      <p className="bg-gray-200/50 p-4 rounded text-gray-600">
                        Payer de manière sécurisée avec votre carte bancaire via Stripe. Vous serez redirigé vers la plateforme de paiement sécurisée.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* PayPal */}
              {enablePaypal && (
                <div className="border border-gray-200 rounded overflow-hidden">
                  <label className="flex items-center p-4 bg-gray-100 cursor-pointer">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="PAYPAL"
                      checked={paymentMethod === 'PAYPAL'} 
                      onChange={() => setPaymentMethod('PAYPAL')}
                      className="w-4 h-4 text-orange-600 mr-3 focus:ring-orange-500" 
                    />
                    <span className="font-medium text-gray-900">PayPal</span>
                  </label>
                  {paymentMethod === 'PAYPAL' && (
                    <div className="p-4 bg-gray-50 text-sm text-gray-600">
                      <p className="bg-gray-200/50 p-4 rounded text-gray-600">
                        Réglez vos achats en toute sécurité en utilisant votre compte PayPal.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 mb-6">
              Vos données personnelles seront utilisées pour traiter votre commande, améliorer votre expérience sur ce site web et à d'autres fins décrites dans notre <Link href="/privacy" className="text-orange-600 hover:underline">politique de confidentialité</Link>.
            </div>

            <button 
              type="submit" 
              disabled={isProcessing || cart.length === 0 || !paymentMethod}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded transition-colors flex justify-center items-center disabled:opacity-50"
            >
              {isProcessing ? 'Traitement...' : 'Commander'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
