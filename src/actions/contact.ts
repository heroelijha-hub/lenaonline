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
        subject: subject ? `Neue Nachricht: "${subject}"` : `Neue Nachricht von ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #1a1a1a;">Sie haben eine neue Nachricht erhalten.</h2>
            <p><strong>Von:</strong> ${name} &lt;${email}&gt;</p>
            ${phone ? `<p><strong>Telefon:</strong> ${phone}</p>` : ''}
            ${subject ? `<p><strong>Betreff:</strong> ${subject}</p>` : ''}
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
            <p><strong>Nachricht:</strong><br/><br/>${message.replace(/\n/g, '<br/>')}</p>
            <br/>
            <p style="color: #666; font-size: 13px;"><em>Bitte antworten Sie dem Kunden so schnell wie möglich.</em></p>
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
        subject: `Neue Newsletter-Anmeldung — ${email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5; padding: 20px;">
            <h1 style="font-size: 24px; color: #1a1a1a; margin-top: 0; margin-bottom: 15px;">📬 Neue Newsletter-Anmeldung</h1>
            <p style="font-size: 13px; color: #666;">Ein neuer Besucher hat sich gerade für den Newsletter von <strong>${storeName}</strong> angemeldet.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #f9fafb; padding: 15px; border-radius: 8px;">
              <tr>
                <td style="padding: 10px; font-size: 13px; font-weight: bold; width: 120px;">E-Mail:</td>
                <td style="padding: 10px; font-size: 13px;">
                  <a href="mailto:${email}" style="color: #2563eb;">${email}</a>
                </td>
              </tr>
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 10px; font-size: 13px; font-weight: bold;">Datum:</td>
                <td style="padding: 10px; font-size: 13px;">${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</td>
              </tr>
            </table>
            
            <div style="border-top: 1px solid #eee; margin-top: 40px; padding-top: 25px; text-align: center; font-size: 10px; color: #eab308; text-transform: uppercase;">
              <strong>${storeName}</strong><br/>
              DÜNNENRIEDE 3, 30853 LANGENHAGEN, DEUTSCHLAND
            </div>
          </div>
        `,
      });
      
      // Envoi de l'email de bienvenue au client
      const { sendNewsletterWelcomeEmail } = await import('@/lib/mailer');
      await sendNewsletterWelcomeEmail(email);
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

