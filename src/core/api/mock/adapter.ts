import type { FootballAPIAdapter, Match, Standing, BracketMatch, Team } from '../types'
import { TEAMS } from './teams'
import { GROUP_MATCHES } from './matches'
import { INITIAL_STANDINGS } from './standings'

// ══════════════════════════════════════════════════════════════════════
// Chaveamento Eliminatório — Datas e Sedes Oficiais FIFA 2026
// IDs prefixados para garantir ordenação alfabética correta por fase
// ══════════════════════════════════════════════════════════════════════

const BRACKET_MATCHES: BracketMatch[] = [
  // ── Round of 32 (16-avos) — 29 jun a 3 jul ─────────────────────────
  // slot 0: m73 – 2A vs 2B
  { id: 'bk-r32-00', round: 'ROUND_OF_32', slot: 73, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-06-29T21:00:00Z', stadium: 'MetLife Stadium',         city: 'Nova York, EUA' },
  // slot 1: m74 – 1E vs 3rd
  { id: 'bk-r32-01', round: 'ROUND_OF_32', slot: 74, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-06-29T18:00:00Z', stadium: 'SoFi Stadium',            city: 'Los Angeles, EUA' },
  // slot 2: m75 – 1F vs 2C
  { id: 'bk-r32-02', round: 'ROUND_OF_32', slot: 75, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-06-30T21:00:00Z', stadium: "Levi's Stadium",          city: 'São José, EUA' },
  // slot 3: m76 – 1C vs 2F
  { id: 'bk-r32-03', round: 'ROUND_OF_32', slot: 76, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-06-30T18:00:00Z', stadium: 'Rose Bowl',               city: 'Los Angeles, EUA' },
  // slot 4: m77 – 1I vs 3rd
  { id: 'bk-r32-04', round: 'ROUND_OF_32', slot: 77, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-01T18:00:00Z', stadium: 'AT&T Stadium',            city: 'Dallas, EUA' },
  // slot 5: m78 – 2E vs 2I
  { id: 'bk-r32-05', round: 'ROUND_OF_32', slot: 78, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-01T21:00:00Z', stadium: 'Gillette Stadium',        city: 'Boston, EUA' },
  // slot 6: m79 – 1A vs 3rd
  { id: 'bk-r32-06', round: 'ROUND_OF_32', slot: 79, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-02T21:00:00Z', stadium: 'Estadio Azteca',          city: 'Cidade do México, México' },
  // slot 7: m80 – 1L vs 3rd
  { id: 'bk-r32-07', round: 'ROUND_OF_32', slot: 80, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-02T18:00:00Z', stadium: 'Lincoln Financial Field', city: 'Philadelphia, EUA' },
  // slot 8: m81 – 1D vs 3rd
  { id: 'bk-r32-08', round: 'ROUND_OF_32', slot: 81, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-01T01:00:00Z', stadium: 'Lumen Field',             city: 'Seattle, EUA' },
  // slot 9: m82 – 1G vs 3rd
  { id: 'bk-r32-09', round: 'ROUND_OF_32', slot: 82, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-03T18:00:00Z', stadium: 'BC Place',                city: 'Vancouver, Canadá' },
  // slot 10: m83 – 2K vs 2L
  { id: 'bk-r32-10', round: 'ROUND_OF_32', slot: 83, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-06-29T01:00:00Z', stadium: 'Allegiant Stadium',       city: 'Las Vegas, EUA' },
  // slot 11: m84 – 1H vs 2J
  { id: 'bk-r32-11', round: 'ROUND_OF_32', slot: 84, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-03T21:00:00Z', stadium: 'Estadio BBVA',            city: 'Monterrey, México' },
  // slot 12: m85 – 1B vs 3rd
  { id: 'bk-r32-12', round: 'ROUND_OF_32', slot: 85, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-02T01:00:00Z', stadium: 'Arrowhead Stadium',       city: 'Kansas City, EUA' },
  // slot 13: m86 – 1J vs 2H
  { id: 'bk-r32-13', round: 'ROUND_OF_32', slot: 86, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-03T01:00:00Z', stadium: 'Commanders Field',        city: 'Washington D.C., EUA' },
  // slot 14: m87 – 1K vs 3rd
  { id: 'bk-r32-14', round: 'ROUND_OF_32', slot: 87, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-03T04:00:00Z', stadium: 'BMO Field',               city: 'Toronto, Canadá' },
  // slot 15: m88 – 2D vs 2G
  { id: 'bk-r32-15', round: 'ROUND_OF_32', slot: 88, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-01T04:00:00Z', stadium: 'Estadio Akron',           city: 'Guadalajara, México' },

  // ── Round of 16 (Oitavas) — 4 a 7 jul ──────────────────────────────
  { id: 'bk-r16-00', round: 'ROUND_OF_16', slot: 89, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-04T21:00:00Z', stadium: 'AT&T Stadium',            city: 'Dallas, EUA' },
  { id: 'bk-r16-01', round: 'ROUND_OF_16', slot: 90, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-04T18:00:00Z', stadium: 'MetLife Stadium',         city: 'Nova York, EUA' },
  { id: 'bk-r16-02', round: 'ROUND_OF_16', slot: 91, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-05T21:00:00Z', stadium: 'SoFi Stadium',            city: 'Los Angeles, EUA' },
  { id: 'bk-r16-03', round: 'ROUND_OF_16', slot: 92, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-05T18:00:00Z', stadium: "Levi's Stadium",          city: 'São José, EUA' },
  { id: 'bk-r16-04', round: 'ROUND_OF_16', slot: 93, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-06T21:00:00Z', stadium: 'Estadio Azteca',          city: 'Cidade do México, México' },
  { id: 'bk-r16-05', round: 'ROUND_OF_16', slot: 94, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-06T18:00:00Z', stadium: 'Rose Bowl',               city: 'Los Angeles, EUA' },
  { id: 'bk-r16-06', round: 'ROUND_OF_16', slot: 95, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-07T21:00:00Z', stadium: 'Gillette Stadium',        city: 'Boston, EUA' },
  { id: 'bk-r16-07', round: 'ROUND_OF_16', slot: 96, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-07T18:00:00Z', stadium: 'BC Place',                city: 'Vancouver, Canadá' },

  // ── Quartas de Final — 10 e 11 jul ──────────────────────────────────
  { id: 'bk-qf-00', round: 'QUARTER_FINALS', slot: 97,  homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-10T21:00:00Z', stadium: 'MetLife Stadium',     city: 'Nova York, EUA' },
  { id: 'bk-qf-01', round: 'QUARTER_FINALS', slot: 98,  homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-10T18:00:00Z', stadium: 'AT&T Stadium',        city: 'Dallas, EUA' },
  { id: 'bk-qf-02', round: 'QUARTER_FINALS', slot: 99,  homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-11T21:00:00Z', stadium: 'SoFi Stadium',        city: 'Los Angeles, EUA' },
  { id: 'bk-qf-03', round: 'QUARTER_FINALS', slot: 100, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-11T18:00:00Z', stadium: 'Estadio Azteca',      city: 'Cidade do México, México' },

  // ── Semifinais — 14 e 15 jul ────────────────────────────────────────
  { id: 'bk-sf-00', round: 'SEMI_FINALS', slot: 101, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-14T21:00:00Z', stadium: 'MetLife Stadium',        city: 'Nova York, EUA' },
  { id: 'bk-sf-01', round: 'SEMI_FINALS', slot: 102, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-15T21:00:00Z', stadium: 'AT&T Stadium',           city: 'Dallas, EUA' },

  // ── Disputa de 3º Lugar — 18 jul ────────────────────────────────────
  { id: 'bk-tp-00', round: 'THIRD_PLACE', slot: 103, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-18T18:00:00Z', stadium: "Levi's Stadium",         city: 'São José, EUA' },

  // ── Grande Final — 19 jul ────────────────────────────────────────────
  { id: 'bk-fi-00', round: 'FINAL', slot: 104, homeTeam: null, awayTeam: null, score: { home: null, away: null }, status: 'SCHEDULED', date: '2026-07-19T21:00:00Z', stadium: 'MetLife Stadium',              city: 'Nova York, EUA' },
]

export const mockAdapter: FootballAPIAdapter = {
  async getTeams(): Promise<Team[]> {
    return TEAMS
  },

  async getMatches(): Promise<Match[]> {
    return GROUP_MATCHES
  },

  async getStandings(): Promise<Standing[]> {
    return INITIAL_STANDINGS
  },

  async getBracket(): Promise<BracketMatch[]> {
    return BRACKET_MATCHES
  },
}
