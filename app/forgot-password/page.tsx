import ForgotPasswordForm from '@/components/features/auth/ForgotPasswordForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mot de passe oublié | Wommate',
  description: 'Réinitialisez votre mot de passe Wommate.',
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <ForgotPasswordForm />
    </div>
  )
}
