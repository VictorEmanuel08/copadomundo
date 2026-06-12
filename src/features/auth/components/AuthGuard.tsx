import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface AuthGuardProps {
  children: ReactNode
}

export const REDIRECT_AFTER_LOGIN_KEY = 'redirectAfterLogin'

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) return null

  if (!user) {
    // Salva a rota completa para redirecionar após login
    sessionStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, location.pathname + location.search)
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
