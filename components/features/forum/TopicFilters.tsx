'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input, Select } from '@/components/ui/Input'

interface TopicFiltersProps {
  currentFilter: 'recent' | 'popular' | 'unanswered'
  currentSearch: string
}

export const TopicFilters: React.FC<TopicFiltersProps> = ({
  currentFilter,
  currentSearch
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = React.useState(currentSearch)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Mettre à jour l'URL avec le nouveau paramètre de recherche
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('search', value.trim())
    } else {
      params.delete('search')
    }
    router.push(`?${params.toString()}`)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    
    // Mettre à jour l'URL avec le nouveau filtre
    const params = new URLSearchParams(searchParams.toString())
    params.set('filter', value)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
      {/* Recherche */}
      <div className="flex-1 w-full">
        <Input
          placeholder="Rechercher un sujet..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>

      {/* Filtres */}
      <div className="flex gap-2 w-full md:w-auto">
        <Select
          value={currentFilter}
          onChange={handleFilterChange}
          className="w-full md:w-auto"
        >
          <option value="recent">🕐 Plus récents</option>
          <option value="popular">🔥 Plus populaires</option>
          <option value="unanswered">❓ Sans réponse</option>
        </Select>
      </div>
    </div>
  )
}
