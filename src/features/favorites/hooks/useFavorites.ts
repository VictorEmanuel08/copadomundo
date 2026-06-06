import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/core/firebase/config'
import { useAuthStore } from '@/features/auth/store/authStore'

const LOCAL_KEY = 'copa2026_favorites'
const EVENT_NAME = 'copa2026-favorites-updated'

export function useFavorites() {
  const { user } = useAuthStore()
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      // Ouvinte em tempo real no Firestore
      const ref = collection(db, 'users', user.uid, 'favorites')
      const unsub = onSnapshot(ref, (snap) => {
        setFavoriteIds(snap.docs.map((d) => d.id))
      }, (err) => {
        console.error('[Favorites] Firestore error:', err)
      })

      // Migração: copia favoritos locais para o Firestore no primeiro login
      const local = localStorage.getItem(LOCAL_KEY)
      if (local) {
        try {
          const pendingIds: string[] = JSON.parse(local)
          if (pendingIds.length > 0) {
            Promise.all(
              pendingIds.map((id) =>
                setDoc(doc(db, 'users', user.uid, 'favorites', id), {
                  teamId: id,
                  addedAt: serverTimestamp(),
                })
              )
            ).then(() => localStorage.removeItem(LOCAL_KEY)).catch(console.error)
          }
        } catch { /* ignore parse errors */ }
      }

      return unsub
    } else {
      const loadLocal = () => {
        const local = localStorage.getItem(LOCAL_KEY)
        setFavoriteIds(local ? JSON.parse(local) : [])
      }
      loadLocal()
      window.addEventListener(EVENT_NAME, loadLocal)
      return () => window.removeEventListener(EVENT_NAME, loadLocal)
    }
  }, [user])

  async function toggleFavorite(teamId: string) {
    const isFav = favoriteIds.includes(teamId)

    if (user) {
      // Atualização otimista — atualiza UI imediatamente
      setFavoriteIds((prev) =>
        isFav ? prev.filter((id) => id !== teamId) : [...prev, teamId]
      )
      const ref = doc(db, 'users', user.uid, 'favorites', teamId)
      try {
        if (isFav) {
          await deleteDoc(ref)
        } else {
          await setDoc(ref, { teamId, addedAt: serverTimestamp() })
        }
      } catch (err) {
        // Rollback em caso de erro
        console.error('[Favorites] Write failed, rolling back:', err)
        setFavoriteIds((prev) =>
          isFav ? [...prev, teamId] : prev.filter((id) => id !== teamId)
        )
      }
    } else {
      const next = isFav
        ? favoriteIds.filter((id) => id !== teamId)
        : [...favoriteIds, teamId]
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next))
      setFavoriteIds(next)
      window.dispatchEvent(new Event(EVENT_NAME))
    }
  }

  return { favoriteIds, toggleFavorite }
}
