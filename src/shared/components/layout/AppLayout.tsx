import { useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'
import { useAuthStore } from '@/features/auth/store/authStore'
import { REDIRECT_AFTER_LOGIN_KEY } from '@/features/auth/components/AuthGuard'

function LoginRedirectHandler() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const prevUid = useRef<string | null>(null)

  useEffect(() => {
    if (user && prevUid.current === null) {
      const redirect = sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)
      if (redirect) {
        sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY)
        navigate(redirect, { replace: true })
      }
    }
    prevUid.current = user?.uid ?? null
  }, [user, navigate])

  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <LoginRedirectHandler />
      <ScrollToTop />
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 pb-24 pt-4 sm:px-4 md:pb-8 lg:px-6">
        <Outlet />
      </main>
      <BottomNav />
      <Footer />
    </div>
  )
}
