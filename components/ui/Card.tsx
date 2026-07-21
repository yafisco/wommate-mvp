import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  ...props
}) => {
  // Styles de base de la carte avec coins asymétriques caractéristiques du concept directeur
  const baseStyles = 'bg-white border border-indigo-nuit/10 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md shadow-sm overflow-hidden transition-all duration-300'
  const hoverStyles = hoverable ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-nuit/20' : ''

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
