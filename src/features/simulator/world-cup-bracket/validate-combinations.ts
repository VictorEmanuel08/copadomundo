import { THIRD_PLACE_COMBINATIONS } from '../data/third-place-combinations'
import type { GroupLetter } from './types'

// Slots da R32 que recebem terceiros colocados e seus grupos permitidos (Annex C)
interface R32ThirdSlot {
  matchNum: number
  winnerGroup: GroupLetter // O grupo do vencedor que enfrenta o terceiro colocado neste slot
  thirdPossible: GroupLetter[]
}

const R32_THIRD_SLOTS: R32ThirdSlot[] = [
  { matchNum: 74, winnerGroup: 'E', thirdPossible: ['A', 'B', 'C', 'D', 'F'] },
  { matchNum: 77, winnerGroup: 'I', thirdPossible: ['C', 'D', 'F', 'G', 'H'] },
  { matchNum: 79, winnerGroup: 'A', thirdPossible: ['C', 'E', 'F', 'H', 'I'] },
  { matchNum: 80, winnerGroup: 'L', thirdPossible: ['E', 'H', 'I', 'J', 'K'] },
  { matchNum: 81, winnerGroup: 'D', thirdPossible: ['B', 'E', 'F', 'I', 'J'] },
  { matchNum: 82, winnerGroup: 'G', thirdPossible: ['A', 'E', 'H', 'I', 'J'] },
  { matchNum: 85, winnerGroup: 'B', thirdPossible: ['E', 'F', 'G', 'I', 'J'] },
  { matchNum: 87, winnerGroup: 'K', thirdPossible: ['D', 'E', 'I', 'J', 'L'] },
]

function getCombinations(arr: string[], k: number): string[][] {
  const result: string[][] = []
  function helper(start: number, combo: string[]) {
    if (combo.length === k) {
      result.push([...combo])
      return
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i])
      helper(i + 1, combo)
      combo.pop()
    }
  }
  helper(0, [])
  return result
}

export function runValidation() {
  const groups: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
  const combos = getCombinations(groups, 8)
  
  console.log(`[TESTS] Iniciando validação de todas as ${combos.length} combinações possíveis...`)
  
  let successCount = 0
  let errorCount = 0
  const failures: string[] = []

  for (const combo of combos) {
    const key = combo.sort().join('')
    const mapping = THIRD_PLACE_COMBINATIONS[key]

    if (!mapping) {
      errorCount++
      failures.push(`Combinação "${key}": Não encontrada no mapeamento THIRD_PLACE_COMBINATIONS.`)
      continue
    }

    // Validar se o mapeamento tem exatamente 8 entradas (um para cada slot do R32)
    const keys = Object.keys(mapping)
    if (keys.length !== 8) {
      errorCount++
      failures.push(`Combinação "${key}": Possui ${keys.length} slots mapeados (esperado: 8).`)
      continue
    }

    const assignedGroups = new Set<string>()
    let isComboValid = true

    // Verificar cada slot mapeado
    for (const slot of R32_THIRD_SLOTS) {
      const winnerKey = `1${slot.winnerGroup}` // ex: "1E"
      const assignedVal = mapping[winnerKey] // ex: "3F"

      if (!assignedVal) {
        isComboValid = false
        failures.push(`Combinação "${key}": Slot para vencedor "${winnerKey}" não configurado.`)
        break
      }

      if (!assignedVal.startsWith('3')) {
        isComboValid = false
        failures.push(`Combinação "${key}": Valor do terceiro colocado "${assignedVal}" não começa com "3".`)
        break
      }

      const assignedGroup = assignedVal.substring(1) as GroupLetter // "F"

      // O grupo designado deve fazer parte da combinação selecionada
      if (!combo.includes(assignedGroup)) {
        isComboValid = false
        failures.push(`Combinação "${key}": Grupo designado "${assignedGroup}" não faz parte dos selecionados (${combo.join(', ')}).`)
        break
      }

      // O grupo designado deve ser um dos possíveis para este slot específico
      if (!slot.thirdPossible.includes(assignedGroup)) {
        isComboValid = false
        failures.push(`Combinação "${key}": Grupo designado "${assignedGroup}" não é permitido no slot de R32 do vencedor 1${slot.winnerGroup} (possíveis: ${slot.thirdPossible.join(', ')}).`)
        break
      }

      // Verificar se não há duplicatas de atribuição
      if (assignedGroups.has(assignedGroup)) {
        isComboValid = false
        failures.push(`Combinação "${key}": Grupo "${assignedGroup}" atribuído mais de uma vez.`)
        break
      }

      assignedGroups.add(assignedGroup)
    }

    if (isComboValid) {
      successCount++
    } else {
      errorCount++
    }
  }

  console.log('──────────────────────────────────────────────────')
  console.log(`[TESTS] Resumo da validação:`)
  console.log(`  - Total de combinações testadas: ${combos.length}`)
  console.log(`  - Combinações válidas (Sucesso): ${successCount}`)
  console.log(`  - Combinações inválidas/erros: ${errorCount}`)
  console.log('──────────────────────────────────────────────────')

  if (errorCount > 0) {
    console.error(`[TESTS] FALHA: Foram encontrados ${errorCount} erros nas combinações.`)
    console.error(failures.slice(0, 10).join('\n'))
    if (failures.length > 10) {
      console.log(`... e mais ${failures.length - 10} erros ocultados.`)
    }
    process.exit(1)
  } else {
    console.log(`[TESTS] SUCESSO: Todas as 495 combinações oficiais da FIFA 2026 foram validadas com sucesso!`)
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('validate-combinations.ts')) {
  runValidation()
}
