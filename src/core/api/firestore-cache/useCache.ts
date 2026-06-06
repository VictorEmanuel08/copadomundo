import { useState, useEffect } from 'react'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '@/core/firebase/config'

// Generic hook: subscribes to a Firestore cache document via onSnapshot.
// When the Cloud Function writes new data, all clients update instantly.
// Falls back to the provided `fallback` function if the cache is empty or invalid.
export function useFirestoreCache<T>(
  cacheKey: string,
  fallback: () => Promise<T[]>,
  validate?: (data: T[]) => boolean,
): { data: T[] | undefined; isLoading: boolean; isError: boolean } {
  const [data, setData] = useState<T[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const ref = doc(db, 'cache', cacheKey)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const cached = snap.data()?.data as T[] | undefined
          const isValid = cached?.length && (!validate || validate(cached))
          if (isValid) {
            setData(cached)
            setIsLoading(false)
            setIsError(false)
            return
          }
        }
        // Cache vazio ou inválido — chama o fallback
        fallback()
          .then((d) => { setData(d); setIsLoading(false); setIsError(false) })
          .catch(() => { setIsLoading(false); setIsError(true) })
      },
      () => {
        fallback()
          .then((d) => { setData(d); setIsLoading(false); setIsError(false) })
          .catch(() => { setIsLoading(false); setIsError(true) })
      },
    )
    return unsub
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey])

  return { data, isLoading, isError }
}
