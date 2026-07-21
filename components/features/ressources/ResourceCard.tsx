'use client'

import React from 'react'
import Link from 'next/link'
import { RessourceAvecAuteur } from '@/types/database.types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { getFileIcon, formatFileSize } from '@/lib/utils/fileValidation'

interface ResourceCardProps {
    resource: RessourceAvecAuteur
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
    const dateFormatted = new Date(resource.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })

    return (
        <Link href={`/ressources/${resource.id}`}>
            <Card hoverable className="h-full flex flex-col justify-between p-6">
                {/* En-tête */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="text-3xl">{getFileIcon(resource.titre)}</div>
                    {resource.type === 'fichier' && (
                        <Badge variant="statut-ouverte" className="text-[10px]">
                            📁 Fichier
                        </Badge>
                    )}
                    {resource.type === 'lien' && (
                        <Badge variant="filiere" className="text-[10px]">
                            🔗 Lien
                        </Badge>
                    )}
                </div>

                {/* Titre et Filière */}
                <div className="flex flex-col gap-2 mb-4">
                    <h3 className="font-display font-bold text-indigo-nuit line-clamp-2 hover:text-attaya transition-colors">
                        {resource.titre}
                    </h3>
                    {resource.filiere && (
                        <Badge variant="filiere" className="w-max text-xs">
                            {resource.filiere}
                        </Badge>
                    )}
                </div>

                {/* Description */}
                {resource.description && (
                    <p className="text-xs text-brume line-clamp-2 mb-4 leading-relaxed">
                        {resource.description}
                    </p>
                )}

                {/* Métadonnées */}
                <div className="flex flex-col gap-3 pt-4 border-t border-indigo-nuit/5">
                    {/* Auteur */}
                    <div className="flex items-center gap-2">
                        <Avatar name={resource.auteur_nom || 'Utilisateur'} size="sm" />
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-indigo-nuit">
                                {resource.auteur_nom || 'Utilisateur'}
                            </p>
                            <p className="text-[10px] text-brume">
                                {resource.auteur_filiere} • {resource.auteur_niveau}
                            </p>
                        </div>
                    </div>

                    {/* Infos fichier */}
                    <div className="flex items-center justify-between text-xs text-brume font-mono">
                        <span>{dateFormatted}</span>
                        {resource.taille_octets && (
                            <span>{formatFileSize(resource.taille_octets)}</span>
                        )}
                    </div>

                    {/* Compteur téléchargements */}
                    {resource.download_count > 0 && (
                        <div className="text-[10px] text-attaya font-bold">
                            ⬇️ {resource.download_count} téléchargement{resource.download_count > 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </Card>
        </Link>
    )
}
