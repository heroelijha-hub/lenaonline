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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: 'Please provide a valid email address.' };
    }

    // Limit field lengths to prevent abuse
    if (name.length > 200 || email.length > 254 || (subject && subject.length > 500) || message.length > 5000) {
      return { error: 'One or more fields exceed the maximum allowed length.' };
    }

    // Save to DB if needed, or just simulate email sending
    // For now, we simulate sending an email to the configured admin email
    const settings = await getSettings();
    const receiverEmail = settings.CONTACT_RECEIVER_EMAIL || 'admin@mystore.com';

    console.log(`[CONTACT] Sending email to: ${receiverEmail}`);
    console.log(`[CONTACT] From: ${name} <${email}>`);
    console.log(`[CONTACT] Subject: ${subject}`);
    console.log(`[CONTACT] Message: ${message}`);

    return { success: true, message: 'Your message has been sent successfully!' };
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
    const receiverEmail = settings.CONTACT_RECEIVER_EMAIL || 'admin@mystore.com';
    const successMsg = settings.NEWSLETTER_SUCCESS_MESSAGE || 'Thank you for subscribing to our newsletter!';

    console.log(`[NEWSLETTER] New subscription: ${email}`);
    console.log(`[NEWSLETTER] Notification sent to: ${receiverEmail}`);

    return { success: true, message: successMsg };
  } catch (error) {
    console.error('Newsletter submission error:', error);
    return { error: "Une erreur est survenue lors de l'inscription." };
  }
}
