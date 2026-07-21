import React from 'react'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { BecomeMentorForm } from '@/components/features/profile/BecomeMentorForm'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/actions/profile.actions'

export default async function BecomeMentorPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  // Si déjà mentor, rediriger vers le parcours mentor
  if (profile.role === 'mentor') {
    redirect('/parcours/mentor')
  }

  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="flex flex-col gap-8 max-w-2xl">
        {/* En-tête */}
        <div className="flex flex-col gap-2">
          <Badge variant="filiere" className="w-max">Devenir Mentor</Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
            Rejoignez notre communauté de mentors
          </h1>
          <p className="text-sm text-brume">
            Partagez votre expertise et aidez les étudiants à réussir dans leur parcours académique.
          </p>
        </div>

        {/* Formulaire d'inscription */}
        <BecomeMentorForm />

        {/* Informations supplémentaires */}
        <div className="bg-indigo-nuit/5 border border-indigo-nuit/10 rounded-xl p-6">
          <h3 className="font-display text-sm font-bold text-indigo-nuit mb-3">
            Pourquoi devenir mentor ?
          </h3>
          <ul className="space-y-2 text-sm text-brume">
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-pousse mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Développez vos compétences pédagogiques</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-pousse mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Construisez votre réseau professionnel</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-pousse mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Contribuez à la réussite de vos pairs</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-pousse mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Valorisez votre parcours académique</span>
            </li>
          </ul>
        </div>
      </Container>
    </main>
  )
}
