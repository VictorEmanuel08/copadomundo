import { useFirestoreCache } from '@/core/api/firestore-cache/useCache'
import { buildInitialStandings } from '@/core/api/mock/standings'
import type { Standing } from '@/core/api/types'

const hasValidGroups = (data: Standing[]) =>
  data.some((s) => s.group && s.group.length > 0)

export function useStandings() {
  return useFirestoreCache<Standing>(
    'standings',
    // Fallback: sempre retorna mock do sorteio (pré-torneio)
    async () => buildInitialStandings(),
    hasValidGroups,
  )
}
