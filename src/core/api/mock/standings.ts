import type { Standing } from '../types'
import { TEAMS, GROUPS } from './teams'

// Gera standings zerados para todos os grupos (estado inicial pré-torneio)
export function buildInitialStandings(): Standing[] {
  return TEAMS.map((team) => {
    const teamsInGroup = TEAMS.filter((t) => t.group === team.group)
    const position = teamsInGroup.findIndex((t) => t.id === team.id) + 1
    return {
      team,
      group: team.group,
      position,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    }
  })
}

export const INITIAL_STANDINGS = buildInitialStandings()

// Standings atualizados manualmente — dados reais (Fonte: Google / FIFA, 23/06/2026)
// Usado como fallback quando o Firestore ainda não tem dados corretos
function s(id: string, group: string, pos: number, pts: number, j: number, v: number, e: number, d: number, gf: number, gc: number): Standing {
  const team = TEAMS.find(t => t.id === id)!
  return { team, group, position: pos, played: j, won: v, drawn: e, lost: d, goalsFor: gf, goalsAgainst: gc, goalDiff: gf - gc, points: pts }
}

export const CURRENT_STANDINGS: Standing[] = [
  // Grupo A
  s('mex','A',1,6,2,2,0,0,3,0), s('kor','A',2,3,2,1,0,1,2,2), s('cze','A',3,1,2,0,1,1,2,3), s('rsa','A',4,1,2,0,1,1,1,3),
  // Grupo B
  s('can','B',1,4,2,1,1,0,7,1), s('sui','B',2,4,2,1,1,0,5,2), s('bih','B',3,1,2,0,1,1,2,5), s('qat','B',4,1,2,0,1,1,1,7),
  // Grupo C
  s('bra','C',1,4,2,1,1,0,4,1), s('mar','C',2,4,2,1,1,0,2,1), s('sco','C',3,3,2,1,0,1,1,1), s('hai','C',4,0,2,0,0,2,0,4),
  // Grupo D
  s('usa','D',1,6,2,2,0,0,6,1), s('aus','D',2,3,2,1,0,1,2,2), s('par','D',3,3,2,1,0,1,2,4), s('tur','D',4,0,2,0,0,2,0,3),
  // Grupo E
  s('ger','E',1,6,2,2,0,0,9,2), s('civ','E',2,3,2,1,0,1,2,2), s('ecu','E',3,1,2,0,1,1,0,1), s('cur','E',4,1,2,0,1,1,1,7),
  // Grupo F
  s('ned','F',1,4,2,1,1,0,7,3), s('jpn','F',2,4,2,1,1,0,6,2), s('swe','F',3,3,2,1,0,1,6,6), s('tun','F',4,0,2,0,0,2,1,9),
  // Grupo G — Egito, Irã, Bélgica, Nova Zelândia
  s('egy','G',1,4,2,1,1,0,4,2), s('irn','G',2,2,2,0,2,0,2,2), s('bel','G',3,2,2,0,2,0,1,1), s('nzl','G',4,1,2,0,1,1,3,5),
  // Grupo H — Espanha, Uruguai, Cabo Verde, Arábia Saudita
  s('esp','H',1,4,2,1,1,0,4,0), s('uru','H',2,2,2,0,2,0,3,3), s('cpv','H',3,2,2,0,2,0,2,2), s('ksa','H',4,1,2,0,1,1,1,5),
  // Grupo I
  s('fra','I',1,6,2,2,0,0,6,1), s('nor','I',2,6,2,2,0,0,7,3), s('sen','I',3,0,2,0,0,2,3,6), s('irq','I',4,0,2,0,0,2,1,7),
  // Grupo J
  s('arg','J',1,6,2,2,0,0,5,0), s('aut','J',2,3,2,1,0,1,3,3), s('alg','J',3,3,2,1,0,1,2,4), s('jor','J',4,0,2,0,0,2,2,5),
  // Grupo K
  s('col','K',1,3,1,1,0,0,3,1), s('cod','K',2,1,1,0,1,0,1,1), s('por','K',3,1,1,0,1,0,1,1), s('uzb','K',4,0,1,0,0,1,1,3),
  // Grupo L
  s('eng','L',1,3,1,1,0,0,4,2), s('gha','L',2,3,1,1,0,0,1,0), s('pan','L',3,0,1,0,0,1,0,1), s('cro','L',4,0,1,0,0,1,2,4),
]

export { GROUPS }
