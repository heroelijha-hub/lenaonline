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

  // Si l'utilisateur est bien créé dans Supabase, on le crée dans Prisma
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
  return { success: true }
}

export async function logoutUser() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return { success: true }
}
