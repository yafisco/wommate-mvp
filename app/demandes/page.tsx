import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getDemandes } from '@/lib/actions/demandes.actions'
import { DemandeCard } from '@/components/features/demandes/DemandeCard'
import { DemandesFilter } from '@/components/features/demandes/DemandesFilter'

interface PageProps {
  searchParams: Promise<{ filiere?: string }>
}

export default async function DemandesPage({ searchParams }: PageProps) {
  const { filiere } = await searchParams
  const demandes = await getDemandes(filiere)

  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="flex flex-col gap-8">
        {/* En-tête : titre et bouton de création */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Badge variant="filiere" className="w-max">Espace Entraide</Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">Demandes d&apos;aide</h1>
            <p className="text-sm text-brume">
              Consultez les demandes de soutien formulées par vos pairs ou formulez votre propre demande.
            </p>
          </div>
          <Link href="/demandes/nouvelle">
            <Button variant="primary">
              Publier une demande
            </Button>
          </Link>
        </div>

        {/* Section Filtre */}
        <div className="flex justify-between items-center border-b border-indigo-nuit/10 pb-4">
          <DemandesFilter />
        </div>

        {/* Grille des demandes */}
        {demandes.length === 0 ? (
          <div className="p-12 text-center flex flex-col gap-4 items-center justify-center border-dashed border-2 border-indigo-nuit/15 bg-white/50 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md shadow-sm">
            <div className="w-12 h-12 rounded-full bg-attaya/10 text-attaya flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 00-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-indigo-nuit">Aucune demande trouvée</h3>
            <p className="text-xs text-brume max-w-md">
              Il n&apos;y a actuellement aucune demande d&apos;aide ouverte {filiere ? `dans la filière "${filiere}"` : ""}. Soyez le premier à en formuler une !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demandes.map((demande) => (
              <DemandeCard key={demande.id} demande={demande} />
            ))}
          </div>
        )}
      </Container>
    </main>
  )
}
