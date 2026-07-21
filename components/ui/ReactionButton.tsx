'use client'

import React from 'react'

export type ReactionType = 'utile' | 'merci'

export interface ReactionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  reactionType: ReactionType
  count: number
  active?: boolean
  size?: 'sm' | 'md'
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({
  reactionType,
  count,
  active = false,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5'
  }

  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-attaya focus-visible:ring-offset-2 active:scale-95'

  const reactionConfig = {
    utile: {
      icon: active ? '✓' : '○',
      colorClass: active 
        ? 'bg-pousse text-white border-pousse' 
        : 'bg-bone text-pousse border-pousse/30 hover:bg-pousse/10 hover:border-pousse/50',
      label: 'Utile'
    },
    merci: {
      icon: active ? '♥' : '♡',
      colorClass: active 
        ? 'bg-attaya text-encre border-attaya' 
        : 'bg-bone text-attaya border-attaya/30 hover:bg-attaya/10 hover:border-attaya/50',
      label: 'Merci'
    }
  }

  const config = reactionConfig[reactionType]

  return (
    <button
      className={`${baseStyles} ${config.colorClass} ${sizeStyles[size]} border ${className}`}
      title={config.label}
      {...props}
    >
      <span className="text-sm">{config.icon}</span>
      {count > 0 && (
        <span className="font-mono">{count}</span>
      )}
    </button>
  )
}
