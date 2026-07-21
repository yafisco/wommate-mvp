'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GroupeThematique } from '@/types/database.types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface ForumDrawerProps {
  groups: GroupeThematique[]
  sujetCounts?: Record<string, number>
  currentGroupId?: string
}

export const ForumDrawer: React.FC<ForumDrawerProps> = ({ 
  groups, 
  sujetCounts = {},
  currentGroupId 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Fermer le drawer quand on change de page
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Empêcher le scroll quand le drawer est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Fonction pour obtenir une icône selon la filière
  const getGroupIcon = (filiere: string | null) => {
    const icons: Record<string, string> = {
      'Informatique': '💻',
      'Mathématiques': '📐',
      'Médecine': '🏥',
      'Droit': '⚖️',
      'Économie': '📈',
      'Lettres & Langues': '📚',
      'Sciences': '🔬',
      'Général': '💡'
    }
    return icons[filiere || ''] || '💬'
  }

  return (
    <>
      {/* Bouton toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 bg-attaya text-encre rounded-full shadow-lg flex items-center justify-center hover:bg-[#d4932c] transition-colors"
        aria-label="Ouvrir le menu des filières"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-indigo-nuit/50 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-indigo-nuit/10">
            <h2 className="font-display font-bold text-lg text-indigo-nuit">
              Filieres
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <Link
              href="/forum"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                pathname === '/forum' 
                  ? 'bg-attaya/10 text-attaya font-medium' 
                  : 'text-brume hover:bg-indigo-nuit/5 hover:text-indigo-nuit'
              }`}
            >
              <span className="text-xl">🏠</span>
              <span>Toutes les filières</span>
            </Link>

            {groups.map((group) => {
              const isActive = currentGroupId === group.id
              const sujetCount = sujetCounts[group.id] || 0
              const groupColor = (group as any).couleur || null

              return (
                <Link
                  key={group.id}
                  href={`/forum/${group.id}`}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                    isActive 
                      ? 'bg-attaya/10 text-attaya font-medium' 
                      : 'text-brume hover:bg-indigo-nuit/5 hover:text-indigo-nuit'
                  }`}
                  style={isActive && groupColor ? { borderLeftColor: groupColor, borderLeftWidth: '4px' } : {}}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl flex-shrink-0">{getGroupIcon(group.filiere)}</span>
                    <span className="truncate">{group.nom}</span>
                  </div>
                  {sujetCount > 0 && (
                    <Badge variant="default" className="flex-shrink-0 text-xs">
                      {sujetCount}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-indigo-nuit/10 bg-indigo-nuit/5">
            <p className="text-xs text-brume text-center">
              💡 Utilisez les tags pour filtrer
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
