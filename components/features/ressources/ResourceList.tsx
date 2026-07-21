'use client'

import React, { useState } from 'react'
import { RessourceAvecAuteur } from '@/types/database.types'
import { ResourceCard } from './ResourceCard'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

interface ResourceListProps {
    resources: RessourceAvecAuteur[]
    isLoading?: boolean
}

export const ResourceList: React.FC<ResourceListProps> = ({ resources, isLoading = false }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFiliere, setSelectedFiliere] = useState('')

    const filieresOptions = [
        { value: '', label: 'Toutes les filières' },
        { value: 'Informatique', label: 'Informatique' },
        { value: 'Mathématiques', label: 'Mathématiques' },
        { value: 'Médecine', label: 'Médecine' },
        { value: 'Droit', label: 'Droit' },
        { value: 'Économie', label: 'Économie' },
        { value: 'Lettres', label: 'Lettres' },
        { value: 'Autre', label: 'Autre' }
    ]

    // Filtrer les ressources côté client
    const filteredResources = resources.filter((resource) => {
        const matchesSearch =
            !searchTerm ||
            resource.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesFiliere = !selectedFiliere || resource.filiere === selectedFiliere

        return matchesSearch && matchesFiliere
    })

    return (
        <div className="flex flex-col gap-6">
            {/* Filtres */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end gap-4">
                <div className="flex-1">
                    <Input
                        label="Rechercher par mots-clés"
                        placeholder="Ex: révision, examen, cours..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        name="search"
                        type="text"
                    />
                </div>
                <div className="flex-1 md:flex-none md:w-72">
                    <Select
                        label="Filtrer par filière"
                        name="filiere"
                        value={selectedFiliere}
                        onChange={(e) => setSelectedFiliere(e.target.value)}
                        options={filieresOptions}
                    />
                </div>
            </div>

            {/* Affichage des résultats */}
            {filteredResources.length === 0 ? (
                <Card className="p-12 text-center flex flex-col gap-4 items-center justify-center border-dashed border-2 border-indigo-nuit/15 bg-white/50">
                    <div className="w-12 h-12 rounded-full bg-attaya/10 text-attaya flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="font-display text-lg font-bold text-indigo-nuit">Aucune ressource trouvée</h3>
                    <p className="text-xs text-brume max-w-md">
                        {searchTerm || selectedFiliere
                            ? 'Essayez de modifier vos critères de recherche.'
                            : 'Aucune ressource partagée pour le moment. Soyez le premier !'}
                    </p>
                </Card>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <Badge variant="filiere" className="w-max">
                            {filteredResources.length} ressource{filteredResources.length > 1 ? 's' : ''} trouvée{filteredResources.length > 1 ? 's' : ''}
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
