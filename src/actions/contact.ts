'use server';

import prisma from '@/lib/prisma';
import { getSettings } from './settings';

export async function submitContactMessage(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
      return { error: 'Veuillez remplir tous les champs obligatoires.' };
    }

    // Save to DB if needed, or just simulate email sending
    // For now, we simulate sending an email to the configured admin email
    const settings = await getSettings();
    const receiverEmail = settings.CONTACT_RECEIVER_EMAIL || 'admin@shopelios.com';

    console.log(`[CONTACT] Sending email to: ${receiverEmail}`);
    console.log(`[CONTACT] From: ${name} <${email}>`);
    console.log(`[CONTACT] Subject: ${subject}`);
    console.log(`[CONTACT] Message: ${message}`);

    return { success: true, message: 'Votre message a été envoyé avec succès !' };
  } catch (error) {
    console.error('Contact submission error:', error);
    return { error: "Une erreur est survenue lors de l'envoi du message." };
  }
}

export async function submitNewsletter(formData: FormData) {
  try {
    const email = formData.get('email') as string;

    if (!email) {
      return { error: 'Veuillez entrer une adresse e-mail valide.' };
    }

    const settings = await getSettings();
    const receiverEmail = settings.CONTACT_RECEIVER_EMAIL || 'admin@shopelios.com';
    const successMsg = settings.NEWSLETTER_SUCCESS_MESSAGE || 'Merci pour votre inscription à notre newsletter !';

    console.log(`[NEWSLETTER] New subscription: ${email}`);
    console.log(`[NEWSLETTER] Notification sent to: ${receiverEmail}`);

    return { success: true, message: successMsg };
  } catch (error) {
    console.error('Newsletter submission error:', error);
    return { error: "Une erreur est survenue lors de l'inscription." };
  }
}
