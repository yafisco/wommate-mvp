'use client'

import React from 'react'

export interface TagChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tag: string
  variant?: 'default' | 'filterable' | 'removable'
  active?: boolean
  onRemove?: () => void
  size?: 'sm' | 'md'
}

export const TagChip: React.FC<TagChipProps> = ({
  tag,
  variant = 'default',
  active = false,
  onRemove,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs'
  }

  const baseStyles = 'inline-flex items-center gap-1.5 rounded-full font-medium font-mono transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-attaya focus-visible:ring-offset-2'

  const variantStyles = {
    default: 'bg-bone text-indigo-nuit border border-indigo-nuit/15 hover:border-indigo-nuit/30',
    filterable: `${active ? 'bg-attaya text-encre border-attaya' : 'bg-bone text-indigo-nuit border border-indigo-nuit/15 hover:border-indigo-nuit/30'} cursor-pointer`,
    removable: 'bg-bone text-indigo-nuit border border-indigo-nuit/15 hover:border-terre hover:bg-terre/5'
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      <span className="truncate max-w-[100px]">#{tag}</span>
      {variant === 'removable' && onRemove && (
        <span 
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="text-brume hover:text-terre transition-colors"
        >
          ×
        </span>
      )}
    </button>
  )
}
