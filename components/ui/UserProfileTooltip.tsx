'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Avatar } from './Avatar'
import { Badge, BadgeVariant } from './Badge'

export interface UserProfileTooltipProps {
  userId: string
  userName: string
  userRole?: string
  userFiliere?: string
  userNiveau?: string
  contributionCount?: number
  children: React.ReactNode
  className?: string
}

export const UserProfileTooltip: React.FC<UserProfileTooltipProps> = ({
  userId,
  userName,
  userRole = 'etudiant',
  userFiliere,
  userNiveau,
  contributionCount = 0,
  children,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fermer le tooltip si on clique ailleurs
  useEffect(() => {
    if (!isVisible) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node) &&
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isVisible])

  const handleToggle = () => {
    if (isMobile) {
      setIsVisible(!isVisible)
    }
  }

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsVisible(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsVisible(false)
    }
  }

  const getRoleBadgeVariant = (): BadgeVariant => {
    switch (userRole) {
      case 'mentor': return 'role-mentor'
      case 'enseignant': return 'role-enseignant'
      case 'admin': return 'role-admin'
      default: return 'role-etudiant'
    }
  }

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleToggle}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-50 w-64 bg-white border border-indigo-nuit/10 rounded-xl shadow-lg p-4 animate-fade-in"
          style={{
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px'
          }}
        >
          {/* Flèche */}
          <div 
            className="absolute w-3 h-3 bg-white border-r border-b border-indigo-nuit/10 transform rotate-45"
            style={{
              bottom: '-6px',
              left: '50%',
              marginLeft: '-6px'
            }}
          />

          {/* Contenu du tooltip */}
          <div className="flex flex-col gap-3">
            {/* En-tête avec avatar et nom */}
            <div className="flex items-center gap-3">
              <Avatar name={userName} size="lg" />
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-semibold text-indigo-nuit truncate">
                  {userName}
                </h4>
                <Badge variant={getRoleBadgeVariant()} className="text-[10px] mt-1">
                  {userRole}
                </Badge>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="space-y-2 text-xs">
              {userFiliere && (
                <div className="flex items-center justify-between">
                  <span className="text-brume">Filière</span>
                  <span className="font-medium text-encre">{userFiliere}</span>
                </div>
              )}
              {userNiveau && (
                <div className="flex items-center justify-between">
                  <span className="text-brume">Niveau</span>
                  <span className="font-medium text-encre">{userNiveau}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-indigo-nuit/10">
                <span className="text-brume">Contributions</span>
                <span className="font-mono font-medium text-attaya">{contributionCount}</span>
              </div>
            </div>

            {/* Badge expérimenté si beaucoup de contributions */}
            {contributionCount >= 10 && (
              <div className="pt-2 border-t border-indigo-nuit/10">
                <Badge variant="role-mentor" className="w-full justify-center text-[10px]">
                  ⭐ Contributeur expérimenté
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
