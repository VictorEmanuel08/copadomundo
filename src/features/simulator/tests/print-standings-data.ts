import { chromium } from 'playwright'

const PORT = 5174
const BASE_URL = `http://localhost:${PORT}`

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(`${BASE_URL}/standings`)
  await page.waitForTimeout(2000)
  
  const standingsData = await page.evaluate(() => {
    const html = document.querySelector('body')?.innerHTML
    return {
      htmlLength: html?.length,
      tablesCount: document.querySelectorAll('table').length,
      headers: Array.from(document.querySelectorAll('h3')).map(h => h.innerText),
      firstTableText: document.querySelector('table')?.innerText
    }
  })
  console.log(standingsData)
  await browser.close()
}

run().catch(console.error)
