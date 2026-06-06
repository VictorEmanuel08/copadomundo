import fetch from 'node-fetch'

const TOKEN = '8aa33b5b13c541a6b4b7b0ed0962bff2'

async function run() {
  const res = await fetch('https://api.football-data.org/v4/competitions/WC/standings?season=2026', {
    headers: { 'X-Auth-Token': TOKEN }
  })
  
  const json: any = await res.json()
  console.log('TOTAL STANDINGS SECTIONS:', json.standings?.length)
  if (json.standings && json.standings.length > 0) {
    for (let i = 0; i < json.standings.length; i++) {
      const section = json.standings[i]
      console.log(`Section ${i}:`, {
        stage: section.stage,
        type: section.type,
        group: section.group,
        tableRowsCount: section.table?.length
      })
    }
  }
}

run().catch(console.error)
