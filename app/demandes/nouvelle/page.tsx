import React from 'react'
import Container from '@/components/layout/Container'
import { DemandeForm } from '@/components/features/demandes/DemandeForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Publier une Demande | Wommate',
  description: 'Publiez une demande d\'aide pour trouver un mentor.',
}

export default function NouvelleDemandePage() {
  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container>
        <DemandeForm />
      </Container>
    </main>
  )
}
