// Mapeamento football-data.org TLA → { iso2, ptName, shortName }
// Usado para exibir bandeiras (flagcdn) e nomes em português
export const TEAM_MAP: Record<string, { code: string; name: string; shortName: string }> = {
  // Grupo A
  MEX: { code: 'mx',      name: 'México',             shortName: 'MEX' },
  RSA: { code: 'za',      name: 'África do Sul',      shortName: 'AFS' },
  KOR: { code: 'kr',      name: 'Coreia do Sul',      shortName: 'COR' },
  CZE: { code: 'cz',      name: 'Rep. Tcheca',        shortName: 'CZE' },
  // Grupo B
  CAN: { code: 'ca',      name: 'Canadá',             shortName: 'CAN' },
  BIH: { code: 'ba',      name: 'Bósnia-Herzegovina', shortName: 'BIH' },
  QAT: { code: 'qa',      name: 'Catar',              shortName: 'CAT' },
  SUI: { code: 'ch',      name: 'Suíça',              shortName: 'SUI' },
  // Grupo C
  BRA: { code: 'br',      name: 'Brasil',             shortName: 'BRA' },
  MAR: { code: 'ma',      name: 'Marrocos',           shortName: 'MAR' },
  HAI: { code: 'ht',      name: 'Haiti',              shortName: 'HAI' },
  SCO: { code: 'gb-sct',  name: 'Escócia',            shortName: 'ESC' },
  // Grupo D
  USA: { code: 'us',      name: 'Estados Unidos',     shortName: 'EUA' },
  PAR: { code: 'py',      name: 'Paraguai',           shortName: 'PAR' },
  AUS: { code: 'au',      name: 'Austrália',          shortName: 'AUS' },
  TUR: { code: 'tr',      name: 'Turquia',            shortName: 'TUR' },
  // Grupo E
  GER: { code: 'de',      name: 'Alemanha',           shortName: 'ALE' },
  CUW: { code: 'cw',      name: 'Curaçao',            shortName: 'CUW' },
  CIV: { code: 'ci',      name: 'Costa do Marfim',    shortName: 'CDM' },
  ECU: { code: 'ec',      name: 'Equador',            shortName: 'ECU' },
  // Grupo F
  NED: { code: 'nl',      name: 'Países Baixos',      shortName: 'HOL' },
  JPN: { code: 'jp',      name: 'Japão',              shortName: 'JAP' },
  SWE: { code: 'se',      name: 'Suécia',             shortName: 'SUE' },
  TUN: { code: 'tn',      name: 'Tunísia',            shortName: 'TUN' },
  // Grupo G
  BEL: { code: 'be',      name: 'Bélgica',            shortName: 'BEL' },
  EGY: { code: 'eg',      name: 'Egito',              shortName: 'EGI' },
  IRN: { code: 'ir',      name: 'Irã',                shortName: 'IRÃ' },
  NZL: { code: 'nz',      name: 'Nova Zelândia',      shortName: 'NZL' },
  // Grupo H
  ESP: { code: 'es',      name: 'Espanha',            shortName: 'ESP' },
  CPV: { code: 'cv',      name: 'Cabo Verde',         shortName: 'CPV' },
  KSA: { code: 'sa',      name: 'Arábia Saudita',     shortName: 'ARS' },
  URY: { code: 'uy',      name: 'Uruguai',            shortName: 'URU' },
  // Grupo I
  FRA: { code: 'fr',      name: 'França',             shortName: 'FRA' },
  SEN: { code: 'sn',      name: 'Senegal',            shortName: 'SEN' },
  IRQ: { code: 'iq',      name: 'Iraque',             shortName: 'IRQ' },
  NOR: { code: 'no',      name: 'Noruega',            shortName: 'NOR' },
  // Grupo J
  ARG: { code: 'ar',      name: 'Argentina',          shortName: 'ARG' },
  ALG: { code: 'dz',      name: 'Argélia',            shortName: 'ALG' },
  AUT: { code: 'at',      name: 'Áustria',            shortName: 'AUT' },
  JOR: { code: 'jo',      name: 'Jordânia',           shortName: 'JOR' },
  // Grupo K
  POR: { code: 'pt',      name: 'Portugal',           shortName: 'POR' },
  COD: { code: 'cd',      name: 'Rep. Dem. do Congo', shortName: 'COD' },
  UZB: { code: 'uz',      name: 'Uzbequistão',        shortName: 'UZB' },
  COL: { code: 'co',      name: 'Colômbia',           shortName: 'COL' },
  // Grupo L
  ENG: { code: 'gb-eng',  name: 'Inglaterra',         shortName: 'ENG' },
  CRO: { code: 'hr',      name: 'Croácia',            shortName: 'CRO' },
  GHA: { code: 'gh',      name: 'Gana',               shortName: 'GAN' },
  PAN: { code: 'pa',      name: 'Panamá',             shortName: 'PAN' },
}
