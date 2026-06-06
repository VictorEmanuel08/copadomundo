import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuthStore()

  if (loading) return null

  if (!user) return <Navigate to="/" replace />

  return <>{children}</>
}
