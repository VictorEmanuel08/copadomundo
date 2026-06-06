// ══════════════════════════════════════════════════════════════════════
// world-cup-bracket — Tipos
// ══════════════════════════════════════════════════════════════════════

export type GroupLetter = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'
export const ALL_GROUPS: GroupLetter[] = ['A','B','C','D','E','F','G','H','I','J','K','L']

// Resultado definido pelo usuário para um grupo (teamId | null = não definido)
export interface GroupResult {
  first:  string | null
  second: string | null
  third:  string | null
  // fourth é o time restante — calculado, não armazenado
}

// Estado completo do simulador
export interface SimState {
  groups:    Record<GroupLetter, GroupResult>
  thirds:    string[]          // 8 teamIds dos terceiros selecionados
  bracket:   Record<string, string | null>  // matchId → teamId vencedor
}

// Um confronto no mata-mata
export interface KnockoutMatch {
  id:    string                // ex: 'R32_73', 'R16_89', 'QF_97', 'SF_101', 'F_104', '3P_103'
  round: KnockoutRound
  slot:  number                // número oficial FIFA (73–104)
  home:  string | null         // teamId
  away:  string | null         // teamId
  // slotLabel: texto de apoio (ex: "1E", "2A", "3rd")
  homeLabel?: string
  awayLabel?: string
  date?: string | null
  stadium?: string | null
  city?: string | null
}

export type KnockoutRound =
  | 'R32'     // Avos / Round of 32
  | 'R16'     // Oitavas
  | 'QF'      // Quartas
  | 'SF'      // Semis
  | 'THIRD'   // Disputa 3º lugar
  | 'FINAL'

export interface FullBracket {
  r32:   KnockoutMatch[]   // 16 jogos
  r16:   KnockoutMatch[]   // 8 jogos
  qf:    KnockoutMatch[]   // 4 jogos
  sf:    KnockoutMatch[]   // 2 jogos
  third: KnockoutMatch     // disputa 3º lugar
  final: KnockoutMatch
}
