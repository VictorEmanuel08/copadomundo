import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'

const PORT = 5174
const BASE_URL = `http://localhost:${PORT}`
const SCREENSHOT_DIR = path.resolve('C:/Users/victo/.gemini/antigravity-ide/brain/1b760048-1b5d-4a5e-8003-e77412ba6fba')

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

async function run() {
  console.log('[SCREENSHOTS] Iniciando automação do navegador...')
  const browser = await chromium.launch({ headless: true })
  
  // ── DESKTOP VIEWPORT ────────────────────────────────────────────────
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  })
  const page = await context.newPage()

  // 1. Screenshot da classificação real da Copa (Aba Grupos Geral /standings)
  console.log('[SCREENSHOTS] Navegando para /standings (Classificação real)...')
  await page.goto(`${BASE_URL}/standings`)
  await page.waitForTimeout(1000)
  
  // Garante que está no modo escuro inicialmente
  const htmlElement = await page.locator('html')
  const isDark = await htmlElement.evaluate(el => el.classList.contains('dark'))
  if (!isDark) {
    await page.keyboard.press('d')
    await page.waitForTimeout(500)
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'standings_desktop_dark.png') })
  console.log('[SCREENSHOTS] Salvo: standings_desktop_dark.png')

  // Alterna para modo claro na classificação
  await page.keyboard.press('d')
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'standings_desktop_light.png') })
  console.log('[SCREENSHOTS] Salvo: standings_desktop_light.png')

  // Retorna para modo escuro
  await page.keyboard.press('d')
  await page.waitForTimeout(500)

  // 1.5 Screenshot do Chaveamento Real (/bracket)
  console.log('[SCREENSHOTS] Navegando para /bracket (Chaveamento real)...')
  await page.goto(`${BASE_URL}/bracket`)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'bracket_live_desktop_dark.png') })
  console.log('[SCREENSHOTS] Salvo: bracket_live_desktop_dark.png')

  // Alterna para modo claro no chaveamento real
  await page.keyboard.press('d')
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'bracket_live_desktop_light.png') })
  console.log('[SCREENSHOTS] Salvo: bracket_live_desktop_light.png')

  // Retorna para modo escuro
  await page.keyboard.press('d')
  await page.waitForTimeout(500)

  // 2. Navegando para o Simulador (/simulador)
  console.log('[SCREENSHOTS] Navegando para /simulador...')
  await page.goto(`${BASE_URL}/simulador`)
  await page.waitForTimeout(1000)

  // Screenshot de Grupos (vazio)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'simulador_groups_empty_dark.png') })
  console.log('[SCREENSHOTS] Salvo: simulador_groups_empty_dark.png')

  // Clicar em algumas posições no Grupo A (México 1º, África do Sul 2º, Coreia do Sul 3º)
  console.log('[SCREENSHOTS] Simulando preenchimento parcial (Grupo A)...')
  const groupA = page.locator('#group-A')
  const rowsA = groupA.locator('div.flex.items-center.justify-between.px-3.py-2')
  
  // México -> 1º
  await rowsA.nth(0).locator('button:has-text("1º")').click()
  await page.waitForTimeout(100)
  // África do Sul -> 2º
  await rowsA.nth(1).locator('button:has-text("2º")').click()
  await page.waitForTimeout(100)
  // Coreia do Sul -> 3º
  await rowsA.nth(2).locator('button:has-text("3º")').click()
  await page.waitForTimeout(200)

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'simulador_groups_partial_dark.png') })
  console.log('[SCREENSHOTS] Salvo: simulador_groups_partial_dark.png')

  // Preencher todos os outros grupos (B a L) para completar a fase de grupos
  console.log('[SCREENSHOTS] Preenchendo todos os 12 grupos...')
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
  for (const g of groups) {
    // Ignora Grupo A que já preenchemos
    if (g === 'A') continue
    
    const groupEl = page.locator(`#group-${g}`)
    const rows = groupEl.locator('div.flex.items-center.justify-between.px-3.py-2')
    
    // Team 1 -> 1º, Team 2 -> 2º, Team 3 -> 3º
    await rows.nth(0).locator('button:has-text("1º")').click()
    await page.waitForTimeout(50)
    await rows.nth(1).locator('button:has-text("2º")').click()
    await page.waitForTimeout(50)
    await rows.nth(2).locator('button:has-text("3º")').click()
    await page.waitForTimeout(50)
  }
  await page.waitForTimeout(500)

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'simulador_groups_complete_dark.png') })
  console.log('[SCREENSHOTS] Salvo: simulador_groups_complete_dark.png')

  // Auto-selecionar os 8 melhores terceiros colocados
  console.log('[SCREENSHOTS] Selecionando os 8 melhores terceiros...')
  await page.locator('button:has-text("Auto-Selecionar")').click()
  await page.waitForTimeout(1000) // Aguarda a transição automática para a aba do mata-mata

  // Screenshot do mata-mata inicial (incompleto)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'simulador_bracket_incomplete_dark.png') })
  console.log('[SCREENSHOTS] Salvo: simulador_bracket_incomplete_dark.png')

  // Simular confrontos do Mata-mata clicando nos vencedores para avançar
  console.log('[SCREENSHOTS] Simulando confrontos do mata-mata (R32 -> Final)...')
  
  // Vamos buscar os Match Cards no bracket e clicar na primeira linha de cada um para definir o vencedor
  // 1. R32 (16 jogos)
  console.log('  - Simulando R32...')
  const cards = page.locator('div.w-36.overflow-hidden.rounded-xl.border')
  const count = await cards.count()
  console.log(`  - Encontrados ${count} cards de jogos no bracket.`)
  
  // R32 matches are the first 16 cards in terms of index (or we can click the ones that have active text buttons)
  // Let's click the first team (home) of each card that is click-enabled
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i)
    const buttons = card.locator('button')
    // Click home team if enabled
    if (await buttons.nth(0).isEnabled()) {
      await buttons.nth(0).click()
      await page.waitForTimeout(30)
    }
  }
  await page.waitForTimeout(500)

  // 2. Repete cliques para rodadas seguintes (R16, QF, SF, Finals)
  console.log('  - Avançando R16, Quartas, Semis e Finais...')
  for (let round = 0; round < 4; round++) {
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i)
      const buttons = card.locator('button')
      if (await buttons.nth(0).isEnabled()) {
        await buttons.nth(0).click()
        await page.waitForTimeout(30)
      }
    }
    await page.waitForTimeout(300)
  }

  // Tira print do chaveamento completo com o Campeão Definido
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'simulador_bracket_complete_dark.png') })
  console.log('[SCREENSHOTS] Salvo: simulador_bracket_complete_dark.png')

  // Alterna para Light Mode no mata-mata completo
  await page.keyboard.press('d')
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'simulador_bracket_complete_light.png') })
  console.log('[SCREENSHOTS] Salvo: simulador_bracket_complete_light.png')

  // Retorna para Dark Mode
  await page.keyboard.press('d')
  await page.waitForTimeout(300)


  // ── MOBILE VIEWPORT ──────────────────────────────────────────────────
  console.log('[SCREENSHOTS] Iniciando captura do viewport mobile...')
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true
  })
  const mPage = await mobileContext.newPage()
  
  // Navega para simulador
  await mPage.goto(`${BASE_URL}/simulador`)
  await mPage.waitForTimeout(1000)

  // Grupos mobile
  await mPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'simulador_mobile_groups_dark.png') })
  console.log('[SCREENSHOTS] Salvo: simulador_mobile_groups_dark.png')

  // Completa grupos no mobile rapidamente via URL state
  const stateUrl = await page.url()
  const stateParam = new URL(stateUrl).searchParams.get('state')
  
  if (stateParam) {
    console.log('[SCREENSHOTS] Restaurando estado no mobile via URL state...')
    await mPage.goto(`${BASE_URL}/simulador?state=${stateParam}`)
    await mPage.waitForTimeout(1500)

    // Chaveamento mobile
    await mPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'simulador_mobile_bracket_dark.png') })
    console.log('[SCREENSHOTS] Salvo: simulador_mobile_bracket_dark.png')
  }

  await browser.close()
  console.log('[SCREENSHOTS] Concluído com sucesso!')
}

run().catch(console.error)
