import { useEffect, useRef } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '@/core/firebase/config'
import { useAuthStore } from '../store/authStore'
import { REDIRECT_AFTER_LOGIN_KEY } from '../components/AuthGuard'

export function useAuthState() {
  const { setUser, setLoading } = useAuthStore()
  const navigate = useNavigate()
  const prevUid = useRef<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const isNewLogin = prevUid.current === null
        prevUid.current = firebaseUser.uid
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        })
        // Redireciona para a rota salva antes do login (ex: link de convite)
        if (isNewLogin) {
          const redirect = sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)
          if (redirect) {
            sessionStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY)
            navigate(redirect, { replace: true })
          }
        }
      } else {
        prevUid.current = null
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [setUser, setLoading, navigate])
}
