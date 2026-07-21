import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function MentorParcoursPage() {
  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="flex flex-col gap-8 max-w-4xl">
        {/* En-tête */}
        <div className="flex flex-col gap-2">
          <Badge variant="filiere" className="w-max">Parcours Mentor</Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
            Votre tableau de bord mentor
          </h1>
          <p className="text-sm text-brume">
            Guide pour accompagner les étudiants et partager votre expertise.
          </p>
        </div>

        {/* Étapes du parcours */}
        <div className="flex flex-col gap-6">
          {/* Étape 1 */}
          <Card className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-attaya/20 text-attaya flex items-center justify-center font-display font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-indigo-nuit mb-2">
                  Consultez les demandes d'aide
                </h3>
                <p className="text-sm text-brume mb-4">
                  Parcourez les demandes des étudiants. Notre système de matching vous suggère les demandes qui correspondent à votre filière et vos centres d'intérêt.
                </p>
                <Link href="/demandes">
                  <Button variant="primary" size="sm">
                    Voir les demandes
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Étape 2 */}
          <Card className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pousse/20 text-pousse flex items-center justify-center font-display font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-indigo-nuit mb-2">
                  Proposez votre aide
                </h3>
                <p className="text-sm text-brume mb-4">
                  Envoyez une proposition d'aide aux étudiants dont les besoins correspondent à vos compétences. Expliquez comment vous pouvez les aider.
                </p>
                <Link href="/demandes">
                  <Button variant="secondary" size="sm">
                    Faire une proposition
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Étape 3 */}
          <Card className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-nuit/20 text-indigo-nuit flex items-center justify-center font-display font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-indigo-nuit mb-2">
                  Gérez vos propositions
                </h3>
                <p className="text-sm text-brume mb-4">
                  Suivez l'état de vos propositions. Les étudiants peuvent accepter ou refuser votre aide. Une fois acceptée, commencez l'entraide via messagerie.
                </p>
                <Link href="/profil">
                  <Button variant="secondary" size="sm">
                    Voir mes propositions
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Étape 4 */}
          <Card className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-terre/20 text-terre flex items-center justify-center font-display font-bold text-lg">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-indigo-nuit mb-2">
                  Participez au forum
                </h3>
                <p className="text-sm text-brume mb-4">
                  Répondez aux questions dans les forums thématiques. Montrez votre expertise et aidez un maximum d'étudiants.
                </p>
                <Link href="/forum">
                  <Button variant="secondary" size="sm">
                    Accéder au forum
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Étape 5 */}
          <Card className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brume/20 text-brume flex items-center justify-center font-display font-bold text-lg">
                5
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-indigo-nuit mb-2">
                  Partagez vos ressources
                </h3>
                <p className="text-sm text-brume mb-4">
                  Uploadez vos cours, notes et exercices pour aider la communauté à progresser.
                </p>
                <Link href="/ressources">
                  <Button variant="secondary" size="sm">
                    Partager une ressource
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Statistiques mentor */}
        <div className="border-t border-indigo-nuit/10 pt-6">
          <h2 className="font-display text-xl font-bold text-indigo-nuit mb-4">
            Votre impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-attaya">0</p>
              <p className="text-xs text-brume mt-1">Étudiants aidés</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-pousse">0</p>
              <p className="text-xs text-brume mt-1">Propositions acceptées</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-indigo-nuit">0</p>
              <p className="text-xs text-brume mt-1">Ressources partagées</p>
            </Card>
          </div>
        </div>
      </Container>
    </main>
  )
}
