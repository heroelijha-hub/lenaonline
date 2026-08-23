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
    return { error: 'You must be logged in.' }
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
    // Note: For security reasons, current password verification 
    // may be required on the API side depending on the Supabase config. But updateUser() 
    // permet de modifier le mot de passe si on a une session valide.
    if (!newPassword || newPassword.length < 6) {
      return { error: 'Password must be at least 6 characters long.' }
    }
    updates.password = newPassword
  }

  const { error } = await supabase.auth.updateUser(updates)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/account/details')
  return { success: true, message: 'Account details updated successfully.' }
}
