'use client'

import React from 'react'
import Link from 'next/link'
import { GroupeThematique } from '@/types/database.types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface GroupListProps {
  groups: GroupeThematique[]
  sujetCounts?: Record<string, number>
}

export const GroupList: React.FC<GroupListProps> = ({ groups, sujetCounts = {} }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group) => {
        const sujetCount = sujetCounts[group.id] || 0
        const groupColor = (group as any).couleur || null
        
        return (
          <Link key={group.id} href={`/forum/${group.id}`}>
            <Card 
              className="p-6 h-full hover:border-indigo-nuit/30 transition-all duration-200 cursor-pointer relative overflow-hidden"
              style={groupColor ? { borderTopColor: groupColor, borderTopWidth: '4px' } : {}}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getGroupIcon(group.filiere)}</span>
                    <h3 className="font-display font-bold text-lg text-indigo-nuit line-clamp-2">
                      {group.nom}
                    </h3>
                  </div>
                  {group.filiere && (
                    <Badge variant="filiere" className="flex-shrink-0 text-xs">
                      {group.filiere}
                    </Badge>
                  )}
                </div>
                
                {group.description && (
                  <p className="text-sm text-brume line-clamp-3 leading-relaxed">
                    {group.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-indigo-nuit/10">
                  <span className="text-xs text-brume">Discussions actives</span>
                  <span className="text-sm font-mono font-medium text-attaya">
                    {sujetCount}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
