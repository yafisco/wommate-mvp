import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getSujetsSignales, annulerSignalementSujet, deleteSujet } from '@/lib/actions/forum.actions'
import { revalidatePath } from 'next/cache'

export default async function ModerationPage() {
  const sujets = await getSujetsSignales(50)

  async function handleAnnulerSignalement(formData: FormData) {
    'use server'
    const sujetId = formData.get('sujetId') as string
    await annulerSignalementSujet(sujetId)
    revalidatePath('/forum/moderation')
  }

  async function handleDeleteSujet(formData: FormData) {
    'use server'
    const sujetId = formData.get('sujetId') as string
    await deleteSujet(sujetId)
    revalidatePath('/forum/moderation')
  }

  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="flex flex-col gap-8 max-w-6xl">
        {/* Navigation */}
        <Link href="/forum" className="text-xs font-mono text-attaya hover:underline flex items-center gap-1">
          ← Retour aux forums
        </Link>

        {/* En-tête */}
        <div className="flex flex-col gap-2">
          <Badge variant="statut-resolue" className="w-max">
            Modération
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
            Contenu signalé
          </h1>
          <p className="text-sm text-brume">
            Gérez les signalements et modérez le contenu du forum.
          </p>
        </div>

        {/* Liste des sujets signalés */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-nuit">
              {sujets.length} sujet{sujets.length > 1 ? 's' : ''} signalé{sujets.length > 1 ? 's' : ''}
            </span>
          </div>

          {sujets.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 border-indigo-nuit/15 bg-white/50">
              <div className="w-12 h-12 rounded-full bg-pousse/10 text-pousse flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-brume">
                Aucun contenu signalé pour le moment.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {sujets.map((sujet) => (
                <Card key={sujet.id} className="p-5 border-l-4 border-l-terre">
                  <div className="flex flex-col gap-3">
                    {/* En-tête */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <Link href={`/forum/${sujet.groupe_id}/${sujet.id}`}>
                          <h3 className="font-display font-bold text-indigo-nuit hover:text-attaya transition-colors">
                            {sujet.titre}
                          </h3>
                        </Link>
                        <p className="text-xs text-brume mt-1">
                          Par {sujet.auteur_nom || 'Anonyme'} • {sujet.groupe_nom}
                        </p>
                      </div>
                      <Badge variant="statut-resolue" className="text-xs">
                        ⚠️ Signalé
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-indigo-nuit/10">
                      <form action={handleAnnulerSignalement}>
                        <input type="hidden" name="sujetId" value={sujet.id} />
                        <Button
                          variant="secondary"
                          size="sm"
                          type="submit"
                          className="text-xs"
                        >
                          Ignorer le signalement
                        </Button>
                      </form>
                      
                      <form action={handleDeleteSujet}>
                        <input type="hidden" name="sujetId" value={sujet.id} />
                        <Button
                          variant="primary"
                          size="sm"
                          type="submit"
                          className="text-xs bg-terre hover:bg-terre/80"
                        >
                          Supprimer le sujet
                        </Button>
                      </form>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>
    </main>
  )
}
