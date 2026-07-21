import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { getDemandeById, getPropositions, getMatchingMentors } from '@/lib/actions/demandes.actions'
import { createClient } from '@/lib/supabase/server'
import { PropositionCard } from '@/components/features/demandes/PropositionCard'
import { MentorCard } from '@/components/features/demandes/MentorCard'
import { MessageButton } from '@/components/features/messages/MessageButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DemandeDetailPage({ params }: PageProps) {
  const { id } = await params
  const demande = await getDemandeById(id)

  if (!demande) {
    return (
      <main className="flex-1 py-12 animate-slide-up">
        <Container className="text-center py-20 flex flex-col gap-4 items-center">
          <h2 className="text-2xl font-display font-bold text-indigo-nuit">Demande introuvable</h2>
          <p className="text-sm text-brume">Cette demande d&apos;aide n&apos;existe pas ou a été supprimée.</p>
          <Link href="/demandes">
            <Button variant="primary">Retour aux demandes</Button>
          </Link>
        </Container>
      </main>
    )
  }

  // Obtenir l'utilisateur connecté
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuteur = user?.id === demande.auteur_id

  // Récupérer les propositions d'aide et les mentors matchés
  const propositions = await getPropositions(id)
  const userProposition = propositions.find(p => p.mentor_id === user?.id)
  const matchingMentors = isAuteur ? await getMatchingMentors(id) : []

  const dateFormatted = new Date(demande.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  // Format du badge de statut
  const statusBadgeVariants = {
    ouverte: 'statut-ouverte',
    en_cours: 'statut-en-cours',
    resolue: 'statut-resolue'
  } as const

  const statusLabels = {
    ouverte: 'Ouverte',
    en_cours: 'En cours d\'accompagnement',
    resolue: 'Résolue'
  }

  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Colonne Gauche : Détails de la demande (8 cols sur desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Link href="/demandes" className="text-xs font-mono text-attaya hover:underline flex items-center gap-1">
            ← Retour à la liste des demandes
          </Link>

          <Card className="p-6 md:p-8 flex flex-col gap-6">
            {/* Statut, filière et niveau */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={statusBadgeVariants[demande.statut]}>
                  {statusLabels[demande.statut]}
                </Badge>
                {demande.filiere && (
                  <Badge variant="filiere">{demande.filiere}</Badge>
                )}
              </div>
              {demande.niveau_requis && (
                <span className="text-xs font-mono text-brume bg-bone px-2 py-0.5 rounded">
                  Niveau requis: {demande.niveau_requis}
                </span>
              )}
            </div>

            {/* Titre */}
            <h1 className="font-display text-2xl md:text-3xl font-black text-indigo-nuit leading-tight">
              {demande.titre}
            </h1>

            {/* Description */}
            <div className="text-sm text-encre leading-relaxed whitespace-pre-wrap pl-1 border-l-2 border-attaya/20">
              {demande.description || "Aucune description fournie."}
            </div>

            {/* Auteur */}
            <div className="flex items-center justify-between border-t border-indigo-nuit/5 pt-6 mt-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={demande.auteur?.nom_complet || 'Utilisateur'} size="md" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-indigo-nuit">
                    {demande.auteur?.nom_complet || 'Étudiant'}
                  </span>
                  <span className="text-xs text-brume">
                    Filière: {demande.auteur?.filiere || 'Non renseignée'} • {demande.auteur?.niveau || 'Tous niveaux'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-brume">
                  Publié le {dateFormatted}
                </span>
                {!isAuteur && user?.id && (
                  <MessageButton
                    userId={demande.auteur_id}
                    userName={demande.auteur?.nom_complet || undefined}
                    variant="secondary"
                    className="px-3 py-1.5 text-xs"
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Si l'utilisateur est l'auteur : afficher les propositions reçues */}
          {isAuteur && (
            <div className="flex flex-col gap-4 mt-4">
              <h3 className="font-display text-lg font-bold text-indigo-nuit pl-2">
                Accompagnements proposés ({propositions.length})
              </h3>

              {propositions.length === 0 ? (
                <Card className="p-6 text-center text-xs text-brume border-dashed border bg-white/50">
                  Aucun mentor n&apos;a encore proposé d&apos;aide pour cette demande.
                </Card>
              ) : (
                <div className="flex flex-col gap-4">
                  {propositions.map((prop) => (
                    <PropositionCard
                      key={prop.id}
                      proposition={prop}
                      demandeId={id}
                      isAuteurDemande={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Si l'utilisateur est un mentor (pas l'auteur de la demande) */}
          {!isAuteur && (
            <div className="mt-4">
              {userProposition ? (
                <Card className="p-6 border-l-4 border-l-pousse bg-pousse/5 flex flex-col gap-3">
                  <h4 className="font-display font-bold text-pousse text-sm">
                    Vous avez proposé votre aide pour cette demande
                  </h4>
                  {userProposition.message && (
                    <p className="text-xs text-encre italic">&ldquo;{userProposition.message}&rdquo;</p>
                  )}
                  <span className="text-[10px] text-brume font-mono">
                    Statut: <span className="font-bold">{userProposition.statut === 'en_attente' ? 'En attente de réponse' : userProposition.statut === 'acceptee' ? 'Acceptée' : 'Déclinée'}</span>
                  </span>
                </Card>
              ) : demande.statut === 'ouverte' ? (
                <MentorCard
                  mentor={{
                    id: user?.id || '',
                    nom_complet: user?.user_metadata?.nom_complet || '',
                    role: 'mentor',
                    filiere: '',
                    niveau: '',
                    centres_interet: [],
                    bio: '',
                    photo_url: null,
                    created_at: '',
                    score: 0
                  }}
                  demandeId={id}
                />
              ) : (
                <Card className="p-6 text-center text-xs text-brume bg-bone/50 border">
                  Cette demande n&apos;est plus ouverte aux propositions d&apos;aide.
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Colonne Droite : Matching Algorithmique (4 cols sur desktop) */}
        {isAuteur && (
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex flex-col gap-1 pl-1">
              <h3 className="font-display text-lg font-bold text-indigo-nuit">
                Mentors suggérés
              </h3>
              <p className="text-[11px] text-brume">
                Profils pertinents identifiés par notre système de matching.
              </p>
            </div>

            {matchingMentors.length === 0 ? (
              <Card className="p-6 text-center text-xs text-brume border-dashed border bg-white/50">
                Aucun profil correspondant exactement n&apos;a été trouvé pour le moment.
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {matchingMentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    demandeId={id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </Container>
    </main>
  )
}
