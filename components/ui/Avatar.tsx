import React from 'react'

export interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '?',
  size = 'md',
  className = ''
}) => {
  // Dimensionnement
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg'
  }

  // Obtenir les initiales (ex: "Moustapha Diop" -> "MD")
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  // Choisir une couleur de fond selon le nom pour créer de la variété
  const getBgColor = (text: string) => {
    const colors = [
      'bg-indigo-nuit text-bone',
      'bg-attaya text-encre',
      'bg-pousse text-white',
      'bg-terre text-white',
      'bg-brume text-white'
    ]
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  const initials = getInitials(name)
  const bgClass = getBgColor(name)

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 border border-indigo-nuit/10 ${sizeClasses[size]} ${bgClass} ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="font-semibold font-mono tracking-wider">{initials}</span>
      )}
    </div>
  )
}
