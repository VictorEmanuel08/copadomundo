import { useFirestoreCache } from '@/core/api/firestore-cache/useCache'
import { mockAdapter } from '@/core/api/mock/adapter'
import { MATCH_VENUES } from '@/core/api/mock/matches'
import type { Match } from '@/core/api/types'

function enrichVenues(matches: Match[]): Match[] {
  return matches.map((m) => {
    if (m.stadium && m.city) return m
    const venue = MATCH_VENUES[m.id]
    if (!venue) return m
    return { ...m, stadium: venue.stadium, city: venue.city }
  })
}

export function useMatches() {
  return useFirestoreCache<Match>(
    'matches',
    () => Promise.resolve(mockAdapter.getMatches()),
    (data) => {
      if (!data.length) return false
      const withTeams = data.filter(m => m.homeTeam?.id && m.awayTeam?.id)
      if (!withTeams.length) return false
      const hasStringId = withTeams.some(m => isNaN(Number(m.homeTeam.id)))
      const hasRealStatus = data.some(m => m.status === 'LIVE' || m.status === 'FINISHED')
      return hasStringId || hasRealStatus
    },
    enrichVenues,
  )
}
