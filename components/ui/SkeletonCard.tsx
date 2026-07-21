'use client'

import React from 'react'
import { Card } from './Card'

export interface SkeletonCardProps {
  variant?: 'sujet' | 'reponse' | 'groupe'
  className?: string
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'sujet',
  className = ''
}) => {
  const baseSkeleton = 'bg-indigo-nuit/5 animate-pulse rounded'

  return (
    <Card className={`p-5 ${className}`}>
      {variant === 'sujet' && (
        <div className="flex flex-col gap-4">
          {/* Skeleton titre */}
          <div className="flex items-start justify-between gap-2">
            <div className={`h-6 flex-1 ${baseSkeleton}`} />
            <div className={`h-5 w-16 ${baseSkeleton}`} />
          </div>

          {/* Skeleton contenu */}
          <div className="space-y-2">
            <div className={`h-4 w-full ${baseSkeleton}`} />
            <div className={`h-4 w-3/4 ${baseSkeleton}`} />
          </div>

          {/* Skeleton métadonnées */}
          <div className="flex items-center justify-between pt-2 border-t border-indigo-nuit/5">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full ${baseSkeleton}`} />
              <div className="space-y-1">
                <div className={`h-3 w-20 ${baseSkeleton}`} />
                <div className={`h-2 w-16 ${baseSkeleton}`} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`h-4 w-12 ${baseSkeleton}`} />
              <div className={`h-4 w-16 ${baseSkeleton}`} />
            </div>
          </div>
        </div>
      )}

      {variant === 'reponse' && (
        <div className="flex flex-col gap-3">
          {/* Skeleton en-tête */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full ${baseSkeleton}`} />
              <div className="space-y-1">
                <div className={`h-4 w-24 ${baseSkeleton}`} />
                <div className={`h-3 w-32 ${baseSkeleton}`} />
              </div>
            </div>
            <div className={`h-5 w-12 ${baseSkeleton}`} />
          </div>

          {/* Skeleton contenu */}
          <div className="space-y-2 pl-11">
            <div className={`h-4 w-full ${baseSkeleton}`} />
            <div className={`h-4 w-5/6 ${baseSkeleton}`} />
            <div className={`h-4 w-4/6 ${baseSkeleton}`} />
          </div>

          {/* Skeleton actions */}
          <div className="flex items-center gap-2 pl-11">
            <div className={`h-8 w-16 ${baseSkeleton}`} />
            <div className={`h-8 w-16 ${baseSkeleton}`} />
          </div>
        </div>
      )}

      {variant === 'groupe' && (
        <div className="flex flex-col gap-4">
          {/* Skeleton en-tête */}
          <div className="flex items-start justify-between gap-2">
            <div className={`h-6 flex-1 ${baseSkeleton}`} />
            <div className={`h-5 w-20 ${baseSkeleton}`} />
          </div>

          {/* Skeleton description */}
          <div className="space-y-2">
            <div className={`h-4 w-full ${baseSkeleton}`} />
            <div className={`h-4 w-2/3 ${baseSkeleton}`} />
          </div>

          {/* Skeleton compteur */}
          <div className="flex items-center gap-2 pt-2">
            <div className={`h-4 w-8 ${baseSkeleton}`} />
            <div className={`h-4 w-16 ${baseSkeleton}`} />
          </div>
        </div>
      )}
    </Card>
  )
}
