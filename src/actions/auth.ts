'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'L\'email et le mot de passe sont requis.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Incorrect credentials.' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function registerUser(formData: FormData) {
  const username = formData.get('username') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password || !username) {
    return { error: 'All fields are required.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    try {
      // Check if user exists in Prisma first (shouldn't happen on fresh signup)
      const existingUser = await prisma.user.findUnique({
        where: { email: data.user.email }
      })

      if (!existingUser) {
        await prisma.user.create({
          data: {
            id: data.user.id, // On utilise l'ID de Supabase pour faire le lien direct
            email: data.user.email || email,
            role: 'CUSTOMER'
          }
        })
      }
    } catch (e) {
      console.error("Error syncing Prisma user:", e)
      // We don't return a critical error here, the user is still created in Supabase Auth
    }
  }

  revalidatePath('/', 'layout')
  
  if (!data.session) {
    return { success: true, message: "Registration successful! Please check your email to confirm your account before logging in." }
  }
  
  return { success: true }
}

export async function logoutUser() {
  const supabase = await createClient()
  // Logs user out from all devices and invalidates server-side tokens
  await supabase.auth.signOut({ scope: 'global' })
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function setupAdmin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'All fields are required.' };
  }

  // Check that there is no existing admin
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (adminCount > 0) {
    return { error: 'An administrator already exists. Setup is locked.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: 'Admin' }
    }
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Upsert the user as ADMIN in Prisma
    await prisma.user.upsert({
      where: { email: data.user.email || email },
      update: { role: 'ADMIN', id: data.user.id },
      create: {
        id: data.user.id,
        email: data.user.email || email,
        role: 'ADMIN',
      }
    });
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function loginAdmin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'L\'email et le mot de passe sont requis.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Incorrect credentials.' };
  }

  if (data.user) {
    // Verify role in Prisma
    const user = await prisma.user.findUnique({ where: { id: data.user.id } });
    if (!user || user.role !== 'ADMIN') {
      await supabase.auth.signOut({ scope: 'global' });
      return { error: 'Access denied. You are not an administrator.' };
    }
  }

  revalidatePath('/admin', 'layout');
  return { success: true };
}

export async function getUserRole() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (dbUser) return dbUser.role;
    }
  } catch (e) {
    console.error("Error fetching user role", e);
  }
  return null;
}

