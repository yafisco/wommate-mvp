import React from 'react'
import Container from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getRessources } from '@/lib/actions/ressources.actions'
import { ResourceList } from '@/components/features/ressources/ResourceList'
import { ResourceUploadForm } from '@/components/features/ressources/ResourceUploadForm'

interface PageProps {
  searchParams: Promise<{ filiere?: string; search?: string }>
}

export default async function RessourcesPage({ searchParams }: PageProps) {
  const { filiere, search } = await searchParams
  const ressources = await getRessources(filiere, search)

  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="flex flex-col gap-8">
        {/* En-tête */}
        <div className="flex flex-col gap-2">
          <Badge variant="filiere" className="w-max">
            Bibliothèque numérique
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
            Ressources pédagogiques
          </h1>
          <p className="text-sm text-brume">
            Consultez et partagez des annales d&apos;examens, des fiches de révisions et des supports de cours.
          </p>
        </div>

        {/* Layout 2 colonnes : upload + liste */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Colonne 1 : Upload (1 col) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ResourceUploadForm />
            </div>
          </div>

          {/* Colonne 2 : Liste ressources (3 cols) */}
          <div className="lg:col-span-3">
            <ResourceList resources={ressources} />
          </div>
        </div>
      </Container>
    </main>
  )
}
