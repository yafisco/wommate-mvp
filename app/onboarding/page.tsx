import { getProfile } from '@/lib/actions/profile.actions'
import ProfileForm from '@/components/features/profile/ProfileForm'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Complétez votre profil | Wommate',
  description: 'Finalisez la création de votre profil Wommate.',
}

export default async function OnboardingPage() {
  const profile = await getProfile()

  // Si on est sur onboarding et qu'on n'a pas de profil du tout, on redirige vers login (géré par middleware, mais sécurité supplémentaire)
  if (!profile) {
    redirect('/login')
  }

  // Si le profil est déjà complet (il a une filière), on redirige vers l'accueil
  if (profile.filiere) {
    redirect('/')
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 my-8">
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center gap-3 text-attaya mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-display font-semibold uppercase tracking-wider text-sm">Étape finale</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-indigo-nuit">
          Bienvenue au Grin !
        </h1>
        <p className="text-brume mt-2 text-lg">
          Avant de pouvoir échanger avec la communauté, nous avons besoin de quelques détails.
        </p>
      </div>
      
      <ProfileForm initialData={profile} isOnboarding={true} />
    </div>
  )
}
