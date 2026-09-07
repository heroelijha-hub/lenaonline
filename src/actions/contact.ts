'use server';

import prisma from '@/lib/prisma';
import { getSettings } from './settings';
import { getContactSettings } from './contactSettings';
import { getTranslations } from 'next-intl/server';

export async function submitContactMessage(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
      const t = await getTranslations('Contact');
      return { error: t('missing_fields') };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: 'Please provide a valid email address.' };
    }

    // Limit field lengths to prevent abuse
    if (name.length > 200 || email.length > 254 || (subject && subject.length > 500) || message.length > 5000) {
      const t = await getTranslations('Contact');
      return { error: t('fields_too_long') };
    }

    // Save to DB if needed, or just simulate email sending
    // For now, we simulate sending an email to the configured admin email
    const contactSettings = await getContactSettings();
    const receiverEmail = contactSettings.formRecipient;

    // Send email to the configured admin/receiver
    try {
      const { sendEmail } = await import('@/lib/mailer');
      await sendEmail({
        to: receiverEmail,
        subject: subject ? `[Contact] ${subject}` : `[Contact] Message from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>New Contact Message</h2>
            <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
            <hr/>
            <p>${message.replace(/\n/g, '<br/>')}</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('[CONTACT] Failed to send email:', emailErr);
    }

    return { success: true, message: 'Your message has been sent successfully!' };
  } catch (error) {
    console.error('Contact submission error:', error);
    const t = await getTranslations('Contact');
    return { error: t('error_sending') };
  }
}

export async function submitNewsletter(formData: FormData) {
  try {
    const email = formData.get('email') as string;

    if (!email) {
      return { error: 'Veuillez entrer une adresse e-mail valide.' };
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: 'Adresse e-mail invalide.' };
    }

    const settings = await getSettings();
    const receiverEmail = settings.CONTACT_RECEIVER_EMAIL || 'admin@mystore.com';
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Top Kaminbrennstoffe';
    const successMsg = settings.NEWSLETTER_SUCCESS_MESSAGE || 'Merci pour votre inscription à notre newsletter !';

    // Envoi de l'email de notification à l'admin
    try {
      const { sendEmail } = await import('@/lib/mailer');
      await sendEmail({
        to: receiverEmail,
        subject: `[Newsletter] Nouvelle inscription — ${email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #f97316; padding: 24px 32px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px;">📬 Nouvelle inscription Newsletter</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 16px; margin-bottom: 16px;">Un nouveau visiteur vient de s'inscrire à la newsletter de <strong>${storeName}</strong>.</p>
              <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 6px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 16px; font-weight: bold; color: #6b7280; width: 120px;">Email</td>
                  <td style="padding: 12px 16px; color: #111827;">${email}</td>
                </tr>
                <tr style="background: #f3f4f6;">
                  <td style="padding: 12px 16px; font-weight: bold; color: #6b7280;">Date</td>
                  <td style="padding: 12px 16px; color: #111827;">${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</td>
                </tr>
              </table>
            </div>
            <div style="padding: 16px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
              Cet email a été envoyé automatiquement par ${storeName}.
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('[NEWSLETTER] Failed to send notification email:', emailErr);
      // On ne bloque pas l'inscription si l'email échoue
    }

    return { success: true, message: successMsg };
  } catch (error) {
    console.error('Newsletter submission error:', error);
    return { error: "Une erreur est survenue lors de l'inscription." };
  }
}

