// ══════════════════════════════════════════════════════════════════════
// world-cup-bracket — Serialização de URL
// Toda a simulação é comprimida em ?s=<base64> para compartilhamento
// ══════════════════════════════════════════════════════════════════════

import type { SimState, GroupLetter } from './types'
import { ALL_GROUPS } from './types'
import { TEAMS } from '@/core/api/mock/teams'

// IDs dos times em ordem global para compressão
const TEAM_IDS = TEAMS.map(t => t.id)
function teamIndex(id: string | null): number {
  if (!id) return -1
  return TEAM_IDS.indexOf(id)
}
function teamById(idx: number): string | null {
  return idx >= 0 && idx < TEAM_IDS.length ? TEAM_IDS[idx] : null
}

// ── Serializar ─────────────────────────────────────────────────────────
export function serializeState(state: SimState): string {
  const compact = {
    g: ALL_GROUPS.map((group: GroupLetter) => {
      const r = state.groups[group]
      return [
        teamIndex(r?.first  ?? null),
        teamIndex(r?.second ?? null),
        teamIndex(r?.third  ?? null),
      ]
    }),
    t: state.thirds.map(id => teamIndex(id)),
    b: Object.entries(state.bracket)
      .filter(([, v]) => v !== null)
      .map(([k, v]) => [k, teamIndex(v as string)]),
  }
  try {
    const json = JSON.stringify(compact)
    // btoa com URL-safe encoding
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  } catch {
    return ''
  }
}

// ── Deserializar ───────────────────────────────────────────────────────
export function deserializeState(encoded: string): SimState | null {
  try {
    // Restaura padding base64
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4)
    const json = decodeURIComponent(escape(atob(padded)))
    const compact = JSON.parse(json)

    const groups = {} as SimState['groups']
    ALL_GROUPS.forEach((group: GroupLetter, i: number) => {
      const [f, s, t] = compact.g[i] ?? [-1, -1, -1]
      groups[group] = {
        first:  teamById(f),
        second: teamById(s),
        third:  teamById(t),
      }
    })

    const thirds: string[] = (compact.t ?? [])
      .map((idx: number) => teamById(idx))
      .filter(Boolean) as string[]

    const bracket: Record<string, string | null> = {}
    for (const [k, idx] of compact.b ?? []) {
      bracket[k] = teamById(idx as number)
    }

    return { groups, thirds, bracket }
  } catch {
    return null
  }
}

// ── Lê o estado da URL atual ───────────────────────────────────────────
export function readStateFromURL(): SimState | null {
  const params = new URLSearchParams(window.location.search)
  const s = params.get('state') || params.get('s')
  if (!s) return null
  return deserializeState(s)
}

// ── Gera URL compartilhável ────────────────────────────────────────────
export function buildShareURL(state: SimState): string {
  const encoded = serializeState(state)
  const url = new URL(window.location.href)
  url.pathname = '/simulador'
  url.search = `?state=${encoded}`
  return url.toString()
}

// ── Estado inicial vazio ───────────────────────────────────────────────
export function emptyState(): SimState {
  const groups = {} as SimState['groups']
  for (const g of ALL_GROUPS) {
    groups[g] = { first: null, second: null, third: null }
  }
  return { groups, thirds: [], bracket: {} }
}
