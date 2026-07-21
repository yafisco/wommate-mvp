'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'

interface MentorsFiltersProps {
  filieres: string[]
}

export const MentorsFilters: React.FC<MentorsFiltersProps> = ({ filieres }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const search = searchParams.get('search') || ''
  const filiere = searchParams.get('filiere') || 'all'

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('search', value)
    params.set('page', '1')
    router.push(`/mentors?${params.toString()}`)
  }

  const handleFiliereChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('filiere', value)
    params.set('page', '1')
    router.push(`/mentors?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Input
        placeholder="Rechercher par nom ou bio..."
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="flex-1"
      />
      <Select
        value={filiere}
        onChange={handleFiliereChange}
        options={[
          { value: 'all', label: 'Toutes les filières' },
          ...filieres.map(f => ({ value: f, label: f }))
        ]}
      />
    </div>
  )
}
