import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/server'
import { MessageButton } from '@/components/features/messages/MessageButton'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Récupérer le profil public
  const { data: profile, error } = await supabase
    .from('profils')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !profile) {
    return (
      <main className="flex-1 py-12 animate-slide-up">
        <Container className="text-center py-20 flex flex-col gap-4 items-center">
          <h2 className="text-2xl font-display font-bold text-indigo-nuit">Profil introuvable</h2>
          <p className="text-sm text-brume">Ce profil n'existe pas ou a été supprimé.</p>
          <Link href="/demandes">
            <Button variant="primary">Retour aux demandes</Button>
          </Link>
        </Container>
      </main>
    )
  }

  const isOwnProfile = user?.id === profile.id
  const isMentor = profile.role === 'mentor'

  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="max-w-3xl">
        <Link href="/demandes" className="text-xs font-mono text-attaya hover:underline flex items-center gap-1 mb-6">
          ← Retour
        </Link>

        <Card className="p-6 md:p-8 flex flex-col gap-6">
          {/* En-tête profil */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar 
              src={profile.photo_url} 
              name={profile.nom_complet || 'Utilisateur'} 
              size="lg" 
            />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-indigo-nuit">
                {profile.nom_complet || 'Utilisateur'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant={`role-${profile.role}` as any}>{profile.role}</Badge>
                {profile.filiere && (
                  <span className="text-brume text-sm font-mono bg-bone px-2 py-1 rounded-md">
                    {profile.filiere} • {profile.niveau}
                  </span>
                )}
              </div>
            </div>
            
            {/* Boutons d'action */}
            {!isOwnProfile && user && (
              <div className="flex gap-2">
                <MessageButton
                  userId={profile.id}
                  userName={profile.nom_complet || 'Cet utilisateur'}
                  variant="primary"
                />
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="border-t border-indigo-nuit/5 pt-6">
              <h3 className="font-display text-sm font-bold text-indigo-nuit mb-2">À propos</h3>
              <p className="text-sm text-encre leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Centres d'intérêt */}
          {profile.centres_interet && profile.centres_interet.length > 0 && (
            <div className="border-t border-indigo-nuit/5 pt-6">
              <h3 className="font-display text-sm font-bold text-indigo-nuit mb-3">Centres d'intérêt</h3>
              <div className="flex flex-wrap gap-2">
                {profile.centres_interet.map((ci: string) => (
                  <span key={ci} className="text-xs bg-indigo-nuit/5 text-indigo-nuit px-3 py-1 rounded-full font-mono">
                    #{ci}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Badge mentor */}
          {isMentor && (
            <div className="border-t border-indigo-nuit/5 pt-6 bg-pousse/5 -mx-6 -mb-6 px-6 py-6 rounded-b-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pousse/20 text-pousse flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-pousse">Mentor certifié</h3>
                  <p className="text-xs text-brume">Ce membre est mentor sur Wommate et propose son aide aux étudiants.</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Actions supplémentaires pour les mentors */}
        {isMentor && !isOwnProfile && user && (
          <Card className="p-6 border-2 border-pousse/10">
            <h3 className="font-display text-sm font-bold text-indigo-nuit mb-2">Besoin d'aide ?</h3>
            <p className="text-xs text-brume mb-4">
              Ce mentor peut vous accompagner dans vos études. N'hésitez pas à le contacter pour discuter de vos besoins.
            </p>
            <MessageButton
              userId={profile.id}
              userName={profile.nom_complet || 'Ce mentor'}
              variant="primary"
              className="w-full"
            />
          </Card>
        )}
      </Container>
    </main>
  )
}
