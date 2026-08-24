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
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: 'You must be logged in.' }
  }

  const updates: any = {
    data: {
      firstName,
      lastName,
      displayName
    }
  }

  if (email && email !== user.email) {
    updates.email = email
  }

  if (newPassword || confirmPassword) {
    if (newPassword !== confirmPassword) {
      return { error: 'Les nouveaux mots de passe ne correspondent pas.' }
    }
    if (!newPassword || newPassword.length < 8) {
      return { error: 'Password must be at least 8 characters long.' }
    }
    updates.password = newPassword
  }

  const { error: updateError } = await supabase.auth.updateUser(updates)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/account/details')
  return { success: true, message: 'Account details updated successfully.' }
}
