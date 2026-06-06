import type { Team } from '../types'

// ══════════════════════════════════════════════════════════════════════
// Copa do Mundo FIFA 2026 — Grupos Oficiais
// Sorteio realizado em 5 de dezembro de 2025, Washington D.C.
// Fonte: FIFA.com / Sorteo oficial
// ══════════════════════════════════════════════════════════════════════

export const TEAMS: Team[] = [
  // ── Grupo A ── México, África do Sul, Coreia do Sul, Rep. Tcheca
  { id: 'mex', name: 'México',            shortName: 'MEX', code: 'mx',    group: 'A' },
  { id: 'rsa', name: 'África do Sul',     shortName: 'AFS', code: 'za',    group: 'A' },
  { id: 'kor', name: 'Coreia do Sul',     shortName: 'COR', code: 'kr',    group: 'A' },
  { id: 'cze', name: 'Rep. Tcheca',       shortName: 'CZE', code: 'cz',    group: 'A' },

  // ── Grupo B ── Canadá, Bósnia e Herzegovina, Catar, Suíça
  { id: 'can', name: 'Canadá',            shortName: 'CAN', code: 'ca',    group: 'B' },
  { id: 'bih', name: 'Bósnia-Herzegovina',shortName: 'BIH', code: 'ba',    group: 'B' },
  { id: 'qat', name: 'Catar',             shortName: 'CAT', code: 'qa',    group: 'B' },
  { id: 'sui', name: 'Suíça',             shortName: 'SUI', code: 'ch',    group: 'B' },

  // ── Grupo C ── Brasil, Marrocos, Haiti, Escócia
  { id: 'bra', name: 'Brasil',            shortName: 'BRA', code: 'br',    group: 'C' },
  { id: 'mar', name: 'Marrocos',          shortName: 'MAR', code: 'ma',    group: 'C' },
  { id: 'hai', name: 'Haiti',             shortName: 'HAI', code: 'ht',    group: 'C' },
  { id: 'sco', name: 'Escócia',           shortName: 'ESC', code: 'gb-sct', group: 'C' },

  // ── Grupo D ── Estados Unidos, Paraguai, Austrália, Turquia
  { id: 'usa', name: 'Estados Unidos',    shortName: 'EUA', code: 'us',    group: 'D' },
  { id: 'par', name: 'Paraguai',          shortName: 'PAR', code: 'py',    group: 'D' },
  { id: 'aus', name: 'Austrália',         shortName: 'AUS', code: 'au',    group: 'D' },
  { id: 'tur', name: 'Turquia',           shortName: 'TUR', code: 'tr',    group: 'D' },

  // ── Grupo E ── Alemanha, Curaçao, Costa do Marfim, Equador
  { id: 'ger', name: 'Alemanha',          shortName: 'ALE', code: 'de',    group: 'E' },
  { id: 'cur', name: 'Curaçao',           shortName: 'CUW', code: 'cw',    group: 'E' },
  { id: 'civ', name: 'Costa do Marfim',   shortName: 'CDM', code: 'ci',    group: 'E' },
  { id: 'ecu', name: 'Equador',           shortName: 'ECU', code: 'ec',    group: 'E' },

  // ── Grupo F ── Países Baixos, Japão, Suécia, Tunísia
  { id: 'ned', name: 'Países Baixos',     shortName: 'HOL', code: 'nl',    group: 'F' },
  { id: 'jpn', name: 'Japão',             shortName: 'JAP', code: 'jp',    group: 'F' },
  { id: 'swe', name: 'Suécia',            shortName: 'SUE', code: 'se',    group: 'F' },
  { id: 'tun', name: 'Tunísia',           shortName: 'TUN', code: 'tn',    group: 'F' },

  // ── Grupo G ── Bélgica, Egito, Irã, Nova Zelândia
  { id: 'bel', name: 'Bélgica',           shortName: 'BEL', code: 'be',    group: 'G' },
  { id: 'egy', name: 'Egito',             shortName: 'EGI', code: 'eg',    group: 'G' },
  { id: 'irn', name: 'Irã',              shortName: 'IRÃ', code: 'ir',    group: 'G' },
  { id: 'nzl', name: 'Nova Zelândia',     shortName: 'NZL', code: 'nz',    group: 'G' },

  // ── Grupo H ── Espanha, Cabo Verde, Arábia Saudita, Uruguai
  { id: 'esp', name: 'Espanha',           shortName: 'ESP', code: 'es',    group: 'H' },
  { id: 'cpv', name: 'Cabo Verde',        shortName: 'CPV', code: 'cv',    group: 'H' },
  { id: 'ksa', name: 'Arábia Saudita',    shortName: 'ARS', code: 'sa',    group: 'H' },
  { id: 'uru', name: 'Uruguai',           shortName: 'URU', code: 'uy',    group: 'H' },

  // ── Grupo I ── França, Senegal, Iraque, Noruega
  { id: 'fra', name: 'França',            shortName: 'FRA', code: 'fr',    group: 'I' },
  { id: 'sen', name: 'Senegal',           shortName: 'SEN', code: 'sn',    group: 'I' },
  { id: 'irq', name: 'Iraque',            shortName: 'IRQ', code: 'iq',    group: 'I' },
  { id: 'nor', name: 'Noruega',           shortName: 'NOR', code: 'no',    group: 'I' },

  // ── Grupo J ── Argentina, Argélia, Áustria, Jordânia
  { id: 'arg', name: 'Argentina',         shortName: 'ARG', code: 'ar',    group: 'J' },
  { id: 'alg', name: 'Argélia',           shortName: 'ALG', code: 'dz',    group: 'J' },
  { id: 'aut', name: 'Áustria',           shortName: 'AUT', code: 'at',    group: 'J' },
  { id: 'jor', name: 'Jordânia',          shortName: 'JOR', code: 'jo',    group: 'J' },

  // ── Grupo K ── Portugal, Rep. Democrática do Congo, Uzbequistão, Colômbia
  { id: 'por', name: 'Portugal',          shortName: 'POR', code: 'pt',    group: 'K' },
  { id: 'cod', name: 'Rep. Dem. do Congo',shortName: 'COD', code: 'cd',    group: 'K' },
  { id: 'uzb', name: 'Uzbequistão',       shortName: 'UZB', code: 'uz',    group: 'K' },
  { id: 'col', name: 'Colômbia',          shortName: 'COL', code: 'co',    group: 'K' },

  // ── Grupo L ── Inglaterra, Croácia, Gana, Panamá
  { id: 'eng', name: 'Inglaterra',        shortName: 'ENG', code: 'gb-eng', group: 'L' },
  { id: 'cro', name: 'Croácia',           shortName: 'CRO', code: 'hr',    group: 'L' },
  { id: 'gha', name: 'Gana',              shortName: 'GAN', code: 'gh',    group: 'L' },
  { id: 'pan', name: 'Panamá',            shortName: 'PAN', code: 'pa',    group: 'L' },
]

export function getTeamById(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id)
}

export function getTeamsByGroup(group: string): Team[] {
  return TEAMS.filter((t) => t.group === group)
}

export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const
export type GroupLetter = typeof GROUPS[number]
