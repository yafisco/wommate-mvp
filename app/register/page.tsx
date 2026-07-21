import AuthForm from '@/components/features/auth/AuthForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inscription | Wommate',
  description: 'Rejoignez la plateforme Wommate et la communauté du Grin.',
}

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 my-8">
      <AuthForm mode="register" />
    </div>
  )
}
