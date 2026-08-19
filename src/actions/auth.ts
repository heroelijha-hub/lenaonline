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
    return { error: 'Identifiants incorrects.' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function registerUser(formData: FormData) {
  const username = formData.get('username') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password || !username) {
    return { error: 'Tous les champs sont requis.' }
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
      console.error("Erreur lors de la synchronisation Prisma de l'utilisateur:", e)
      // On ne retourne pas d'erreur critique ici, l'utilisateur est quand même créé dans Supabase Auth
    }
  }

  revalidatePath('/', 'layout')
  
  if (!data.session) {
    return { success: true, message: "Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre compte avant de vous connecter." }
  }
  
  return { success: true }
}

export async function logoutUser() {
  const supabase = await createClient()
  // Déconnecte l'utilisateur de tous les appareils et invalide les tokens côté serveur
  await supabase.auth.signOut({ scope: 'global' })
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function setupAdmin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Tous les champs sont requis.' };
  }

  // Vérifier qu'il n'y a pas déjà d'admin
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (adminCount > 0) {
    return { error: 'Un administrateur existe déjà. Configuration verrouillée.' };
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
    return { error: 'Identifiants incorrects.' };
  }

  if (data.user) {
    // Verify role in Prisma
    const user = await prisma.user.findUnique({ where: { id: data.user.id } });
    if (!user || user.role !== 'ADMIN') {
      await supabase.auth.signOut({ scope: 'global' });
      return { error: 'Accès refusé. Vous n\'êtes pas administrateur.' };
    }
  }

  revalidatePath('/admin', 'layout');
  return { success: true };
}
