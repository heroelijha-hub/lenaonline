'use server';

import prisma from '@/lib/prisma';
import { getSettings } from './settings';
import { getContactSettings } from './contactSettings';
import { getTranslations } from 'next-intl/server';
import { escapeHtml } from '@/lib/security';

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
      return { error: 'Por favor, introduzca una dirección de correo electrónico válida.' };
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
        subject: subject ? `Nuevo mensaje: "${subject}"` : `Nuevo mensaje de ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #1a1a1a;">Ha recibido un nuevo mensaje.</h2>
            <p><strong>De:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
            ${phone ? `<p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>` : ''}
            ${subject ? `<p><strong>Asunto:</strong> ${escapeHtml(subject)}</p>` : ''}
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
            <p><strong>Mensaje:</strong><br/><br/>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
            <br/>
            <p style="color: #666; font-size: 13px;"><em>Por favor, responda al cliente lo antes posible.</em></p>
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

    const crypto = await import('crypto');
    
    // Generate confirmation token
    const secret = process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET || 'fallback-secret';
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const payload = `${email}|${expiry}`;
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const token = Buffer.from(`${payload}|${signature}`).toString('base64');
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.lenaonline.com';
    const confirmUrl = `${baseUrl}/api/newsletter/confirm?token=${token}`;

    try {
      const { sendEmail } = await import('@/lib/mailer');
      await sendEmail({
        to: email,
        subject: `Confirme su suscripción al boletín`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5; padding: 20px;">
            <h1 style="font-size: 24px; color: #1a1a1a; margin-top: 0; margin-bottom: 15px;">Por favor, confirme su suscripción</h1>
            <p style="font-size: 14px; color: #333; margin-bottom: 20px;">¡Gracias por su interés en nuestro boletín! Por favor, haga clic en el siguiente enlace para confirmar su suscripción:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Confirmar suscripción</a>
            </p>
            <p style="font-size: 12px; color: #666;">Si no se suscribió, puede ignorar este correo electrónico.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('[NEWSLETTER] Failed to send opt-in email:', emailErr);
    }

    return { success: true, message: 'Por favor, revise su bandeja de entrada para confirmar su suscripción (Double Opt-in).' };
  } catch (error) {
    console.error('Newsletter submission error:', error);
    return { error: "Une erreur est survenue lors de l'inscription." };
  }
}

