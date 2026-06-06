import { chromium } from 'playwright'

const PORT = 5174
const BASE_URL = `http://localhost:${PORT}`

async function run() {
  console.log('[DIAGNOSTIC] Launching browser...')
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  page.on('console', (msg) => {
    console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`)
  })

  page.on('pageerror', (err) => {
    console.error('[BROWSER PAGE ERROR]', err)
  })

  console.log('[DIAGNOSTIC] Navigating to /standings...')
  await page.goto(`${BASE_URL}/standings`)
  await page.waitForTimeout(2000)

  const title = await page.title()
  console.log('[DIAGNOSTIC] Page title:', title)

  const bodyText = await page.innerText('body')
  console.log('[DIAGNOSTIC] Standings page contains "Classificação":', bodyText.includes('Classificação'))
  console.log('[DIAGNOSTIC] Standings page contains "Grupo A":', bodyText.includes('Grupo A'))
  console.log('[DIAGNOSTIC] Standings page contains "Grupo L":', bodyText.includes('Grupo L'))
  console.log('[DIAGNOSTIC] Standings page contains "México":', bodyText.includes('México'))

  console.log('[DIAGNOSTIC] Navigating to /bracket...')
  await page.goto(`${BASE_URL}/bracket`)
  await page.waitForTimeout(2000)

  const bracketBodyText = await page.innerText('body')
  console.log('[DIAGNOSTIC] Bracket page contains "Chaveamento":', bracketBodyText.includes('Chaveamento'))
  console.log('[DIAGNOSTIC] Bracket page contains "16-avos de final":', bracketBodyText.includes('16-avos de final'))
  console.log('[DIAGNOSTIC] Bracket page contains "3º A/B/C/D/F":', bracketBodyText.includes('3º A/B/C/D/F'))

  await browser.close()
  console.log('[DIAGNOSTIC] Finished browser check.')
}

run().catch(console.error)
