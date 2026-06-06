import { useFirestoreCache } from '@/core/api/firestore-cache/useCache'
import { api } from '@/core/api/adapter'
import { mockAdapter } from '@/core/api/mock/adapter'
import type { BracketMatch } from '@/core/api/types'

export function useBracket() {
  return useFirestoreCache<BracketMatch>('bracket', async () => {
    try {
      return await api.getBracket()
    } catch {
      return mockAdapter.getBracket()
    }
  })
}
