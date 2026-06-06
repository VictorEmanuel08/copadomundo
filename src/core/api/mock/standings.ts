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

export { GROUPS }
