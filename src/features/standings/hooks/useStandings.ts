import { useMemo } from 'react'
import { useMatches } from '@/features/calendar/hooks/useMatches'
import { TEAMS } from '@/core/api/mock/teams'
import type { Standing, Match } from '@/core/api/types'

function computeStandings(matches: Match[]): Standing[] {
  const map: Record<string, Standing> = {}

  for (const team of TEAMS) {
    if (!team.group) continue
    map[team.id] = {
      team,
      group: team.group,
      position: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    }
  }

  for (const m of matches) {
    if (m.phase !== 'GROUP_STAGE') continue
    if (m.status !== 'FINISHED' && m.status !== 'LIVE') continue
    if (m.score.home === null || m.score.away === null) continue
    const h = map[m.homeTeam?.id]
    const a = map[m.awayTeam?.id]
    if (!h || !a) continue
    const hg = m.score.home
    const ag = m.score.away
    h.played++; a.played++
    h.goalsFor += hg; h.goalsAgainst += ag; h.goalDiff += hg - ag
    a.goalsFor += ag; a.goalsAgainst += hg; a.goalDiff += ag - hg
    if (hg > ag) { h.won++; h.points += 3; a.lost++ }
    else if (hg < ag) { a.won++; a.points += 3; h.lost++ }
    else { h.drawn++; h.points += 1; a.drawn++; a.points += 1 }
  }

  return Object.values(map)
}

export function useStandings() {
  const { data: matches, isLoading, isError } = useMatches()

  const data = useMemo<Standing[] | undefined>(() => {
    if (!matches) return undefined
    return computeStandings(matches)
  }, [matches])

  return { data, isLoading, isError }
}
