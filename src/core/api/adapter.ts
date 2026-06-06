import type { FootballAPIAdapter } from './types'
import { mockAdapter } from './mock/adapter'

// ── Seleção automática da fonte de dados ──────────────────────────────
// Prioridade:
//   1. VITE_FOOTBALL_DATA_TOKEN definido → football-data.org (dados ao vivo)
//   2. Caso contrário → mock com dados reais do sorteio (Copa 2026)
//
// Para dados ao vivo: registre-se gratuitamente em
//   https://www.football-data.org/client/register
// e adicione ao .env:
//   VITE_FOOTBALL_DATA_TOKEN=sua_chave_aqui

async function createAdapter(): Promise<FootballAPIAdapter> {
  const token = import.meta.env.VITE_FOOTBALL_DATA_TOKEN as string | undefined

  if (token && token.length > 0) {
    const { footballDataAdapter } = await import('./football-data/adapter')
    return footballDataAdapter
  }

  return mockAdapter
}

// Singleton — resolvido uma vez na inicialização
let _adapter: FootballAPIAdapter | null = null

export async function getAdapter(): Promise<FootballAPIAdapter> {
  if (!_adapter) _adapter = await createAdapter()
  return _adapter
}

// Conveniência: proxy síncrono que delega ao adapter resolvido
export const api: FootballAPIAdapter = {
  getTeams:     (...a) => getAdapter().then(ad => ad.getTeams(...a)).catch(() => mockAdapter.getTeams(...a)),
  getMatches:   (...a) => getAdapter().then(ad => ad.getMatches(...a)).catch(() => mockAdapter.getMatches(...a)),
  getStandings: (...a) => getAdapter().then(ad => ad.getStandings(...a)).catch(() => mockAdapter.getStandings(...a)),
  getBracket:   (...a) => getAdapter().then(ad => ad.getBracket(...a)).catch(() => mockAdapter.getBracket(...a)),
}
