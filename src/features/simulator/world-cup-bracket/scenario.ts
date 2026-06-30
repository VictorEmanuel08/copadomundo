// ══════════════════════════════════════════════════════════════════════
// world-cup-bracket — Derivação do "cenário atual" a partir dos dados REAIS
//
// Fonte única da verdade: a classificação (cache/standings) e o mata-mata
// (cache/bracket) que vêm da Cloud Function. Tanto a página de Chaveamento
// quanto o Simulador derivam seu estado daqui — sem lógica duplicada.
// ══════════════════════════════════════════════════════════════════════

import type { Standing, BracketMatch } from '@/core/api/types'
import type { SimState, GroupLetter } from './types'
import { ALL_GROUPS } from './types'
import { generateBracket } from './bracket'

// Ordena um grupo pela regra FIFA: pontos → saldo → gols pró.
function sortGroup(rows: Standing[]): Standing[] {
  return [...rows].sort((a, b) =>
    b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor,
  )
}

// Deriva 1º/2º/3º de cada grupo + os 8 melhores terceiros, a partir da
// classificação real. Grupos ainda não iniciados ficam nulos; os terceiros só
// são definidos quando os 12 grupos terminaram (regra dos 8 melhores 3º).
export function deriveGroups(
  standings: Standing[],
): { groups: SimState['groups']; thirds: string[] } {
  const groups = {} as SimState['groups']
  const finished: GroupLetter[] = []

  for (const g of ALL_GROUPS) {
    const rows = standings.filter(s => s.group === g)
    if (rows.length && rows.some(s => s.played > 0)) {
      const sorted = sortGroup(rows)
      groups[g] = {
        first:  sorted[0]?.team.id ?? null,
        second: sorted[1]?.team.id ?? null,
        third:  sorted[2]?.team.id ?? null,
      }
      if (rows.every(s => s.played === 3)) finished.push(g)
    } else {
      groups[g] = { first: null, second: null, third: null }
    }
  }

  let thirds: string[] = []
  if (finished.length === ALL_GROUPS.length) {
    const allThirds = ALL_GROUPS
      .map(g => sortGroup(standings.filter(s => s.group === g))[2])
      .filter(Boolean) as Standing[]
    thirds = sortGroup(allThirds).slice(0, 8).map(r => r.team.id)
  }

  return { groups, thirds }
}

// Rótulos curtos do gerador → fases da API (BracketMatch.round).
const PHASE: Record<string, string> = {
  R32: 'ROUND_OF_32', R16: 'ROUND_OF_16', QF: 'QUARTER_FINALS',
  SF: 'SEMI_FINALS', THIRD: 'THIRD_PLACE', FINAL: 'FINAL',
}

// Casa o jogo REAL ao slot estrutural pela IDENTIDADE dos times — nunca por
// índice. A API não devolve os mata-matas na ordem oficial dos match-numbers, e
// o lado "home" de cada slot é sempre um cabeça (1º/2º de grupo) que aparece em
// exatamente um jogo real → pareamento único e estável, sem duplicatas.
export function findLiveMatch(
  matches: BracketMatch[] | undefined,
  roundName: string,
  home: string | null,
  away: string | null,
): BracketMatch | null {
  if (!matches?.length) return null
  const phase = PHASE[roundName]
  const inPhase = matches.filter(m => m.round === phase)
  const wanted = [home, away].filter(Boolean) as string[]
  if (wanted.length) {
    return inPhase.find(m =>
      (m.homeTeam && wanted.includes(m.homeTeam.id)) ||
      (m.awayTeam && wanted.includes(m.awayTeam.id)),
    ) ?? null
  }
  // Slots ainda em aberto (3º lugar / final sem definição): se a fase tem um
  // único jogo, usa-o (p/ data/sede); senão, mantém estrutural.
  return inPhase.length === 1 ? inPhase[0] : null
}

// Vencedor de um confronto decidido. Usa o campo oficial `winner` (cobre
// decisão por pênaltis, em que o placar de exibição fica empatado); cai para
// comparação de gols em caches antigos sem `winner`.
export function winnerOf(live: BracketMatch | null): string | null {
  if (!live || live.status !== 'FINISHED') return null
  if (live.winner === 'HOME_TEAM') return live.homeTeam?.id ?? null
  if (live.winner === 'AWAY_TEAM') return live.awayTeam?.id ?? null
  const { home, away } = live.score
  if (home == null || away == null) return null
  if (home > away) return live.homeTeam?.id ?? null
  if (away > home) return live.awayTeam?.id ?? null
  return null
}

// Os 8 terceiros que REALMENTE se classificaram. Fonte autoritativa: os 3º de
// grupo que aparecem nos 16-avos reais (chaveamento oficial da API), que já
// embute o desempate completo da FIFA. Antes de o mata-mata ser publicado, usa
// o cálculo por critério (pontos→saldo→gols) como fallback.
export function resolveQualifiedThirds(
  groups: SimState['groups'],
  bracketMatches: BracketMatch[] | undefined,
  computed: string[],
): string[] {
  if (!bracketMatches?.length) return computed
  const thirdIds = new Set(
    Object.values(groups).map(g => g.third).filter(Boolean) as string[],
  )
  const inR32 = new Set<string>()
  for (const m of bracketMatches) {
    if (m.round !== 'ROUND_OF_32') continue
    if (m.homeTeam?.id) inR32.add(m.homeTeam.id)
    if (m.awayTeam?.id) inR32.add(m.awayTeam.id)
  }
  const real = [...thirdIds].filter(id => inR32.has(id))
  // Só confia na fonte autoritativa quando está completa (8 terceiros).
  return real.length === 8 ? real : computed
}

// Estado completo do simulador derivado do cenário REAL: grupos + terceiros +
// vencedores dos mata-matas já decididos, propagados fase a fase (regenerando a
// estrutura a cada rodada para que o slot seguinte já tenha os times certos).
export function deriveScenarioState(
  standings: Standing[],
  bracketMatches: BracketMatch[] | undefined,
): SimState {
  const { groups, thirds: computedThirds } = deriveGroups(standings)
  const thirds = resolveQualifiedThirds(groups, bracketMatches, computedThirds)

  // Mantém o 3º marcado apenas nos grupos cujo terceiro se classificou (os 8).
  // Os demais grupos ficam sem 3º — como manda a regra do simulador ("marque o
  // 3º apenas nos 8 grupos cujos terceiros classificam ao mata-mata").
  const qualified = new Set(thirds)
  for (const g of ALL_GROUPS) {
    if (groups[g].third && !qualified.has(groups[g].third)) {
      groups[g] = { ...groups[g], third: null }
    }
  }

  const bracket: Record<string, string | null> = {}
  const seed = { groups, thirds }

  let full = generateBracket({ ...seed, bracket })
  for (const [key, round] of [
    ['r32', 'R32'], ['r16', 'R16'], ['qf', 'QF'], ['sf', 'SF'],
  ] as const) {
    for (const m of full[key]) {
      const w = winnerOf(findLiveMatch(bracketMatches, round, m.home, m.away))
      if (w) bracket[m.id] = w
    }
    full = generateBracket({ ...seed, bracket })
  }
  // Final e disputa de 3º (caso já decididas) — completa o estado.
  for (const [m, round] of [[full.third, 'THIRD'], [full.final, 'FINAL']] as const) {
    const w = winnerOf(findLiveMatch(bracketMatches, round, m.home, m.away))
    if (w) bracket[m.id] = w
  }

  return { groups, thirds, bracket }
}
