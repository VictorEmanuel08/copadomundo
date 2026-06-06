// ══════════════════════════════════════════════════════════════════════
// world-cup-bracket — Lógica pura (sem React)
// Chaveamento oficial FIFA Copa do Mundo 2026
//
// Fontes:
//   - Wikipedia: 2026 FIFA World Cup knockout stage
//   - worldcuppass.com/bracket
//   - FIFA: knockout-stage-match-schedule-bracket
// ══════════════════════════════════════════════════════════════════════

import type {
  GroupLetter, GroupResult, SimState, KnockoutMatch, FullBracket,
} from './types'
import { THIRD_PLACE_COMBINATIONS } from '../data/third-place-combinations'

// ── Estrutura fixa do R32 (chaveamento oficial FIFA) ──────────────────
// Cada slot define: qual posição de grupo (1A, 2B, 3rd) entra em cada match
// Os 8 slots "3rd" indicam quais grupos *podem* enviar o terceiro colocado
// A atribuição exata depende da combinação (ver assignThirds abaixo)

interface R32Slot {
  matchNum: number
  homeType: 'winner' | 'runnerup' | 'third'
  homeGroup: GroupLetter | null            // null = definido pelo terceiros
  awayType:  'winner' | 'runnerup' | 'third'
  awayGroup: GroupLetter | null
  thirdPossible?: GroupLetter[]            // grupos possíveis para o 3rd-place slot
  feedsInto: number                        // número do match R16 que recebe o vencedor
  thirdSide: 'home' | 'away' | null       // qual lado é o 3rd-place neste match
}

const R32_SLOTS: R32Slot[] = [
  // Match 73 — 2A vs 2B → R16 #90
  { matchNum: 73, homeType:'runnerup', homeGroup:'A', awayType:'runnerup', awayGroup:'B', feedsInto:90, thirdSide:null },
  // Match 74 — 1E vs 3rd(A/B/C/D/F) → R16 #89
  { matchNum: 74, homeType:'winner',  homeGroup:'E', awayType:'third', awayGroup:null, thirdPossible:['A','B','C','D','F'], feedsInto:89, thirdSide:'away' },
  // Match 75 — 1F vs 2C → R16 #90
  { matchNum: 75, homeType:'winner',  homeGroup:'F', awayType:'runnerup', awayGroup:'C', feedsInto:90, thirdSide:null },
  // Match 76 — 1C vs 2F → R16 #91
  { matchNum: 76, homeType:'winner',  homeGroup:'C', awayType:'runnerup', awayGroup:'F', feedsInto:91, thirdSide:null },
  // Match 77 — 1I vs 3rd(C/D/F/G/H) → R16 #89
  { matchNum: 77, homeType:'winner',  homeGroup:'I', awayType:'third', awayGroup:null, thirdPossible:['C','D','F','G','H'], feedsInto:89, thirdSide:'away' },
  // Match 78 — 2E vs 2I → R16 #91
  { matchNum: 78, homeType:'runnerup', homeGroup:'E', awayType:'runnerup', awayGroup:'I', feedsInto:91, thirdSide:null },
  // Match 79 — 1A vs 3rd(C/E/F/H/I) → R16 #92
  { matchNum: 79, homeType:'winner',  homeGroup:'A', awayType:'third', awayGroup:null, thirdPossible:['C','E','F','H','I'], feedsInto:92, thirdSide:'away' },
  // Match 80 — 1L vs 3rd(E/H/I/J/K) → R16 #92
  { matchNum: 80, homeType:'winner',  homeGroup:'L', awayType:'third', awayGroup:null, thirdPossible:['E','H','I','J','K'], feedsInto:92, thirdSide:'away' },
  // Match 81 — 1D vs 3rd(B/E/F/I/J) → R16 #94
  { matchNum: 81, homeType:'winner',  homeGroup:'D', awayType:'third', awayGroup:null, thirdPossible:['B','E','F','I','J'], feedsInto:94, thirdSide:'away' },
  // Match 82 — 1G vs 3rd(A/E/H/I/J) → R16 #94
  { matchNum: 82, homeType:'winner',  homeGroup:'G', awayType:'third', awayGroup:null, thirdPossible:['A','E','H','I','J'], feedsInto:94, thirdSide:'away' },
  // Match 83 — 2K vs 2L → R16 #93
  { matchNum: 83, homeType:'runnerup', homeGroup:'K', awayType:'runnerup', awayGroup:'L', feedsInto:93, thirdSide:null },
  // Match 84 — 1H vs 2J → R16 #93
  { matchNum: 84, homeType:'winner',  homeGroup:'H', awayType:'runnerup', awayGroup:'J', feedsInto:93, thirdSide:null },
  // Match 85 — 1B vs 3rd(E/F/G/I/J) → R16 #96
  { matchNum: 85, homeType:'winner',  homeGroup:'B', awayType:'third', awayGroup:null, thirdPossible:['E','F','G','I','J'], feedsInto:96, thirdSide:'away' },
  // Match 86 — 1J vs 2H → R16 #95
  { matchNum: 86, homeType:'winner',  homeGroup:'J', awayType:'runnerup', awayGroup:'H', feedsInto:95, thirdSide:null },
  // Match 87 — 1K vs 3rd(D/E/I/J/L) → R16 #96
  { matchNum: 87, homeType:'winner',  homeGroup:'K', awayType:'third', awayGroup:null, thirdPossible:['D','E','I','J','L'], feedsInto:96, thirdSide:'away' },
  // Match 88 — 2D vs 2G → R16 #95
  { matchNum: 88, homeType:'runnerup', homeGroup:'D', awayType:'runnerup', awayGroup:'G', feedsInto:95, thirdSide:null },
]

// R16 → QF connections (official)
// R16 match num → QF match num
const R16_TO_QF: Record<number, number> = {
  89: 97,  90: 97,
  91: 99,  92: 99,
  93: 98,  94: 98,
  95: 100, 96: 100,
}

// QF → SF connections
const QF_TO_SF: Record<number, number> = {
  97: 101, 98: 101,
  99: 102, 100: 102,
}

// ── Atribuição de terceiros colocados ─────────────────────────────────
// Dado um conjunto de 8 grupos que avançam terceiros, atribui cada
// terceiro ao slot correto usando o método "primeiro slot compatível".
// (Simplificação das 495 combinações oficiais — suficiente para simulador)

function assignThirds(
  selectedGroups: GroupLetter[],
  groups: Record<GroupLetter, GroupResult>,
): Map<number, string | null> {
  const assigned = new Map<number, string | null>()
  
  // Ordena alfabeticamente para gerar a chave de busca (ex: "EFGHIJKL")
  const combinationKey = [...selectedGroups].sort().join('')
  const mapping = THIRD_PLACE_COMBINATIONS[combinationKey]
  
  if (!mapping) {
    console.warn(`Combinação "${combinationKey}" não encontrada em THIRD_PLACE_COMBINATIONS.`);
    return assigned
  }
  
  for (const slot of R32_SLOTS) {
    if (slot.awayType === 'third' && slot.homeGroup) {
      const winnerLabel = `1${slot.homeGroup}` // ex: "1E"
      const thirdLabel = mapping[winnerLabel]   // ex: "3F"
      if (thirdLabel) {
        const thirdGroup = thirdLabel.substring(1) as GroupLetter // "F"
        assigned.set(slot.matchNum, groups[thirdGroup]?.third ?? null)
      }
    }
  }
  
  return assigned
}

// ── Helpers ────────────────────────────────────────────────────────────
function teamFromGroup(
  results: Record<GroupLetter, GroupResult>,
  group: GroupLetter,
  type: 'winner' | 'runnerup' | 'third',
): string | null {
  const r = results[group]
  if (!r) return null
  if (type === 'winner')   return r.first
  if (type === 'runnerup') return r.second
  return r.third
}

function w(bracket: Record<string, string | null>, matchNum: number): string | null {
  return bracket[`m${matchNum}`] ?? null
}

// ── Função principal ────────────────────────────────────────────────────
export function generateBracket(state: SimState): FullBracket {
  const { groups, thirds, bracket } = state

  // 1. Preparar grupos que avançam terceiros
  const selectedGroups = thirds
    .map(teamId => {
      const entry = Object.entries(groups).find(([, r]) => r.third === teamId)
      return entry ? (entry[0] as GroupLetter) : null
    })
    .filter(Boolean) as GroupLetter[]

  // 2. Atribuir terceiros aos slots
  const thirdAssignment = assignThirds(selectedGroups, groups)

  // 3. Gerar R32
  const r32: KnockoutMatch[] = R32_SLOTS.map(slot => {
    const mn   = slot.matchNum
    let home: string | null = null
    let away: string | null = null
    let homeLabel = ''
    let awayLabel = ''

    // Home
    if (slot.homeType !== 'third' && slot.homeGroup) {
      home      = teamFromGroup(groups, slot.homeGroup, slot.homeType)
      homeLabel = slot.homeType === 'winner' ? `1º Grupo ${slot.homeGroup}` : `2º Grupo ${slot.homeGroup}`
    }

    // Away
    if (slot.awayType !== 'third' && slot.awayGroup) {
      away      = teamFromGroup(groups, slot.awayGroup, slot.awayType)
      awayLabel = slot.awayType === 'winner' ? `1º Grupo ${slot.awayGroup}` : `2º Grupo ${slot.awayGroup}`
    }

    // Third-place
    if (slot.homeType === 'third') {
      home      = thirdAssignment.get(mn) ?? null
      const groupLetter = selectedGroups.find(g => groups[g]?.third === home)
      homeLabel = groupLetter ? `3º Grupo ${groupLetter}` : `3º Grupo ${slot.thirdPossible?.join('/') || 'X'}`
    }
    if (slot.awayType === 'third') {
      away      = thirdAssignment.get(mn) ?? null
      const groupLetter = selectedGroups.find(g => groups[g]?.third === away)
      awayLabel = groupLetter ? `3º Grupo ${groupLetter}` : `3º Grupo ${slot.thirdPossible?.join('/') || 'X'}`
    }

    return {
      id:        `m${mn}`,
      round:     'R32',
      slot:      mn,
      home,
      away,
      homeLabel,
      awayLabel,
    }
  })

  // 4. Gerar R16
  const r16Nums = [89, 90, 91, 92, 93, 94, 95, 96]
  // Pares: feedsInto → [m1, m2]
  const r16Pairs: Record<number, number[]> = {}
  for (const slot of R32_SLOTS) {
    const target = slot.feedsInto
    if (!r16Pairs[target]) r16Pairs[target] = []
    r16Pairs[target].push(slot.matchNum)
  }

  const r16: KnockoutMatch[] = r16Nums.map(mn => {
    const [src1, src2] = r16Pairs[mn] ?? []
    return {
      id:    `m${mn}`,
      round: 'R16',
      slot:  mn,
      home:  w(bracket, src1),
      away:  w(bracket, src2),
      homeLabel: 'Venc. 16-avos',
      awayLabel: 'Venc. 16-avos',
    }
  })

  // 5. Gerar QF
  const qfPairs: Record<number, number[]> = {}
  for (const [r16n, qfn] of Object.entries(R16_TO_QF)) {
    if (!qfPairs[qfn]) qfPairs[qfn] = []
    qfPairs[qfn].push(Number(r16n))
  }

  const qf: KnockoutMatch[] = [97, 98, 99, 100].map(mn => {
    const [src1, src2] = qfPairs[mn] ?? []
    return {
      id:    `m${mn}`,
      round: 'QF',
      slot:  mn,
      home:  w(bracket, src1),
      away:  w(bracket, src2),
      homeLabel: 'Venc. Oitavas',
      awayLabel: 'Venc. Oitavas',
    }
  })

  // 6. Gerar SF
  const sfPairs: Record<number, number[]> = {}
  for (const [qfn, sfn] of Object.entries(QF_TO_SF)) {
    if (!sfPairs[sfn]) sfPairs[sfn] = []
    sfPairs[sfn].push(Number(qfn))
  }

  const sf: KnockoutMatch[] = [101, 102].map(mn => {
    const [src1, src2] = sfPairs[mn] ?? []
    return {
      id:    `m${mn}`,
      round: 'SF',
      slot:  mn,
      home:  w(bracket, src1),
      away:  w(bracket, src2),
      homeLabel: 'Venc. Quartas',
      awayLabel: 'Venc. Quartas',
    }
  })

  // 7. Disputa 3º lugar
  // Perdedores das semifinais
  const sf1 = sf.find(m => m.slot === 101)!
  const sf2 = sf.find(m => m.slot === 102)!
  const loser101 = w(bracket, 101) === sf1.home ? sf1.away : sf1.home
  const loser102 = w(bracket, 102) === sf2.home ? sf2.away : sf2.home

  const third: KnockoutMatch = {
    id:    'm103',
    round: 'THIRD',
    slot:  103,
    home:  loser101,
    away:  loser102,
    homeLabel: 'Perd. Semifinal',
    awayLabel: 'Perd. Semifinal',
  }

  // 8. Final
  const final: KnockoutMatch = {
    id:    'm104',
    round: 'FINAL',
    slot:  104,
    home:  w(bracket, 101),
    away:  w(bracket, 102),
    homeLabel: 'Venc. Semifinal',
    awayLabel: 'Venc. Semifinal',
  }

  return { r32, r16, qf, sf, third, final }
}

// ── Verifica se um grupo está completamente preenchido ────────────────
export function isGroupComplete(r: GroupResult | undefined): boolean {
  if (!r) return false
  return r.first !== null && r.second !== null && r.third !== null
}

// ── Quantos grupos estão completos ────────────────────────────────────
export function countCompleteGroups(groups: Record<GroupLetter, GroupResult>): number {
  return Object.values(groups).filter(isGroupComplete).length
}

// ── Retorna os teams de um grupo como array [teamId, ...] ─────────────
export function getGroupTeams(
  group: GroupLetter,
  allTeams: { id: string; group: string }[],
): string[] {
  return allTeams.filter(t => t.group === group).map(t => t.id)
}
