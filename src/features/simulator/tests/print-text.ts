import { chromium } from 'playwright'

const PORT = 5174
const BASE_URL = `http://localhost:${PORT}`

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(`${BASE_URL}/standings`)
  await page.waitForTimeout(2000)
  
  const text = await page.innerText('body')
  console.log('--- BODY TEXT START ---')
  console.log(text)
  console.log('--- BODY TEXT END ---')

  await browser.close()
}

run().catch(console.error)
