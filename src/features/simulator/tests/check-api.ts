import { api } from '../../../core/api/adapter'

async function run() {
  console.log('[DIAGNOSTIC] Chamando api.getStandings()...')
  try {
    const standings = await api.getStandings()
    console.log('[DIAGNOSTIC] Retorno com sucesso! Total de linhas:', standings.length)
    if (standings.length > 0) {
      console.log('[DIAGNOSTIC] Exemplo de linha:', JSON.stringify(standings[0], null, 2))
    }
  } catch (err) {
    console.error('[DIAGNOSTIC] ERRO CAPTURADO:', err)
  }
}

run()
