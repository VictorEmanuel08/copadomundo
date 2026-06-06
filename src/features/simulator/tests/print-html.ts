import { chromium } from 'playwright'

const PORT = 5174
const BASE_URL = `http://localhost:${PORT}`

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto(`${BASE_URL}/standings`)
  await page.waitForTimeout(2000)
  
  const html = await page.innerHTML('body')
  console.log('[HTML DUMP] length:', html.length)
  console.log('[HTML DUMP] snippet:', html.substring(0, 2000))

  await browser.close()
}

run().catch(console.error)
