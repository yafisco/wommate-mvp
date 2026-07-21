import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function EtudiantParcoursPage() {
  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="flex flex-col gap-8 max-w-4xl">
        {/* En-tête */}
        <div className="flex flex-col gap-2">
          <Badge variant="filiere" className="w-max">Parcours Étudiant</Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
            Votre guide d'entraide
          </h1>
          <p className="text-sm text-brume">
            Découvrez comment tirer le meilleur parti de Wommate pour trouver de l'aide et progresser dans vos études.
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
                  Créez votre demande d'aide
                </h3>
                <p className="text-sm text-brume mb-4">
                  Décrivez votre besoin, précisez votre filière et le niveau requis. Notre système analysera votre demande pour trouver les mentors les plus adaptés.
                </p>
                <Link href="/demandes/nouvelle">
                  <Button variant="primary" size="sm">
                    Créer une demande
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
                  Découvrez les mentors matchés
                </h3>
                <p className="text-sm text-brume mb-4">
                  Notre algorithme vous propose des mentors basés sur votre filière et vos centres d'intérêt. Plus le score est élevé, plus le mentor est adapté à votre besoin.
                </p>
                <Link href="/demandes">
                  <Button variant="secondary" size="sm">
                    Voir les demandes
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
                  Contactez les mentors
                </h3>
                <p className="text-sm text-brume mb-4">
                  Envoyez un message privé aux mentors qui vous intéressent. Discutez de votre besoin et convenez d'un rendez-vous d'entraide.
                </p>
                <Link href="/mentors">
                  <Button variant="secondary" size="sm">
                    Découvrir les mentors
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
                  Posez vos questions dans les forums thématiques. Partagez vos connaissances et aidez vos pairs en retour.
                </p>
                <Link href="/forum">
                  <Button variant="secondary" size="sm">
                    Accéder au forum
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Ressources supplémentaires */}
        <div className="border-t border-indigo-nuit/10 pt-6">
          <h2 className="font-display text-xl font-bold text-indigo-nuit mb-4">
            Ressources utiles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/ressources">
              <Card hoverable className="p-4">
                <h3 className="font-medium text-indigo-nuit mb-1">Ressources pédagogiques</h3>
                <p className="text-xs text-brume">Accédez aux cours, notes et exercices partagés par la communauté.</p>
              </Card>
            </Link>
            <Link href="/messages">
              <Card hoverable className="p-4">
                <h3 className="font-medium text-indigo-nuit mb-1">Messagerie privée</h3>
                <p className="text-xs text-brume">Gérez vos conversations avec les mentors et autres étudiants.</p>
              </Card>
            </Link>
          </div>
        </div>
      </Container>
    </main>
  )
}
