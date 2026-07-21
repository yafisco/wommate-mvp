'use client'

import React, { useState } from 'react'
import { TopicCard } from './TopicCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { Card } from '@/components/ui/Card'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

interface TopicListProps {
  topics: any[]
  currentGroupId: string
  initialCount?: number
  loading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
}

export const TopicList: React.FC<TopicListProps> = ({ 
  topics, 
  currentGroupId,
  initialCount = 10,
  loading = false,
  hasMore = false,
  onLoadMore
}) => {
  const [displayCount, setDisplayCount] = useState(initialCount)
  const displayedTopics = topics.slice(0, displayCount)

  const { targetRef, isIntersecting } = useInfiniteScroll(() => {
    if (hasMore && !loading && onLoadMore) {
      onLoadMore()
      setDisplayCount(prev => prev + 10)
    }
  }, { enabled: hasMore && !loading })

  // Si pas de scroll infini, utiliser l'ancien comportement
  const useInfinite = !!onLoadMore

  if (topics.length === 0 && !loading) {
    return (
      <Card className="p-12 text-center flex flex-col gap-4 items-center justify-center border-dashed border-2 border-indigo-nuit/15 bg-white/50">
        <div className="w-12 h-12 rounded-full bg-attaya/10 text-attaya flex items-center justify-center">
          <span className="text-2xl">💬</span>
        </div>
        <h3 className="font-display text-lg font-bold text-indigo-nuit">Aucun sujet pour le moment</h3>
        <p className="text-xs text-brume max-w-md">
          Soyez le premier à lancer une discussion dans ce groupe !
        </p>
      </Card>
    )
  }

  if (topics.length === 0 && loading) {
    return (
      <div className="flex flex-col gap-3">
        <SkeletonCard variant="sujet" />
        <SkeletonCard variant="sujet" />
        <SkeletonCard variant="sujet" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-indigo-nuit">
          {topics.length} sujet{topics.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {displayedTopics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} currentGroupId={currentGroupId} />
        ))}
        
        {/* Skeleton pendant le chargement */}
        {loading && (
          <>
            <SkeletonCard variant="sujet" />
            <SkeletonCard variant="sujet" />
          </>
        )}
      </div>

      {/* Trigger pour scroll infini */}
      {useInfinite && hasMore && (
        <div ref={targetRef} className="py-4">
          {isIntersecting && !loading && (
            <div className="text-center text-xs text-brume">
              Chargement de plus de sujets...
            </div>
          )}
        </div>
      )}

      {/* Bouton charger plus si pas de scroll infini */}
      {!useInfinite && displayedTopics.length < topics.length && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setDisplayCount(prev => Math.min(prev + 10, topics.length))}
            className="px-4 py-2 bg-indigo-nuit/5 text-indigo-nuit rounded-lg hover:bg-indigo-nuit/10 transition-colors text-sm"
          >
            Charger plus de sujets ({topics.length - displayCount} restants)
          </button>
        </div>
      )}
    </div>
  )
}
