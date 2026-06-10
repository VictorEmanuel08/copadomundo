import { useFirestoreCache } from '@/core/api/firestore-cache/useCache'
import { mockAdapter } from '@/core/api/mock/adapter'
import type { Match } from '@/core/api/types'

export function useMatches() {
  return useFirestoreCache<Match>(
    'matches',
    // Always fall back to mock data — real API uses numeric team IDs
    // incompatible with the string IDs used throughout the app (favorites, standings, etc.)
    () => Promise.resolve(mockAdapter.getMatches()),
    // Validate: data must use alphabetic mock team IDs (e.g. "bra"), not numeric
    // real-API IDs (e.g. "769"). isNaN distinguishes them.
    (data) => {
      const first = data.find(m => m.homeTeam != null)
      const id = first?.homeTeam?.id
      return !!id && typeof id === 'string' && isNaN(Number(id))
    },
  )
}
