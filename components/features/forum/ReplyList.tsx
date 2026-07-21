'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ReactionButton } from '@/components/ui/ReactionButton'
import { UserProfileTooltip } from '@/components/ui/UserProfileTooltip'
import { ReplyForm } from './ReplyForm'
import { deleteReponse, signalerReponse, toggleReaction } from '@/lib/actions/forum.actions'

interface ReplyListProps {
  replies: any[]
  sujetId: string
  groupeId: string
  initialCount?: number
}

export const ReplyList: React.FC<ReplyListProps> = ({ 
  replies, 
  sujetId,
  groupeId,
  initialCount = 10 
}) => {
  const router = useRouter()
  const [displayCount, setDisplayCount] = useState(initialCount)
  const [loading, setLoading] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const displayedReplies = replies.slice(0, displayCount)

  const hasMore = replies.length > displayCount

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 10, replies.length))
  }

  async function handleDelete(replyId: string) {
    setLoading(replyId)
    const result = await deleteReponse(replyId)
    if (result.success) {
      router.refresh()
    }
    setLoading(null)
  }

  async function handleReport(replyId: string) {
    setLoading(replyId)
    const result = await signalerReponse(replyId)
    if (result.success) {
      router.refresh()
    }
    setLoading(null)
  }

  async function handleReaction(replyId: string, type: 'utile' | 'merci') {
    setLoading(`reaction-${replyId}-${type}`)
    const result = await toggleReaction('reponse', replyId, type)
    if (result.success) {
      router.refresh()
    }
    setLoading(null)
  }

  // Organiser les réponses en hiérarchie (max 2 niveaux)
  const topLevelReplies = displayedReplies.filter(r => !r.parent_id)
  const repliesByParentId = new Map<string, any[]>()
  
  displayedReplies.forEach(reply => {
    if (reply.parent_id) {
      if (!repliesByParentId.has(reply.parent_id)) {
        repliesByParentId.set(reply.parent_id, [])
      }
      repliesByParentId.get(reply.parent_id)!.push(reply)
    }
  })

  if (replies.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed border-2 border-indigo-nuit/15 bg-white/50">
        <p className="text-sm text-brume">
          Aucune réponse pour le moment. Soyez le premier à répondre !
        </p>
      </Card>
    )
  }

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

  const ReplyComponent = ({ reply, isNested = false }: { reply: any, isNested?: boolean }) => {
    const dateFormatted = formatDate(reply.created_at)
    const isOwn = reply.auteur_id === reply.current_user_id
    const childReplies = repliesByParentId.get(reply.id) || []
    const isReplying = replyingTo === reply.id

    return (
      <div className={`${isNested ? 'ml-8 pl-4 border-l-2 border-indigo-nuit/10' : ''}`}>
        <Card className="p-4">
          <div className="flex flex-col gap-3">
            {/* En-tête de la réponse */}
            <div className="flex items-start justify-between gap-3">
              <UserProfileTooltip
                userId={reply.auteur_id}
                userName={reply.auteur_nom || 'Anonyme'}
                userRole={reply.auteur_role}
                userFiliere={reply.auteur_filiere}
                userNiveau={reply.auteur_niveau}
                contributionCount={0} // À implémenter avec getUserContributionCount
              >
                <div className="flex items-center gap-3 cursor-pointer">
                  <Avatar name={reply.auteur_nom || 'User'} size="sm" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-indigo-nuit">
                        {reply.auteur_nom || 'Anonyme'}
                      </span>
                      {reply.auteur_role === 'mentor' && (
                        <Badge variant="role-mentor" className="text-xs">Mentor</Badge>
                      )}
                    </div>
                    <span className="text-xs text-brume">
                      {reply.auteur_filiere || 'N/A'} • {dateFormatted}
                    </span>
                  </div>
                </div>
              </UserProfileTooltip>

              {reply.signale && (
                <Badge variant="statut-resolue" className="text-xs">
                  ⚠️ Signalé
                </Badge>
              )}
            </div>

            {/* Contenu de la réponse */}
            <div className="text-sm text-encre leading-relaxed whitespace-pre-wrap pl-11">
              {reply.contenu}
            </div>

            {/* Actions et réactions */}
            <div className="flex items-center justify-between pl-11">
              <div className="flex items-center gap-2">
                {/* Réactions */}
                <div className="flex items-center gap-1">
                  <ReactionButton 
                    reactionType="utile" 
                    count={reply.utile_count || 0}
                    size="sm"
                    onClick={() => handleReaction(reply.id, 'utile')}
                    disabled={loading?.startsWith('reaction-')}
                  />
                  <ReactionButton 
                    reactionType="merci" 
                    count={reply.merci_count || 0}
                    size="sm"
                    onClick={() => handleReaction(reply.id, 'merci')}
                    disabled={loading?.startsWith('reaction-')}
                  />
                </div>

                {/* Répondre (seulement si pas déjà au niveau 2) */}
                {!isNested && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(isReplying ? null : reply.id)}
                    className="text-xs text-brume hover:text-indigo-nuit"
                  >
                    {isReplying ? 'Annuler' : 'Répondre'}
                  </Button>
                )}
              </div>

              {/* Signalement/Suppression */}
              {isOwn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(reply.id)}
                  disabled={loading === reply.id}
                  className="text-xs text-terre hover:text-terre hover:bg-terre/5"
                >
                  {loading === reply.id ? '...' : 'Supprimer'}
                </Button>
              )}
              {!isOwn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReport(reply.id)}
                  disabled={loading === reply.id}
                  className="text-xs text-brume hover:text-attaya hover:bg-attaya/5"
                >
                  {loading === reply.id ? '...' : 'Signaler'}
                </Button>
              )}
            </div>

            {/* Formulaire de réponse imbriquée */}
            {isReplying && (
              <div className="pl-11 pt-3">
                <ReplyForm
                  sujetId={sujetId}
                  parentId={reply.id}
                  onCancel={() => setReplyingTo(null)}
                  placeholder="Répondre à ce commentaire..."
                />
              </div>
            )}
          </div>
        </Card>

        {/* Réponses imbriquées (niveau 2) */}
        {childReplies.length > 0 && (
          <div className="mt-3 space-y-3">
            {childReplies.map(childReply => (
              <ReplyComponent key={childReply.id} reply={childReply} isNested />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-indigo-nuit">
          {replies.length} réponse{replies.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {topLevelReplies.map((reply) => (
          <ReplyComponent key={reply.id} reply={reply} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="secondary"
            onClick={loadMore}
            className="w-full md:w-auto"
          >
            Charger plus de réponses ({replies.length - displayCount} restantes)
          </Button>
        </div>
      )}
    </div>
  )
}
