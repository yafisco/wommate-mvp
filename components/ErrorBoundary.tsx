'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bone">
          <div className="max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-terre/10 text-terre flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-display font-bold text-indigo-nuit mb-2">
                Une erreur est survenue
              </h2>
              
              <p className="text-sm text-brume mb-6">
                {this.state.error?.message || 'Une erreur inattendue s\'est produite. Veuillez réessayer.'}
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Recharger la page
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
