'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // L'utilisateur est connecté. La redirection sera gérée par le composant client ou le middleware
  revalidatePath('/', 'layout')
  return { success: true, needsEmailConfirmation: false }
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const supabase = await createClient()

  console.log('Tentative d\'inscription:', { email, name })

  // Essayer d'abord avec emailConfirm = false pour éviter la confirmation email
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nom_complet: name,
        full_name: name,
      },
    },
  })

  if (error) {
    console.error('Erreur Supabase signup:', error)
    return { error: error.message }
  }

  console.log('Signup Supabase réussi:', { 
    user: data.user?.id, 
    session: !!data.session,
    emailConfirmed: data.user?.email_confirmed_at 
  })

  // Créer le profil manuellement dans tous les cas pour assurer la cohérence
  if (data.user) {
    try {
      // Utiliser le service role pour contourner RLS
      const { data: existingProfile, error: checkError } = await supabase
        .from('profils')
        .select('id')
        .eq('id', data.user.id)
        .single()

      console.log('Vérification profil existant:', { 
        existing: !!existingProfile, 
        error: checkError?.message 
      })

      if (!existingProfile && !checkError) {
        // Créer le profil manuellement
        console.log('Création manuelle du profil...')
        const { error: insertError } = await supabase
          .from('profils')
          .insert({
            id: data.user.id,
            nom_complet: name,
            role: 'etudiant',
            created_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Erreur insertion profil:', insertError)
          // Ne pas bloquer l'inscription, le trigger pourrait fonctionner
        } else {
          console.log('Profil créé avec succès')
        }
      }
    } catch (profileError) {
      console.error('Erreur lors de la création du profil:', profileError)
      // Ne pas bloquer l'inscription
    }
  }

  // Si une session est créée immédiatement, pas besoin de confirmation email
  const needsEmailConfirmation = !data.session

  console.log('Inscription terminée:', { needsEmailConfirmation })

  return { success: true, needsEmailConfirmation }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}
