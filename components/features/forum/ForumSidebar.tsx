'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GroupeThematique } from '@/types/database.types'
import { Badge } from '@/components/ui/Badge'

interface ForumSidebarProps {
  groups: GroupeThematique[]
  sujetCounts?: Record<string, number>
  currentGroupId?: string
}

export const ForumSidebar: React.FC<ForumSidebarProps> = ({ 
  groups, 
  sujetCounts = {},
  currentGroupId 
}) => {
  const pathname = usePathname()

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
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-24 space-y-4">
        <div className="bg-white border border-indigo-nuit/10 rounded-xl p-4 shadow-sm">
          <h3 className="font-display font-bold text-indigo-nuit mb-3 text-sm">
            Filieres
          </h3>
          
          <nav className="space-y-1">
            <Link
              href="/forum"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === '/forum' 
                  ? 'bg-attaya/10 text-attaya font-medium' 
                  : 'text-brume hover:bg-indigo-nuit/5 hover:text-indigo-nuit'
              }`}
            >
              <span>🏠</span>
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
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive 
                      ? 'bg-attaya/10 text-attaya font-medium' 
                      : 'text-brume hover:bg-indigo-nuit/5 hover:text-indigo-nuit'
                  }`}
                  style={isActive && groupColor ? { borderLeftColor: groupColor, borderLeftWidth: '3px' } : {}}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex-shrink-0">{getGroupIcon(group.filiere)}</span>
                    <span className="truncate">{group.nom}</span>
                  </div>
                  {sujetCount > 0 && (
                    <span className="flex-shrink-0 text-xs font-mono text-brume">
                      {sujetCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Info rapide */}
        <div className="bg-indigo-nuit/5 border border-indigo-nuit/10 rounded-xl p-4">
          <p className="text-xs text-brume leading-relaxed">
            💡 <span className="font-medium text-indigo-nuit">Astuce :</span> Utilisez les tags pour filtrer les sujets par thématique (#examen, #TP, #révision)
          </p>
        </div>
      </div>
    </aside>
  )
}
