import { useMemo } from 'react'
import { useFirestoreCache } from '@/core/api/firestore-cache/useCache'
import { useMatches } from '@/features/calendar/hooks/useMatches'
import { mockAdapter } from '@/core/api/mock/adapter'
import { TEAMS } from '@/core/api/mock/teams'
import type { Standing, Match } from '@/core/api/types'

// Mapeia o ID que o time tem no match (pode ser numérico da API) para o ID mock
function resolveTeamId(apiTeam: { id: string; code: string; name: string }, map: Record<string, Standing>): string {
  if (map[apiTeam.id]) return apiTeam.id
  // Tenta achar pelo código ISO (flag code) ou shortName
  const byCode = TEAMS.find(t => t.code.toLowerCase() === apiTeam.code?.toLowerCase())
  if (byCode && map[byCode.id]) return byCode.id
  const byName = TEAMS.find(t => t.name.toLowerCase() === apiTeam.name?.toLowerCase())
  if (byName && map[byName.id]) return byName.id
  return apiTeam.id
}

// Confere se cada time do cache está no grupo oficial (conforme TEAMS).
// Protege contra cache antigo do Firestore com grupos desatualizados.
function groupsMatchOfficial(standings: Standing[]): boolean {
  return standings.every((s) => {
    const team = TEAMS.find((t) => t.id === s.team.id)
    return !team || !team.group || team.group === s.group
  })
}

function computeStandings(matches: Match[]): Standing[] {
  const map: Record<string, Standing> = {}

  for (const team of TEAMS) {
    if (!team.group) continue
    map[team.id] = {
      team, group: team.group, position: 0,
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
    }
  }

  for (const m of matches) {
    if (m.phase !== 'GROUP_STAGE') continue
    if (m.status !== 'FINISHED' && m.status !== 'LIVE') continue
    if (m.score.home === null || m.score.away === null) continue

    const hId = resolveTeamId(m.homeTeam, map)
    const aId = resolveTeamId(m.awayTeam, map)

    // Adiciona times desconhecidos ao mapa (sem duplicar mock)
    if (!map[hId] && m.homeTeam.group) {
      map[hId] = { team: m.homeTeam, group: m.homeTeam.group, position: 0, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0 }
    }
    if (!map[aId] && m.awayTeam.group) {
      map[aId] = { team: m.awayTeam, group: m.awayTeam.group, position: 0, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0 }
    }

    const h = map[hId]
    const a = map[aId]
    if (!h || !a) continue

    const hg = m.score.home
    const ag = m.score.away
    h.played++; a.played++
    h.goalsFor += hg; h.goalsAgainst += ag; h.goalDiff += hg - ag
    a.goalsFor += ag; a.goalsAgainst += hg; a.goalDiff += ag - hg
    if (hg > ag)      { h.won++; h.points += 3; a.lost++ }
    else if (hg < ag) { a.won++; a.points += 3; h.lost++ }
    else              { h.drawn++; h.points += 1; a.drawn++; a.points += 1 }
  }

  return Object.values(map)
}

export function useStandings() {
  const { data: matches } = useMatches()

  const fromMatches = useMemo<Standing[] | undefined>(() => {
    if (!matches) return undefined
    return computeStandings(matches)
  }, [matches])

  const cache = useFirestoreCache<Standing>(
    'standings',
    () => mockAdapter.getStandings(),
    // Cache só é aceito se tiver jogos disputados E os grupos baterem com os
    // oficiais (TEAMS). Cache antigo do Firestore com grupos errados é rejeitado
    // e cai no fallback (CURRENT_STANDINGS).
    (data) => data.length > 0 && data.some((s) => s.played > 0) && groupsMatchOfficial(data),
  )

  const hasRealCache = cache.data?.some((s) => s.played > 0) ?? false
  const data = hasRealCache ? cache.data : (fromMatches ?? cache.data)
  const isLoading = cache.isLoading && !fromMatches
  const isError = cache.isError && !fromMatches

  return { data, isLoading, isError }
}
