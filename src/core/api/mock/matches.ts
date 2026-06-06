import type { Match } from '../types'
import { TEAMS } from './teams'

function t(id: string) {
  const team = TEAMS.find((x) => x.id === id)
  if (!team) throw new Error(`Team not found: ${id}`)
  return team
}

// ══════════════════════════════════════════════════════════════════════
// Estádios e Cidades — Copa do Mundo FIFA 2026
// Sede: Estados Unidos, Canadá e México
// ══════════════════════════════════════════════════════════════════════

const V = {
  az:  ['Estadio Azteca',           'Cidade do México, México'],
  ak:  ['Estadio Akron',            'Guadalajara, México'],
  bb:  ['Estadio BBVA',             'Monterrey, México'],
  ml:  ['MetLife Stadium',          'Nova York, EUA'],
  at:  ['AT&T Stadium',             'Dallas, EUA'],
  lv:  ["Levi's Stadium",           'São José, EUA'],
  sf:  ['SoFi Stadium',             'Los Angeles, EUA'],
  rb:  ['Rose Bowl',                'Los Angeles, EUA'],
  al:  ['Allegiant Stadium',        'Las Vegas, EUA'],
  ar:  ['Arrowhead Stadium',        'Kansas City, EUA'],
  lu:  ['Lumen Field',              'Seattle, EUA'],
  lf:  ['Lincoln Financial Field',  'Philadelphia, EUA'],
  cf:  ['Commanders Field',         'Washington D.C., EUA'],
  gi:  ['Gillette Stadium',         'Boston, EUA'],
  bc:  ['BC Place',                 'Vancouver, Canadá'],
  bm:  ['BMO Field',                'Toronto, Canadá'],
} as const

function v(key: keyof typeof V) {
  return { stadium: V[key][0], city: V[key][1] }
}

// ══════════════════════════════════════════════════════════════════════
// Copa do Mundo FIFA 2026 — Fase de Grupos (72 jogos)
// Horários e confrontos 100% reais e oficiais sincronizados com a FIFA
// ══════════════════════════════════════════════════════════════════════

export const GROUP_MATCHES: Match[] = [
  { id: '537327', homeTeam: t('mex'), awayTeam: t('rsa'), date: '2026-06-11T19:00:00Z', ...v('az'), phase: 'GROUP_STAGE', group: 'A', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537328', homeTeam: t('kor'), awayTeam: t('cze'), date: '2026-06-12T02:00:00Z', ...v('lv'), phase: 'GROUP_STAGE', group: 'A', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537333', homeTeam: t('can'), awayTeam: t('bih'), date: '2026-06-12T19:00:00Z', ...v('bm'), phase: 'GROUP_STAGE', group: 'B', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537345', homeTeam: t('usa'), awayTeam: t('par'), date: '2026-06-13T01:00:00Z', ...v('ml'), phase: 'GROUP_STAGE', group: 'D', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537334', homeTeam: t('qat'), awayTeam: t('sui'), date: '2026-06-13T19:00:00Z', ...v('at'), phase: 'GROUP_STAGE', group: 'B', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537339', homeTeam: t('bra'), awayTeam: t('mar'), date: '2026-06-13T22:00:00Z', ...v('sf'), phase: 'GROUP_STAGE', group: 'C', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537340', homeTeam: t('hai'), awayTeam: t('sco'), date: '2026-06-14T01:00:00Z', ...v('al'), phase: 'GROUP_STAGE', group: 'C', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537346', homeTeam: t('aus'), awayTeam: t('tur'), date: '2026-06-14T04:00:00Z', ...v('lu'), phase: 'GROUP_STAGE', group: 'D', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537351', homeTeam: t('ger'), awayTeam: t('cur'), date: '2026-06-14T17:00:00Z', ...v('lf'), phase: 'GROUP_STAGE', group: 'E', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537357', homeTeam: t('ned'), awayTeam: t('jpn'), date: '2026-06-14T20:00:00Z', ...v('gi'), phase: 'GROUP_STAGE', group: 'F', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537352', homeTeam: t('civ'), awayTeam: t('ecu'), date: '2026-06-14T23:00:00Z', ...v('ar'), phase: 'GROUP_STAGE', group: 'E', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537358', homeTeam: t('swe'), awayTeam: t('tun'), date: '2026-06-15T02:00:00Z', ...v('cf'), phase: 'GROUP_STAGE', group: 'F', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537369', homeTeam: t('esp'), awayTeam: t('cpv'), date: '2026-06-15T16:00:00Z', ...v('rb'), phase: 'GROUP_STAGE', group: 'H', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537363', homeTeam: t('bel'), awayTeam: t('egy'), date: '2026-06-15T19:00:00Z', ...v('bc'), phase: 'GROUP_STAGE', group: 'G', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537370', homeTeam: t('ksa'), awayTeam: t('uru'), date: '2026-06-15T22:00:00Z', ...v('bb'), phase: 'GROUP_STAGE', group: 'H', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537364', homeTeam: t('irn'), awayTeam: t('nzl'), date: '2026-06-16T01:00:00Z', ...v('ak'), phase: 'GROUP_STAGE', group: 'G', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537391', homeTeam: t('fra'), awayTeam: t('sen'), date: '2026-06-16T19:00:00Z', ...v('lv'), phase: 'GROUP_STAGE', group: 'I', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537392', homeTeam: t('irq'), awayTeam: t('nor'), date: '2026-06-16T22:00:00Z', ...v('ml'), phase: 'GROUP_STAGE', group: 'I', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537397', homeTeam: t('arg'), awayTeam: t('alg'), date: '2026-06-17T01:00:00Z', ...v('at'), phase: 'GROUP_STAGE', group: 'J', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537398', homeTeam: t('aut'), awayTeam: t('jor'), date: '2026-06-17T04:00:00Z', ...v('sf'), phase: 'GROUP_STAGE', group: 'J', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537403', homeTeam: t('por'), awayTeam: t('cod'), date: '2026-06-17T17:00:00Z', ...v('al'), phase: 'GROUP_STAGE', group: 'K', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537409', homeTeam: t('eng'), awayTeam: t('cro'), date: '2026-06-17T20:00:00Z', ...v('lu'), phase: 'GROUP_STAGE', group: 'L', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537410', homeTeam: t('gha'), awayTeam: t('pan'), date: '2026-06-17T23:00:00Z', ...v('lf'), phase: 'GROUP_STAGE', group: 'L', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537404', homeTeam: t('uzb'), awayTeam: t('col'), date: '2026-06-18T02:00:00Z', ...v('gi'), phase: 'GROUP_STAGE', group: 'K', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537329', homeTeam: t('cze'), awayTeam: t('rsa'), date: '2026-06-18T16:00:00Z', ...v('cf'), phase: 'GROUP_STAGE', group: 'A', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537335', homeTeam: t('sui'), awayTeam: t('bih'), date: '2026-06-18T19:00:00Z', ...v('ar'), phase: 'GROUP_STAGE', group: 'B', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537336', homeTeam: t('can'), awayTeam: t('qat'), date: '2026-06-18T22:00:00Z', ...v('bc'), phase: 'GROUP_STAGE', group: 'B', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537330', homeTeam: t('mex'), awayTeam: t('kor'), date: '2026-06-19T01:00:00Z', ...v('bb'), phase: 'GROUP_STAGE', group: 'A', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537348', homeTeam: t('usa'), awayTeam: t('aus'), date: '2026-06-19T19:00:00Z', ...v('rb'), phase: 'GROUP_STAGE', group: 'D', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537342', homeTeam: t('sco'), awayTeam: t('mar'), date: '2026-06-19T22:00:00Z', ...v('at'), phase: 'GROUP_STAGE', group: 'C', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537341', homeTeam: t('bra'), awayTeam: t('hai'), date: '2026-06-20T00:30:00Z', ...v('lv'), phase: 'GROUP_STAGE', group: 'C', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537347', homeTeam: t('tur'), awayTeam: t('par'), date: '2026-06-20T03:00:00Z', ...v('sf'), phase: 'GROUP_STAGE', group: 'D', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537359', homeTeam: t('ned'), awayTeam: t('swe'), date: '2026-06-20T17:00:00Z', ...v('ml'), phase: 'GROUP_STAGE', group: 'F', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537353', homeTeam: t('ger'), awayTeam: t('civ'), date: '2026-06-20T20:00:00Z', ...v('lf'), phase: 'GROUP_STAGE', group: 'E', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537354', homeTeam: t('ecu'), awayTeam: t('cur'), date: '2026-06-21T00:00:00Z', ...v('al'), phase: 'GROUP_STAGE', group: 'E', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537360', homeTeam: t('tun'), awayTeam: t('jpn'), date: '2026-06-21T04:00:00Z', ...v('lu'), phase: 'GROUP_STAGE', group: 'F', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537371', homeTeam: t('esp'), awayTeam: t('ksa'), date: '2026-06-21T16:00:00Z', ...v('az'), phase: 'GROUP_STAGE', group: 'H', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537365', homeTeam: t('bel'), awayTeam: t('irn'), date: '2026-06-21T19:00:00Z', ...v('gi'), phase: 'GROUP_STAGE', group: 'G', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537372', homeTeam: t('uru'), awayTeam: t('cpv'), date: '2026-06-21T22:00:00Z', ...v('cf'), phase: 'GROUP_STAGE', group: 'H', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537366', homeTeam: t('nzl'), awayTeam: t('egy'), date: '2026-06-22T01:00:00Z', ...v('ar'), phase: 'GROUP_STAGE', group: 'G', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537399', homeTeam: t('arg'), awayTeam: t('aut'), date: '2026-06-22T17:00:00Z', ...v('bc'), phase: 'GROUP_STAGE', group: 'J', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537393', homeTeam: t('fra'), awayTeam: t('irq'), date: '2026-06-22T21:00:00Z', ...v('rb'), phase: 'GROUP_STAGE', group: 'I', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537394', homeTeam: t('nor'), awayTeam: t('sen'), date: '2026-06-23T00:00:00Z', ...v('at'), phase: 'GROUP_STAGE', group: 'I', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537400', homeTeam: t('jor'), awayTeam: t('alg'), date: '2026-06-23T03:00:00Z', ...v('sf'), phase: 'GROUP_STAGE', group: 'J', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537405', homeTeam: t('por'), awayTeam: t('uzb'), date: '2026-06-23T17:00:00Z', ...v('lv'), phase: 'GROUP_STAGE', group: 'K', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537411', homeTeam: t('eng'), awayTeam: t('gha'), date: '2026-06-23T20:00:00Z', ...v('ml'), phase: 'GROUP_STAGE', group: 'L', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537412', homeTeam: t('pan'), awayTeam: t('cro'), date: '2026-06-23T23:00:00Z', ...v('lf'), phase: 'GROUP_STAGE', group: 'L', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537406', homeTeam: t('col'), awayTeam: t('cod'), date: '2026-06-24T02:00:00Z', ...v('al'), phase: 'GROUP_STAGE', group: 'K', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537337', homeTeam: t('sui'), awayTeam: t('can'), date: '2026-06-24T19:00:00Z', ...v('bm'), phase: 'GROUP_STAGE', group: 'B', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537338', homeTeam: t('bih'), awayTeam: t('qat'), date: '2026-06-24T19:00:00Z', ...v('bc'), phase: 'GROUP_STAGE', group: 'B', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537344', homeTeam: t('mar'), awayTeam: t('hai'), date: '2026-06-24T22:00:00Z', ...v('lu'), phase: 'GROUP_STAGE', group: 'C', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537343', homeTeam: t('sco'), awayTeam: t('bra'), date: '2026-06-24T22:00:00Z', ...v('gi'), phase: 'GROUP_STAGE', group: 'C', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537331', homeTeam: t('cze'), awayTeam: t('mex'), date: '2026-06-25T01:00:00Z', ...v('ak'), phase: 'GROUP_STAGE', group: 'A', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537332', homeTeam: t('rsa'), awayTeam: t('kor'), date: '2026-06-25T01:00:00Z', ...v('bb'), phase: 'GROUP_STAGE', group: 'A', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537355', homeTeam: t('ecu'), awayTeam: t('ger'), date: '2026-06-25T20:00:00Z', ...v('cf'), phase: 'GROUP_STAGE', group: 'E', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537356', homeTeam: t('cur'), awayTeam: t('civ'), date: '2026-06-25T20:00:00Z', ...v('ar'), phase: 'GROUP_STAGE', group: 'E', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537361', homeTeam: t('tun'), awayTeam: t('ned'), date: '2026-06-25T23:00:00Z', ...v('rb'), phase: 'GROUP_STAGE', group: 'F', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537362', homeTeam: t('jpn'), awayTeam: t('swe'), date: '2026-06-25T23:00:00Z', ...v('at'), phase: 'GROUP_STAGE', group: 'F', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537349', homeTeam: t('tur'), awayTeam: t('usa'), date: '2026-06-26T02:00:00Z', ...v('ml'), phase: 'GROUP_STAGE', group: 'D', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537350', homeTeam: t('par'), awayTeam: t('aus'), date: '2026-06-26T02:00:00Z', ...v('sf'), phase: 'GROUP_STAGE', group: 'D', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537395', homeTeam: t('nor'), awayTeam: t('fra'), date: '2026-06-26T19:00:00Z', ...v('lv'), phase: 'GROUP_STAGE', group: 'I', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537396', homeTeam: t('sen'), awayTeam: t('irq'), date: '2026-06-26T19:00:00Z', ...v('lf'), phase: 'GROUP_STAGE', group: 'I', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537373', homeTeam: t('uru'), awayTeam: t('esp'), date: '2026-06-27T00:00:00Z', ...v('az'), phase: 'GROUP_STAGE', group: 'H', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537374', homeTeam: t('cpv'), awayTeam: t('ksa'), date: '2026-06-27T00:00:00Z', ...v('bb'), phase: 'GROUP_STAGE', group: 'H', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537367', homeTeam: t('nzl'), awayTeam: t('bel'), date: '2026-06-27T03:00:00Z', ...v('bc'), phase: 'GROUP_STAGE', group: 'G', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537368', homeTeam: t('egy'), awayTeam: t('irn'), date: '2026-06-27T03:00:00Z', ...v('bm'), phase: 'GROUP_STAGE', group: 'G', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537413', homeTeam: t('pan'), awayTeam: t('eng'), date: '2026-06-27T21:00:00Z', ...v('gi'), phase: 'GROUP_STAGE', group: 'L', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537414', homeTeam: t('cro'), awayTeam: t('gha'), date: '2026-06-27T21:00:00Z', ...v('cf'), phase: 'GROUP_STAGE', group: 'L', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537407', homeTeam: t('col'), awayTeam: t('por'), date: '2026-06-27T23:30:00Z', ...v('rb'), phase: 'GROUP_STAGE', group: 'K', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537408', homeTeam: t('cod'), awayTeam: t('uzb'), date: '2026-06-27T23:30:00Z', ...v('ar'), phase: 'GROUP_STAGE', group: 'K', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537401', homeTeam: t('jor'), awayTeam: t('arg'), date: '2026-06-28T02:00:00Z', ...v('at'), phase: 'GROUP_STAGE', group: 'J', status: 'SCHEDULED', score: { home: null, away: null } },
  { id: '537402', homeTeam: t('alg'), awayTeam: t('aut'), date: '2026-06-28T02:00:00Z', ...v('sf'), phase: 'GROUP_STAGE', group: 'J', status: 'SCHEDULED', score: { home: null, away: null } },
]
