'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAccountDetails(formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const displayName = formData.get('displayName') as string
  const email = formData.get('email') as string
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'Vous devez être connecté.' }
  }

  const updates: any = {
    data: {
      firstName,
      lastName,
      displayName
    }
  }

  if (email && email !== session.user.email) {
    updates.email = email
  }

  if (newPassword || confirmPassword) {
    if (newPassword !== confirmPassword) {
      return { error: 'Les nouveaux mots de passe ne correspondent pas.' }
    }
    // Note: Pour des raisons de sécurité, une vérification du mot de passe actuel 
    // peut être requise côté API selon la config Supabase. Mais updateUser() 
    // permet de modifier le mot de passe si on a une session valide.
    if (!newPassword || newPassword.length < 6) {
      return { error: 'Le mot de passe doit contenir au moins 6 caractères.' }
    }
    updates.password = newPassword
  }

  const { error } = await supabase.auth.updateUser(updates)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/account/details')
  return { success: true, message: 'Détails du compte mis à jour avec succès.' }
}
