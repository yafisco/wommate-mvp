import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getMatchingDemands } from '@/lib/actions/demandes.actions'
import { DemandeCard } from '@/components/features/demandes/DemandeCard'
import { DemandesFilter } from '@/components/features/demandes/DemandesFilter'

interface PageProps {
    searchParams: Promise<{ filiere?: string }>
}

export default async function DecouvreDemandesPage({ searchParams }: PageProps) {
    const { filiere } = await searchParams
    const demandes = await getMatchingDemands(filiere)

    return (
        <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
            <Container className="flex flex-col gap-8">
                {/* En-tête : titre et badges */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Badge variant="filiere" className="w-max bg-pousse/10 text-pousse border-pousse/20">
                            📋 Algorithme du Grin
                        </Badge>
                        <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
                            Demandes qui vous correspondent
                        </h1>
                        <p className="text-sm text-brume max-w-2xl">
                            Découvrez les demandes d&apos;aide où votre profil et vos compétences sont les plus pertinents. Proposez votre accompagnement et aidez vos pairs !
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-pousse/5 rounded-xl border border-pousse/10">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-mono text-brume">Système de scoring</span>
                            <span className="text-sm font-bold text-pousse">Filière + Mots-clés</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-mono text-brume">Tri intelligent</span>
                            <span className="text-sm font-bold text-pousse">Pertinence décroissante</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-mono text-brume">Objectif</span>
                            <span className="text-sm font-bold text-pousse">Matching 70%+</span>
                        </div>
                    </div>
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
                        <h3 className="font-display text-lg font-bold text-indigo-nuit">Aucune demande correspondante</h3>
                        <p className="text-xs text-brume max-w-md">
                            Il n&apos;y a actuellement aucune demande d&apos;aide ouverte correspondant à votre profil. Complétez votre profil avec vos centres d&apos;intérêt pour de meilleurs résultats.
                        </p>
                        <Link href="/profil">
                            <Button variant="primary" className="mt-2">
                                Complétez votre profil
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div>
                        <p className="text-xs text-brume mb-4 font-mono">
                            {demandes.length} demande{demandes.length > 1 ? 's' : ''} trouvée{demandes.length > 1 ? 's' : ''} pour votre profil
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {demandes.map((demande) => (
                                <DemandeCard key={demande.id} demande={demande} />
                            ))}
                        </div>
                    </div>
                )}
            </Container>
        </main>
    )
}
