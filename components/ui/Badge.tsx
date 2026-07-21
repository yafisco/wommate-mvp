import React from 'react'

export type BadgeVariant = 'filiere' | 'statut-ouverte' | 'statut-en-cours' | 'statut-resolue' | 'role-etudiant' | 'role-mentor' | 'role-enseignant' | 'role-admin' | 'default'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono uppercase tracking-wider transition-colors duration-200'

  const variantStyles = {
    default: 'bg-indigo-nuit/10 text-indigo-nuit',
    filiere: 'bg-attaya/10 text-encre border border-attaya/30',
    'statut-ouverte': 'bg-pousse/10 text-pousse border border-pousse/20',
    'statut-en-cours': 'bg-attaya/10 text-[#a06810] border border-attaya/20',
    'statut-resolue': 'bg-indigo-nuit/10 text-brume border border-indigo-nuit/20',
    'role-etudiant': 'bg-indigo-nuit/10 text-indigo-nuit',
    'role-mentor': 'bg-pousse/10 text-pousse border border-pousse/20',
    'role-enseignant': 'bg-attaya/20 text-encre',
    'role-admin': 'bg-terre/10 text-terre border border-terre/20'
  }

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
