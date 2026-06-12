import { onSchedule } from 'firebase-functions/v2/scheduler'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

initializeApp()
const db = getFirestore()

const BASE = 'https://api.football-data.org/v4'

const TEAM_MAP: Record<string, { code: string; name: string; shortName: string }> = {
  MEX: { code: 'mx',     name: 'México',              shortName: 'MEX' },
  RSA: { code: 'za',     name: 'África do Sul',       shortName: 'AFS' },
  KOR: { code: 'kr',     name: 'Coreia do Sul',       shortName: 'COR' },
  CZE: { code: 'cz',     name: 'Rep. Tcheca',         shortName: 'CZE' },
  CAN: { code: 'ca',     name: 'Canadá',              shortName: 'CAN' },
  BIH: { code: 'ba',     name: 'Bósnia-Herzegovina',  shortName: 'BIH' },
  QAT: { code: 'qa',     name: 'Catar',               shortName: 'CAT' },
  SUI: { code: 'ch',     name: 'Suíça',               shortName: 'SUI' },
  BRA: { code: 'br',     name: 'Brasil',              shortName: 'BRA' },
  MAR: { code: 'ma',     name: 'Marrocos',            shortName: 'MAR' },
  HAI: { code: 'ht',     name: 'Haiti',               shortName: 'HAI' },
  SCO: { code: 'gb-sct', name: 'Escócia',             shortName: 'ESC' },
  USA: { code: 'us',     name: 'Estados Unidos',      shortName: 'EUA' },
  PAR: { code: 'py',     name: 'Paraguai',            shortName: 'PAR' },
  AUS: { code: 'au',     name: 'Austrália',           shortName: 'AUS' },
  TUR: { code: 'tr',     name: 'Turquia',             shortName: 'TUR' },
  GER: { code: 'de',     name: 'Alemanha',            shortName: 'ALE' },
  CUW: { code: 'cw',     name: 'Curaçao',             shortName: 'CUW' },
  CIV: { code: 'ci',     name: 'Costa do Marfim',     shortName: 'CDM' },
  ECU: { code: 'ec',     name: 'Equador',             shortName: 'ECU' },
  NED: { code: 'nl',     name: 'Países Baixos',       shortName: 'HOL' },
  JPN: { code: 'jp',     name: 'Japão',               shortName: 'JAP' },
  SWE: { code: 'se',     name: 'Suécia',              shortName: 'SUE' },
  TUN: { code: 'tn',     name: 'Tunísia',             shortName: 'TUN' },
  BEL: { code: 'be',     name: 'Bélgica',             shortName: 'BEL' },
  EGY: { code: 'eg',     name: 'Egito',               shortName: 'EGI' },
  IRN: { code: 'ir',     name: 'Irã',                 shortName: 'IRÃ' },
  NZL: { code: 'nz',     name: 'Nova Zelândia',       shortName: 'NZL' },
  ESP: { code: 'es',     name: 'Espanha',             shortName: 'ESP' },
  CPV: { code: 'cv',     name: 'Cabo Verde',          shortName: 'CPV' },
  KSA: { code: 'sa',     name: 'Arábia Saudita',      shortName: 'ARS' },
  URY: { code: 'uy',     name: 'Uruguai',             shortName: 'URU' },
  FRA: { code: 'fr',     name: 'França',              shortName: 'FRA' },
  SEN: { code: 'sn',     name: 'Senegal',             shortName: 'SEN' },
  IRQ: { code: 'iq',     name: 'Iraque',              shortName: 'IRQ' },
  NOR: { code: 'no',     name: 'Noruega',             shortName: 'NOR' },
  ARG: { code: 'ar',     name: 'Argentina',           shortName: 'ARG' },
  ALG: { code: 'dz',     name: 'Argélia',             shortName: 'ALG' },
  AUT: { code: 'at',     name: 'Áustria',             shortName: 'AUT' },
  JOR: { code: 'jo',     name: 'Jordânia',            shortName: 'JOR' },
  POR: { code: 'pt',     name: 'Portugal',            shortName: 'POR' },
  COD: { code: 'cd',     name: 'Rep. Dem. do Congo',  shortName: 'COD' },
  UZB: { code: 'uz',     name: 'Uzbequistão',         shortName: 'UZB' },
  COL: { code: 'co',     name: 'Colômbia',            shortName: 'COL' },
  ENG: { code: 'gb-eng', name: 'Inglaterra',          shortName: 'ENG' },
  CRO: { code: 'hr',     name: 'Croácia',             shortName: 'CRO' },
  GHA: { code: 'gh',     name: 'Gana',                shortName: 'GAN' },
  PAN: { code: 'pa',     name: 'Panamá',              shortName: 'PAN' },
}

interface ApiTeam {
  id: number; name: string; shortName: string; tla: string; crest: string
}
interface ApiScore {
  winner: string | null
  fullTime: { home: number | null; away: number | null }
}
interface ApiMatch {
  id: number; utcDate: string; status: string; stage: string
  group: string | null
  homeTeam: ApiTeam; awayTeam: ApiTeam
  score: ApiScore
  venue?: { name?: string; city?: string }
}
interface ApiStandingRow {
  position: number; team: ApiTeam
  playedGames: number; won: number; draw: number; lost: number
  points: number; goalsFor: number; goalsAgainst: number; goalDifference: number
}
interface ApiStandingSection {
  type: string; group: string; table: ApiStandingRow[]
}

function mapStatus(s: string) {
  if (s === 'IN_PLAY' || s === 'PAUSED') return 'LIVE'
  if (s === 'FINISHED') return 'FINISHED'
  if (s === 'POSTPONED' || s === 'CANCELLED') return 'POSTPONED'
  return 'SCHEDULED'
}

function mapPhase(stage: string) {
  const map: Record<string, string> = {
    GROUP_STAGE: 'GROUP_STAGE', ROUND_OF_32: 'ROUND_OF_32',
    ROUND_OF_16: 'ROUND_OF_16', QUARTER_FINALS: 'QUARTER_FINALS',
    SEMI_FINALS: 'SEMI_FINALS', THIRD_PLACE: 'THIRD_PLACE', FINAL: 'FINAL',
  }
  return map[stage] ?? 'GROUP_STAGE'
}

// Grupo de cada seleção no sorteio da Copa 2026
const TLA_GROUP: Record<string, string> = {
  MEX: 'A', RSA: 'A', KOR: 'A', CZE: 'A',
  CAN: 'B', BIH: 'B', QAT: 'B', SUI: 'B',
  BRA: 'C', MAR: 'C', HAI: 'C', SCO: 'C',
  USA: 'D', PAR: 'D', AUS: 'D', TUR: 'D',
  GER: 'E', CUW: 'E', CIV: 'E', ECU: 'E',
  NED: 'F', JPN: 'F', SWE: 'F', TUN: 'F',
  BEL: 'G', EGY: 'G', KSA: 'G', URY: 'G',
  IRN: 'H', NZL: 'H', ESP: 'H', CPV: 'H',
  FRA: 'I', SEN: 'I', IRQ: 'I', NOR: 'I',
  ARG: 'J', ALG: 'J', AUT: 'J', JOR: 'J',
  POR: 'K', COD: 'K', UZB: 'K', COL: 'K',
  ENG: 'L', CRO: 'L', GHA: 'L', PAN: 'L',
}

function mapGroup(g: string | null) {
  if (!g) return null
  return g.replace('GROUP_', '') || null
}

function mapTeam(raw: ApiTeam, group?: string | null) {
  const tla = raw.tla?.toUpperCase() ?? ''
  const mapped = TEAM_MAP[tla]
  // Use API group if provided, otherwise fall back to the static draw table
  const resolvedGroup = group ?? TLA_GROUP[tla] ?? ''
  return {
    id:        mapped ? tla.toLowerCase() : String(raw.id),
    name:      mapped?.name      ?? raw.name,
    shortName: mapped?.shortName ?? raw.tla,
    code:      mapped?.code      ?? 'un',
    group:     resolvedGroup,
  }
}

function transformMatch(m: ApiMatch) {
  const group = mapGroup(m.group)
  return {
    id:       String(m.id),
    homeTeam: mapTeam(m.homeTeam, group),
    awayTeam: mapTeam(m.awayTeam, group),
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
}

function transformStanding(row: ApiStandingRow, group: string | null) {
  const tla = row.team?.tla?.toUpperCase() ?? ''
  // Use section group, then TLA lookup, then team's own group field
  const resolvedGroup = group ?? TLA_GROUP[tla] ?? ''
  const team = mapTeam(row.team, resolvedGroup)
  return {
    team,
    group:        team.group,
    position:     row.position,
    played:       row.playedGames,
    won:          row.won,
    drawn:        row.draw,
    lost:         row.lost,
    goalsFor:     row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDiff:     row.goalDifference,
    points:       row.points,
  }
}

async function apiFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Auth-Token': token },
  })
  if (res.status === 429) throw new Error('Rate limit hit')
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

export const syncFootballData = onSchedule(
  {
    schedule: '* * * * *',   // every minute
    timeZone: 'America/Sao_Paulo',
    timeoutSeconds: 30,
    memory: '256MiB',
    secrets: ['FOOTBALL_DATA_TOKEN'],
  },
  async () => {
    const token = process.env.FOOTBALL_DATA_TOKEN
    if (!token) {
      console.error('[sync] FOOTBALL_DATA_TOKEN not set — configure via: firebase functions:secrets:set FOOTBALL_DATA_TOKEN')
      return
    }

    const now = new Date().toISOString()

    try {
      const matchData = await apiFetch<{ matches: ApiMatch[] }>(
        '/competitions/WC/matches?season=2026', token,
      )
      const matches = matchData.matches.map(transformMatch)
      await db.doc('cache/matches').set({ data: matches, updatedAt: now })

      const hasLive = matches.some((m) => m.status === 'LIVE')
      const hasFinished = matches.filter((m) => m.status === 'FINISHED').length
      const hasScheduled = matches.filter((m) => m.status === 'SCHEDULED').length
      console.log(`[sync] matches: ${matches.length} | live: ${hasLive} | finished: ${hasFinished} | scheduled: ${hasScheduled}`)
    } catch (err) {
      console.error('[sync] matches failed:', err)
    }

    // Small delay to avoid hitting rate limit (3 calls/min total)
    await new Promise((r) => setTimeout(r, 6000))

    try {
      // 2. Standings
      const standData = await apiFetch<{ standings: ApiStandingSection[] }>(
        '/competitions/WC/standings?season=2026', token,
      )
      const standings: object[] = []
      for (const section of standData.standings) {
        if (section.type !== 'TOTAL') continue
        const g = mapGroup(section.group)
        for (const row of section.table ?? []) {
          standings.push(transformStanding(row, g))
        }
      }
      await db.doc('cache/standings').set({ data: standings, updatedAt: now })
      console.log(`[sync] standings: ${standings.length} rows`)
    } catch (err) {
      console.error('[sync] standings failed:', err)
    }

    await new Promise((r) => setTimeout(r, 6000))

    try {
      // 3. Bracket (knockout rounds)
      const stages = 'ROUND_OF_32,ROUND_OF_16,QUARTER_FINALS,SEMI_FINALS,THIRD_PLACE,FINAL'
      const bracketData = await apiFetch<{ matches: ApiMatch[] }>(
        `/competitions/WC/matches?season=2026&stage=${stages}`, token,
      )
      const bracket = bracketData.matches.map((m, i) => ({
        id:       String(m.id),
        round:    mapPhase(m.stage),
        slot:     i + 1,
        homeTeam: m.homeTeam?.id ? mapTeam(m.homeTeam) : null,
        awayTeam: m.awayTeam?.id ? mapTeam(m.awayTeam) : null,
        score:    { home: m.score.fullTime.home, away: m.score.fullTime.away },
        status:   mapStatus(m.status),
        date:     m.utcDate ?? null,
        stadium:  m.venue?.name ?? '',
        city:     m.venue?.city ?? '',
      }))
      await db.doc('cache/bracket').set({ data: bracket, updatedAt: now })
      console.log(`[sync] bracket: ${bracket.length} matches`)
    } catch (err) {
      console.error('[sync] bracket failed:', err)
    }

    // 4. Push notifications — jogos que começam em 30 min
    try {
      await sendMatchStartNotifications()
    } catch (err) {
      console.error('[notif] failed:', err)
    }
  },
)

// ── Notificações push: avisa 30 min antes de cada jogo ──────────────────
async function sendMatchStartNotifications() {
  const cacheSnap = await db.doc('cache/matches').get()
  if (!cacheSnap.exists) return

  const matches = (cacheSnap.data()?.data ?? []) as Array<{
    id: string; homeTeam: { shortName: string }; awayTeam: { shortName: string }
    status: string; date: string; phase: string
  }>

  const nowMs = Date.now()
  const WINDOW_MIN = 29 * 60 * 1000  // 29 min
  const WINDOW_MAX = 31 * 60 * 1000  // 31 min

  const upcoming = matches.filter((m) => {
    if (m.status !== 'SCHEDULED') return false
    const diff = new Date(m.date).getTime() - nowMs
    return diff >= WINDOW_MIN && diff <= WINDOW_MAX
  })

  if (upcoming.length === 0) return

  // Buscar todos os tokens FCM registrados
  const tokensSnap = await db.collection('fcmTokens').get()
  const tokens = tokensSnap.docs.map((d) => d.data().token as string).filter(Boolean)
  if (tokens.length === 0) return

  const PHASE_LABELS: Record<string, string> = {
    GROUP_STAGE: 'Fase de Grupos', ROUND_OF_32: '1ª Rodada',
    ROUND_OF_16: 'Oitavas', QUARTER_FINALS: 'Quartas',
    SEMI_FINALS: 'Semifinal', THIRD_PLACE: '3º Lugar', FINAL: 'Grande Final 🏆',
  }

  for (const match of upcoming) {
    const title = `⚽ Jogo em 30 minutos!`
    const body = `${match.homeTeam.shortName} vs ${match.awayTeam.shortName} — ${PHASE_LABELS[match.phase] ?? ''}`

    // Enviar em lotes de 500 (limite FCM)
    for (let i = 0; i < tokens.length; i += 500) {
      const batch = tokens.slice(i, i + 500)
      const result = await getMessaging().sendEachForMulticast({
        tokens: batch,
        notification: { title, body },
        data: { matchId: match.id, url: '/pool' },
        webpush: { notification: { icon: '/icon-192.png', badge: '/icon-192.png' } },
      })
      // Remove tokens inválidos
      const invalid: string[] = []
      result.responses.forEach((r, idx) => {
        if (!r.success && r.error?.code === 'messaging/registration-token-not-registered') {
          invalid.push(batch[idx])
        }
      })
      if (invalid.length > 0) {
        await Promise.all(invalid.map((t) => db.collection('fcmTokens').doc(t).delete()))
      }
      console.log(`[notif] ${match.homeTeam.shortName}×${match.awayTeam.shortName}: ${result.successCount}/${batch.length} enviados`)
    }
  }
}
