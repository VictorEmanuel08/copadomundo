export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED'
export type MatchPhase =
  | 'GROUP_STAGE'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'THIRD_PLACE'
  | 'FINAL'

export interface Team {
  id: string
  name: string
  shortName: string
  code: string        // ISO 3166-1 alpha-2 para flagcdn
  group: string       // 'A' .. 'L'  (Copa 2026 tem 12 grupos)
}

export interface Score {
  home: number | null
  away: number | null
}

export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  date: string        // ISO 8601
  stadium: string
  city: string
  phase: MatchPhase
  group: string | null
  status: MatchStatus
  score: Score
}

export interface Standing {
  team: Team
  group: string
  position: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}

export interface BracketMatch {
  id: string
  round: MatchPhase
  slot: number        // posição no bracket (1-based)
  homeTeam: Team | null
  awayTeam: Team | null
  score: Score
  status: MatchStatus
  date: string | null
  stadium?: string | null
  city?: string | null
}

export interface FootballAPIAdapter {
  getTeams(): Promise<Team[]>
  getMatches(): Promise<Match[]>
  getStandings(): Promise<Standing[]>
  getBracket(): Promise<BracketMatch[]>
}
