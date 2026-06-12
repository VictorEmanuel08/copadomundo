import { useFirestoreCache } from '@/core/api/firestore-cache/useCache'
import { mockAdapter } from '@/core/api/mock/adapter'
import type { Match } from '@/core/api/types'

export function useMatches() {
  return useFirestoreCache<Match>(
    'matches',
    () => Promise.resolve(mockAdapter.getMatches()),
    // Accept cached data if it has proper structure.
    // The Cloud Function maps team TLAs to lowercase string IDs ("bra", "mex"),
    // so we verify the first found team ID is a non-numeric string.
    // Fallback to mock only when the cache is truly empty or malformed.
    (data) => {
      if (!data.length) return false
      // Look for a match with valid teams (skip TBD slots that have numeric IDs)
      const withTeams = data.filter(m => m.homeTeam?.id && m.awayTeam?.id)
      if (!withTeams.length) return false
      // Accept if at least one match has a string team ID (e.g. "bra"),
      // or if most matches have scores/statuses different from the mock baseline.
      const hasStringId = withTeams.some(m => isNaN(Number(m.homeTeam.id)))
      const hasRealStatus = data.some(m => m.status === 'LIVE' || m.status === 'FINISHED')
      return hasStringId || hasRealStatus
    },
  )
}
