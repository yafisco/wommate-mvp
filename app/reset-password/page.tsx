import ResetPasswordForm from '@/components/features/auth/ResetPasswordForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Réinitialiser mot de passe | Wommate',
  description: 'Définissez votre nouveau mot de passe Wommate.',
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <ResetPasswordForm />
    </div>
  )
}
