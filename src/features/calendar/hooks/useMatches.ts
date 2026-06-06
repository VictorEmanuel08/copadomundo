import { useFirestoreCache } from '@/core/api/firestore-cache/useCache'
import { api } from '@/core/api/adapter'
import { mockAdapter } from '@/core/api/mock/adapter'
import type { Match } from '@/core/api/types'

export function useMatches() {
  return useFirestoreCache<Match>('matches', async () => {
    try {
      return await api.getMatches()
    } catch {
      return mockAdapter.getMatches()
    }
  })
}
