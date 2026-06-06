import fetch from 'node-fetch'

const TOKEN = '8aa33b5b13c541a6b4b7b0ed0962bff2'

async function run() {
  console.log('[DIAGNOSTIC] Fetching raw live standings from football-data.org...')
  const res = await fetch('https://api.football-data.org/v4/competitions/WC/standings?season=2026', {
    headers: { 'X-Auth-Token': TOKEN }
  })
  
  console.log('[DIAGNOSTIC] Status:', res.status, res.statusText)
  const json = (await res.json()) as any
  console.log('[DIAGNOSTIC] JSON keys:', Object.keys(json))
  
  if (json.standings) {
    console.log('[DIAGNOSTIC] Standings count:', json.standings.length)
    if (json.standings.length > 0) {
      console.log('[DIAGNOSTIC] First standing section:', JSON.stringify(json.standings[0], null, 2))
    }
  } else {
    console.log('[DIAGNOSTIC] Response body:', JSON.stringify(json, null, 2))
  }
}

run().catch(console.error)
