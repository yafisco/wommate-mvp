import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { getRessourceById, deleteRessource } from '@/lib/actions/ressources.actions'
import { createClient } from '@/lib/supabase/server'
import { ResourceDownloadButton } from '@/components/features/ressources/ResourceDownloadButton'
import { ResourceDeleteButton } from '@/components/features/ressources/ResourceDeleteButton'
import { getFileIcon, formatFileSize } from '@/lib/utils/fileValidation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function RessourceDetailPage({ params }: PageProps) {
    const { id } = await params
    const ressource = await getRessourceById(id)

    if (!ressource) {
        return (
            <main className="flex-1 py-12 animate-slide-up">
                <Container className="text-center py-20 flex flex-col gap-4 items-center">
                    <h2 className="text-2xl font-display font-bold text-indigo-nuit">Ressource non trouvée</h2>
                    <p className="text-sm text-brume">Cette ressource n&apos;existe pas ou a été supprimée.</p>
                    <Link href="/ressources">
                        <Button variant="primary">Retour aux ressources</Button>
                    </Link>
                </Container>
            </main>
        )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isAuteur = user?.id === ressource.auteur_id

    const dateFormatted = new Date(ressource.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    return (
        <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
            <Container className="flex flex-col gap-8 max-w-3xl">
                {/* Lien retour */}
                <Link href="/ressources" className="text-xs font-mono text-attaya hover:underline flex items-center gap-1">
                    ← Retour aux ressources
                </Link>

                {/* Card principale */}
                <Card className="p-6 md:p-8 flex flex-col gap-6">
                    {/* En-tête */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4">
                            <span className="text-5xl">{getFileIcon(ressource.titre)}</span>
                            <div>
                                <h1 className="font-display text-2xl md:text-3xl font-black text-indigo-nuit mb-2">
                                    {ressource.titre}
                                </h1>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="filiere">{ressource.filiere || 'Tous niveaux'}</Badge>
                                    {ressource.type === 'fichier' && (
                                        <Badge variant="statut-ouverte" className="text-xs">
                                            📁 Fichier
                                        </Badge>
                                    )}
                                    {ressource.type === 'lien' && (
                                        <Badge variant="filiere" className="text-xs">
                                            🔗 Lien
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {isAuteur && (
                            <div className="flex gap-2">
                                <ResourceDeleteButton ressourceId={ressource.id} />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {ressource.description && (
                        <div className="border-t border-indigo-nuit/5 pt-6">
                            <p className="text-sm text-encre leading-relaxed whitespace-pre-wrap">
                                {ressource.description}
                            </p>
                        </div>
                    )}

                    {/* Métadonnées fichier */}
                    {ressource.type === 'fichier' && ressource.taille_octets && (
                        <div className="bg-bone/50 p-4 rounded-xl flex flex-col gap-2 border border-indigo-nuit/10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-brume">Taille</span>
                                <span className="text-sm font-bold text-indigo-nuit">{formatFileSize(ressource.taille_octets)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-brume">Type</span>
                                <span className="text-sm font-bold text-indigo-nuit">Fichier</span>
                            </div>
                        </div>
                    )}

                    {/* Bouton download/lien */}
                    <div className="border-t border-indigo-nuit/5 pt-6">
                        {ressource.type === 'fichier' && ressource.storage_path ? (
                            <ResourceDownloadButton ressourceId={ressource.id} titre={ressource.titre} />
                        ) : ressource.type === 'lien' && ressource.url ? (
                            <a href={ressource.url} target="_blank" rel="noopener noreferrer">
                                <Button variant="primary" className="w-full">
                                    🔗 Accéder au lien externe
                                </Button>
                            </a>
                        ) : null}
                    </div>

                    {/* Auteur et info */}
                    <div className="border-t border-indigo-nuit/5 pt-6 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <Avatar name={ressource.auteur_nom || 'Utilisateur'} size="md" />
                            <div>
                                <p className="text-sm font-semibold text-indigo-nuit">
                                    {ressource.auteur_nom || 'Utilisateur'}
                                </p>
                                <p className="text-xs text-brume">
                                    {ressource.auteur_filiere} • {ressource.auteur_niveau}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 text-xs">
                            <span className="text-brume font-mono">Publié le {dateFormatted}</span>
                            {ressource.download_count > 0 && (
                                <span className="text-attaya font-bold">⬇️ {ressource.download_count} téléchargement{ressource.download_count > 1 ? 's' : ''}</span>
                            )}
                        </div>
                    </div>
                </Card>
            </Container>
        </main>
    )
}
