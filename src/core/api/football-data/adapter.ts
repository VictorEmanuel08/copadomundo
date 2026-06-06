// ══════════════════════════════════════════════════════════════════════
// Adapter: football-data.org v4 — Plano gratuito (TIER_ONE)
// Competição: FIFA World Cup 2026 (code "WC", id 2000)
// Limite: 10 req/min | Header obrigatório: X-Auth-Token
// Registre-se: https://www.football-data.org/client/register
// ══════════════════════════════════════════════════════════════════════

import type {
  FootballAPIAdapter, Match, Team, Standing, BracketMatch, MatchStatus, MatchPhase,
} from '../types'
import { TEAM_MAP } from './teamMap'
import { TEAMS } from '../mock/teams'

// Em dev: proxy Vite via /fd-api (evita CORS)
// Em produção: configure um edge/cloud function e aponte BASE para lá
const BASE = '/fd-api/v4'

// ── HTTP helper com tratamento de throttle ───────────────────────────
async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  // Respeita o throttle automático indicado no e-mail de boas-vindas
  const remaining = Number(res.headers.get('X-Requests-Available-Minute') ?? 999)
  if (remaining < 3) {
    console.warn(`[football-data] Requisições restantes: ${remaining}/min`)
  }
  if (!res.ok) {
    throw new Error(`football-data.org ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ── Helpers de mapeamento ────────────────────────────────────────────
function mapStatus(s: string): MatchStatus {
  if (s === 'IN_PLAY' || s === 'PAUSED')   return 'LIVE'
  if (s === 'FINISHED')                     return 'FINISHED'
  if (s === 'POSTPONED' || s === 'CANCELLED') return 'POSTPONED'
  // TIMED = agendado com hora definida; SCHEDULED = sem hora ainda
  return 'SCHEDULED'
}

function mapPhase(stage: string): MatchPhase {
  const map: Record<string, MatchPhase> = {
    GROUP_STAGE:    'GROUP_STAGE',
    ROUND_OF_32:    'ROUND_OF_32',
    ROUND_OF_16:    'ROUND_OF_16',
    QUARTER_FINALS: 'QUARTER_FINALS',
    SEMI_FINALS:    'SEMI_FINALS',
    THIRD_PLACE:    'THIRD_PLACE',
    FINAL:          'FINAL',
  }
  return map[stage] ?? 'GROUP_STAGE'
}

// group "GROUP_A" → "A"
function mapGroup(g: string | null): string | null {
  if (!g) return null
  return g.replace('GROUP_', '') || null
}

// Usa TLA para buscar ISO2 + nome em português
function mapTeamRaw(raw: {
  id: number; name: string; shortName: string; tla: string; crest: string
}, group?: string): Team {
  const tla = raw.tla?.toUpperCase() ?? ''
  const mapped = TEAM_MAP[tla]
  const targetShortName = mapped?.shortName ?? raw.tla
  const matchingTeam = TEAMS.find(
    (t) =>
      t.shortName.toUpperCase() === targetShortName.toUpperCase() ||
      t.name.toLowerCase() === (mapped?.name ?? raw.name).toLowerCase()
  )
  const resolvedGroup = group || matchingTeam?.group || ''
  return {
    id:        matchingTeam ? matchingTeam.id : String(raw.id),
    name:      mapped?.name      ?? raw.name,
    shortName: mapped?.shortName ?? raw.tla,
    code:      mapped?.code      ?? 'un',
    group:     resolvedGroup,
  }
}

// ── Tipos internos da API ────────────────────────────────────────────
interface ApiTeam {
  id: number; name: string; shortName: string; tla: string; crest: string
}

interface ApiScore {
  winner: string | null
  duration: string
  fullTime: { home: number | null; away: number | null }
  halfTime:  { home: number | null; away: number | null }
}

interface ApiMatch {
  id: number
  utcDate: string
  status: string
  stage: string
  group: string | null
  homeTeam: ApiTeam
  awayTeam: ApiTeam
  score: ApiScore
  venue?: { name?: string; city?: string }
}

interface ApiStandingRow {
  position: number
  team: ApiTeam
  playedGames: number
  won: number
  draw: number   // ← "draw" não "drawn" na API
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

interface ApiStandingSection {
  stage: string
  type: string
  group: string
  table: ApiStandingRow[]
}

// ══════════════════════════════════════════════════════════════════════
export const footballDataAdapter: FootballAPIAdapter = {

  async getTeams(): Promise<Team[]> {
    const data = await apiFetch<{ teams: ApiTeam[] }>('/competitions/WC/teams?season=2026')
    return data.teams.map((t) => mapTeamRaw(t))
  },

  async getMatches(): Promise<Match[]> {
    const data = await apiFetch<{ matches: ApiMatch[] }>('/competitions/WC/matches?season=2026')
    return data.matches.map((m) => {
      const group = mapGroup(m.group)
      return {
        id:       String(m.id),
        homeTeam: mapTeamRaw(m.homeTeam, group ?? ''),
        awayTeam: mapTeamRaw(m.awayTeam, group ?? ''),
        date:     m.utcDate,
        stadium:  m.venue?.name ?? '',
        city:     m.venue?.city ?? '',
        phase:    mapPhase(m.stage),
        group,
        status:   mapStatus(m.status),
        score: {
          home: m.score.fullTime.home,
          away: m.score.fullTime.away,
        },
      }
    })
  },

  async getStandings(): Promise<Standing[]> {
    const data = await apiFetch<{ standings: ApiStandingSection[] }>(
      '/competitions/WC/standings?season=2026',
    )
    const result: Standing[] = []
    for (const section of data.standings) {
      if (section.type !== 'TOTAL') continue
      const sectionGroup = mapGroup(section.group)
      for (const row of section.table ?? []) {
        const team = mapTeamRaw(row.team, sectionGroup ?? undefined)
        result.push({
          team,
          group:        team.group,
          position:     row.position,
          played:       row.playedGames,
          won:          row.won,
          drawn:        row.draw,       // API usa "draw"
          lost:         row.lost,
          goalsFor:     row.goalsFor,
          goalsAgainst: row.goalsAgainst,
          goalDiff:     row.goalDifference,
          points:       row.points,
        })
      }
    }
    return result
  },

  async getBracket(): Promise<BracketMatch[]> {
    const stages = [
      'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS',
      'SEMI_FINALS', 'THIRD_PLACE', 'FINAL',
    ].join(',')
    const data = await apiFetch<{ matches: ApiMatch[] }>(
      `/competitions/WC/matches?season=2026&stage=${stages}`,
    )
    return data.matches.map((m, i) => ({
      id:       String(m.id),
      round:    mapPhase(m.stage),
      slot:     i + 1,
      homeTeam: m.homeTeam?.id ? mapTeamRaw(m.homeTeam) : null,
      awayTeam: m.awayTeam?.id ? mapTeamRaw(m.awayTeam) : null,
      score: {
        home: m.score.fullTime.home,
        away: m.score.fullTime.away,
      },
      status: mapStatus(m.status),
      date:   m.utcDate ?? null,
      stadium: m.venue?.name ?? '',
      city:   m.venue?.city ?? '',
    }))
  },
}
