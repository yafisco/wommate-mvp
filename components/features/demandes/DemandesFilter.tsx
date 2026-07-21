'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/Input'

export const DemandesFilter: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFiliere = searchParams.get('filiere') || ''

  const filieresOptions = [
    { value: '', label: 'Toutes les filières' },
    { value: 'Informatique', label: 'Informatique' },
    { value: 'Mathématiques', label: 'Mathématiques' },
    { value: 'Médecine', label: 'Médecine' },
    { value: 'Droit', label: 'Droit' },
    { value: 'Économie', label: 'Économie' },
    { value: 'Lettres', label: 'Lettres' },
    { value: 'Autre', label: 'Autre' },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val) {
      router.push(`/demandes?filiere=${encodeURIComponent(val)}`)
    } else {
      router.push('/demandes')
    }
  }

  return (
    <div className="w-full md:w-72">
      <Select
        id="filiere-filter"
        value={currentFiliere}
        onChange={handleChange}
        options={filieresOptions}
      />
    </div>
  )
}
export default DemandesFilter
