import AuthForm from '@/components/features/auth/AuthForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion | Wommate',
  description: 'Connectez-vous à la plateforme Wommate pour accéder à votre espace.',
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <AuthForm mode="login" />
    </div>
  )
}
