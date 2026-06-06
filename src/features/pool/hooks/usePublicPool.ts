import { useEffect, useState, useMemo } from 'react'
import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/core/firebase/config'
import { useAuthStore } from '@/features/auth/store/authStore'

export interface PublicPrediction {
  userId: string
  matchId: string
  homeScore: number
  awayScore: number
  displayName: string
  photoURL: string | null
}

export interface MatchStats {
  total: number
  homeWinPct: number
  drawPct: number
  awayWinPct: number
  topScores: Array<{ home: number; away: number; count: number }>
  myPrediction: { homeScore: number; awayScore: number } | null
}

// ── Hook: listen to ALL public predictions ─────────────────────────────
// We load all predictions once and compute stats client-side.
// For scale this would be replaced by server-side aggregation.
export function usePublicPool() {
  const { user } = useAuthStore()
  const [predictions, setPredictions] = useState<PublicPrediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ref = collection(db, 'publicPredictions')
    const unsub = onSnapshot(ref, (snap) => {
      setPredictions(
        snap.docs.map((d) => {
          const data = d.data()
          return {
            userId: data.userId,
            matchId: data.matchId,
            homeScore: data.homeScore,
            awayScore: data.awayScore,
            displayName: data.displayName ?? 'Usuário',
            photoURL: data.photoURL ?? null,
          }
        }),
      )
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  // Pre-compute all match stats at once — stable object references per matchId
  const statsMap = useMemo(() => {
    const map = new Map<string, MatchStats>()
    const byMatch = new Map<string, PublicPrediction[]>()
    for (const p of predictions) {
      const arr = byMatch.get(p.matchId) ?? []
      arr.push(p)
      byMatch.set(p.matchId, arr)
    }

    byMatch.forEach((forMatch, matchId) => {
      const total = forMatch.length
      const myRaw = user ? forMatch.find((p) => p.userId === user.uid) : null
      const myPrediction = myRaw ? { homeScore: myRaw.homeScore, awayScore: myRaw.awayScore } : null

      if (total === 0) {
        map.set(matchId, { total: 0, homeWinPct: 0, drawPct: 0, awayWinPct: 0, topScores: [], myPrediction })
        return
      }

      const homeWins = forMatch.filter((p) => p.homeScore > p.awayScore).length
      const draws    = forMatch.filter((p) => p.homeScore === p.awayScore).length
      const awayWins = forMatch.filter((p) => p.awayScore > p.homeScore).length

      const scoreMap = new Map<string, number>()
      for (const p of forMatch) {
        const key = `${p.homeScore}-${p.awayScore}`
        scoreMap.set(key, (scoreMap.get(key) ?? 0) + 1)
      }
      const topScores = Array.from(scoreMap.entries())
        .map(([key, count]) => { const [h, a] = key.split('-').map(Number); return { home: h, away: a, count } })
        .sort((a, b) => b.count - a.count).slice(0, 3)

      map.set(matchId, {
        total,
        homeWinPct: Math.round((homeWins / total) * 100),
        drawPct: Math.round((draws / total) * 100),
        awayWinPct: Math.round((awayWins / total) * 100),
        topScores, myPrediction,
      })
    })
    return map
  }, [predictions, user])

  const emptyStats: MatchStats = { total: 0, homeWinPct: 0, drawPct: 0, awayWinPct: 0, topScores: [], myPrediction: null }

  function getMatchStats(matchId: string): MatchStats {
    return statsMap.get(matchId) ?? emptyStats
  }

  const totalParticipants = useMemo(() => new Set(predictions.map((p) => p.userId)).size, [predictions])
  const totalPredictions  = predictions.length

  return { predictions, loading, getMatchStats, totalParticipants, totalPredictions }
}

// ── Save public prediction ─────────────────────────────────────────────
export async function savePublicPrediction(
  userId: string,
  matchId: string,
  homeScore: number,
  awayScore: number,
  displayName: string,
  photoURL: string | null,
): Promise<void> {
  const predId = `${userId}_${matchId}`
  await setDoc(doc(db, 'publicPredictions', predId), {
    userId,
    matchId,
    homeScore,
    awayScore,
    displayName,
    photoURL,
    submittedAt: serverTimestamp(),
  })
}
