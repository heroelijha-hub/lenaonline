'use client';

import { useState } from 'react';
import { updateOrderCustomerInfo, resendOrderConfirmationEmail } from '@/actions/admin';
import { useTranslations } from 'next-intl';

interface OrderCustomerEditorProps {
  orderId: string;
  initialBilling: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
    address1?: string;
    address2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  initialShipping: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company?: string;
    address1?: string;
    address2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  } | null;
  userEmail?: string;
}

export default function OrderCustomerEditor({
  orderId,
  initialBilling,
  initialShipping,
  userEmail,
}: OrderCustomerEditorProps) {
  const t = useTranslations('AdminOrders');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [hasDifferentShipping, setHasDifferentShipping] = useState(Boolean(initialShipping));

  const [billing, setBilling] = useState({
    firstName: initialBilling?.firstName || '',
    lastName: initialBilling?.lastName || '',
    email: initialBilling?.email || userEmail || '',
    phone: initialBilling?.phone || '',
    company: initialBilling?.company || '',
    address1: initialBilling?.address1 || '',
    address2: initialBilling?.address2 || '',
    city: initialBilling?.city || '',
    postalCode: initialBilling?.postalCode || '',
    country: initialBilling?.country || 'España',
  });

  const [shipping, setShipping] = useState({
    firstName: initialShipping?.firstName || initialBilling?.firstName || '',
    lastName: initialShipping?.lastName || initialBilling?.lastName || '',
    email: initialShipping?.email || initialBilling?.email || userEmail || '',
    phone: initialShipping?.phone || initialBilling?.phone || '',
    company: initialShipping?.company || '',
    address1: initialShipping?.address1 || initialBilling?.address1 || '',
    address2: initialShipping?.address2 || '',
    city: initialShipping?.city || initialBilling?.city || '',
    postalCode: initialShipping?.postalCode || initialBilling?.postalCode || '',
    country: initialShipping?.country || initialBilling?.country || 'España',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const res = await updateOrderCustomerInfo(orderId, {
      billing,
      shipping: hasDifferentShipping ? shipping : null,
    });

    setIsSaving(false);
    if (res.error) {
      setFeedback({ type: 'error', message: res.error });
    } else {
      setFeedback({ type: 'success', message: t('customer_info_saved') });
      setIsEditing(false);
    }
  };

  const handleResend = async () => {
    if (!confirm(t('confirm_resend_order'))) {
      return;
    }

    setIsResending(true);
    setFeedback(null);

    const res = await resendOrderConfirmationEmail(orderId);
    setIsResending(false);

    if (res.error) {
      setFeedback({ type: 'error', message: res.error });
    } else {
      setFeedback({ type: 'success', message: res.message || t('customer_info_saved') });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>👤</span> {t('customer_info')}
        </h2>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-2.5 py-1 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded border border-orange-200 transition-colors"
            >
              ✏️ {t('edit_customer_info')}
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 mb-4 rounded-md text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {!isEditing ? (
        <div className="space-y-4">
          {/* Facturation */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Adresse de facturation
            </p>
            <div className="space-y-1.5 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-4">👤</span>
                <span className="font-semibold">{[billing.firstName, billing.lastName].filter(Boolean).join(' ') || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-4">✉️</span>
                <a href={`mailto:${billing.email}`} className="text-orange-700 hover:underline break-all text-xs">
                  {billing.email || '—'}
                </a>
              </div>
              {billing.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-4">📞</span>
                  <a href={`tel:${billing.phone}`} className="hover:underline">{billing.phone}</a>
                </div>
              )}
              {billing.company && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="text-gray-400 w-4">🏢</span>
                  <span>{billing.company}</span>
                </div>
              )}
              <div className="flex items-start gap-2 pt-1">
                <span className="text-gray-400 w-4 mt-0.5">📍</span>
                <div className="leading-snug">
                  {billing.address1 && <p>{billing.address1}</p>}
                  {billing.address2 && <p className="text-xs text-gray-500">{billing.address2}</p>}
                  <p>{[billing.postalCode, billing.city].filter(Boolean).join(' ')}</p>
                  {billing.country && <p className="font-medium text-xs text-gray-900">{billing.country}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Livraison */}
          <div className="border-t pt-3">
            {hasDifferentShipping ? (
              <>
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">
                  🚚 {t('shipping_address_different')}
                </p>
                <div className="space-y-1.5 text-sm text-gray-700 bg-orange-50/60 border border-orange-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 w-4">👤</span>
                    <span className="font-semibold">{[shipping.firstName, shipping.lastName].filter(Boolean).join(' ') || '—'}</span>
                  </div>
                  {shipping.phone && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-orange-500 w-4">📞</span>
                      <a href={`tel:${shipping.phone}`} className="hover:underline">{shipping.phone}</a>
                    </div>
                  )}
                  {shipping.company && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="text-orange-500 w-4">🏢</span>
                      <span>{shipping.company}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 pt-0.5">
                    <span className="text-orange-500 w-4 mt-0.5">📍</span>
                    <div className="leading-snug">
                      {shipping.address1 && <p>{shipping.address1}</p>}
                      {shipping.address2 && <p className="text-xs text-gray-500">{shipping.address2}</p>}
                      <p>{[shipping.postalCode, shipping.city].filter(Boolean).join(' ')}</p>
                      {shipping.country && <p className="font-medium text-xs text-gray-900">{shipping.country}</p>}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">🚚 {t('shipping_address')}</p>
                <p className="text-xs text-gray-500 italic">{t('same_as_billing')}</p>
              </div>
            )}
          </div>

          {/* Bouton de renvoi de confirmation */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>{t('saving')}</span>
                </>
              ) : (
                <>
                  <span>✉️</span>
                  <span>{t('resend_order_confirmation')}</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-gray-400 mt-1.5 text-center">
              {t('resend_confirmation_hint')}
            </p>
          </div>
        </div>
      ) : (
        /* Formulaire d'édition */
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200 space-y-2.5">
            <p className="font-bold text-gray-800 text-xs">Adresse de Facturation</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 mb-0.5">Prénom *</label>
                <input
                  type="text"
                  required
                  value={billing.firstName}
                  onChange={(e) => setBilling({ ...billing, firstName: e.target.value })}
                  className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-0.5">Nom *</label>
                <input
                  type="text"
                  required
                  value={billing.lastName}
                  onChange={(e) => setBilling({ ...billing, lastName: e.target.value })}
                  className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 mb-0.5">Email *</label>
                <input
                  type="email"
                  required
                  value={billing.email}
                  onChange={(e) => setBilling({ ...billing, email: e.target.value })}
                  className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-0.5">Téléphone</label>
                <input
                  type="text"
                  value={billing.phone}
                  onChange={(e) => setBilling({ ...billing, phone: e.target.value })}
                  className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 mb-0.5">Adresse 1 *</label>
              <input
                type="text"
                required
                value={billing.address1}
                onChange={(e) => setBilling({ ...billing, address1: e.target.value })}
                className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-600 mb-0.5">Code Postal *</label>
                <input
                  type="text"
                  required
                  value={billing.postalCode}
                  onChange={(e) => setBilling({ ...billing, postalCode: e.target.value })}
                  className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-0.5">Ville *</label>
                <input
                  type="text"
                  required
                  value={billing.city}
                  onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                  className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-0.5">Pays *</label>
                <input
                  type="text"
                  required
                  value={billing.country}
                  onChange={(e) => setBilling({ ...billing, country: e.target.value })}
                  className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Option adresse différente */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="differentShipping"
              checked={hasDifferentShipping}
              onChange={(e) => setHasDifferentShipping(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="differentShipping" className="text-gray-700 font-medium cursor-pointer">
              Adresse de livraison différente
            </label>
          </div>

          {hasDifferentShipping && (
            <div className="bg-orange-50/60 p-3 rounded-md border border-orange-200 space-y-2.5">
              <p className="font-bold text-orange-900 text-xs">Adresse de Livraison</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-0.5">Prénom</label>
                  <input
                    type="text"
                    value={shipping.firstName}
                    onChange={(e) => setShipping({ ...shipping, firstName: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">Nom</label>
                  <input
                    type="text"
                    value={shipping.lastName}
                    onChange={(e) => setShipping({ ...shipping, lastName: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-0.5">Téléphone de livraison</label>
                <input
                  type="text"
                  value={shipping.phone}
                  onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-0.5">Adresse de livraison</label>
                <input
                  type="text"
                  value={shipping.address1}
                  onChange={(e) => setShipping({ ...shipping, address1: e.target.value })}
                  className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-600 mb-0.5">Code Postal</label>
                  <input
                    type="text"
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">Ville</label>
                  <input
                    type="text"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">Pays</label>
                  <input
                    type="text"
                    value={shipping.country}
                    onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                    className="w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-orange-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              {t('cancel_auto') || 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 bg-orange-700 hover:bg-orange-800 text-white rounded font-semibold disabled:opacity-50"
            >
              {isSaving ? t('saving') : t('save_customer_info')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
