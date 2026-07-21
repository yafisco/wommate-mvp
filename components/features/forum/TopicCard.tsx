'use client'

import React from 'react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TagChip } from '@/components/ui/TagChip'
import { ReactionButton } from '@/components/ui/ReactionButton'

interface TopicCardProps {
  topic: {
    id: string
    titre: string
    contenu: string | null
    tags?: string[]
    auteur_nom: string | null
    auteur_filiere: string | null
    auteur_niveau: string | null
    reponse_count: number
    utile_count?: number
    merci_count?: number
    created_at: string
    updated_at: string
    signale: boolean
  }
  currentGroupId: string
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, currentGroupId }) => {
  const dateCreated = new Date(topic.created_at)
  const now = new Date()
  const hoursSinceCreation = (now.getTime() - dateCreated.getTime()) / (1000 * 60 * 60)
  const isNew = hoursSinceCreation < 24

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (hoursDiff < 1) {
      const minutes = Math.floor(hoursDiff * 60)
      return `il y a ${minutes} min`
    } else if (hoursDiff < 24) {
      return `il y a ${Math.floor(hoursDiff)} h`
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      })
    }
  }

  const truncatedContent = topic.contenu
    ? topic.contenu.length > 120
      ? `${topic.contenu.substring(0, 120)}...`
      : topic.contenu
    : null

  return (
    <Link href={`/forum/${currentGroupId}/${topic.id}`}>
      <Card className="p-5 hover:border-indigo-nuit/30 transition-all duration-200 cursor-pointer relative">
        {isNew && (
          <div className="absolute top-3 right-3">
            <Badge variant="statut-ouverte" className="text-[10px]">
              Nouveau
            </Badge>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          {/* En-tête avec titre et badge signalé */}
          <div className="flex items-start justify-between gap-2 pr-16">
            <h3 className="font-display font-bold text-indigo-nuit line-clamp-2 flex-1">
              {topic.titre}
            </h3>
            {topic.signale && (
              <Badge variant="statut-resolue" className="flex-shrink-0 text-xs">
                ⚠️ Signalé
              </Badge>
            )}
          </div>

          {/* Tags */}
          {topic.tags && topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {topic.tags.slice(0, 3).map((tag) => (
                <TagChip key={tag} tag={tag} variant="default" size="sm" />
              ))}
              {topic.tags.length > 3 && (
                <span className="text-xs text-brume">+{topic.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Contenu tronqué */}
          {truncatedContent && (
            <p className="text-sm text-brume line-clamp-2 leading-relaxed">
              {truncatedContent}
            </p>
          )}

          {/* Pied de carte: auteur, stats et réactions */}
          <div className="flex items-center justify-between pt-2 border-t border-indigo-nuit/5">
            <div className="flex items-center gap-2">
              <Avatar name={topic.auteur_nom || 'User'} size="sm" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-encre">
                  {topic.auteur_nom || 'Anonyme'}
                </span>
                <span className="text-[10px] text-brume">
                  {topic.auteur_filiere || 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Réactions */}
              <div className="flex items-center gap-1">
                <ReactionButton 
                  reactionType="utile" 
                  count={topic.utile_count || 0}
                  size="sm"
                  className="pointer-events-none"
                />
                <ReactionButton 
                  reactionType="merci" 
                  count={topic.merci_count || 0}
                  size="sm"
                  className="pointer-events-none"
                />
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-2 text-xs text-brume">
                <span className="font-mono">💬 {topic.reponse_count}</span>
                <span className="font-mono" title={`Dernière activité: ${formatDate(topic.updated_at)}`}>
                  🕒 {formatDate(topic.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
