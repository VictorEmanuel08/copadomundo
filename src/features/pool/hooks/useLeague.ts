import { useState, useEffect } from 'react'
import {
  doc, setDoc, getDoc, deleteDoc,
  collection, onSnapshot, getDocs,
  serverTimestamp, updateDoc, writeBatch,
} from 'firebase/firestore'
import { db } from '@/core/firebase/config'
import { useAuthStore } from '@/features/auth/store/authStore'
import { nanoid } from 'nanoid'

export interface LeagueScoring {
  winner: number
  draw: number
  exactScore: number
}

export type MatchScope = 'all' | 'team' | 'custom'

export interface LeagueConfig {
  name: string
  description: string
  scoring: LeagueScoring
  matchScope?: MatchScope
  scopeTeamId?: string
  scopeMatchIds?: string[]
}

export interface League {
  id: string
  ownerId: string
  name: string
  description: string
  inviteCode: string
  isPublic: boolean
  config: {
    scoring: LeagueScoring
  }
  matchScope: MatchScope
  scopeTeamIds?: string[]
  scopeMatchIds?: string[]
  createdAt: Date | null
}

export interface LeagueMember {
  userId: string
  displayName: string
  photoURL: string | null
  joinedAt: Date | null
  totalPoints?: number
}

export interface Prediction {
  id: string
  userId: string
  matchId: string
  homeScore: number
  awayScore: number
  comment?: string
  submittedAt: Date | null
}

export interface ChampionPrediction {
  userId: string
  teamId: string
  submittedAt: Date | null
}

export interface MemberCustomTeam {
  name?: string
  acronym?: string
  playerName?: string
  playerNumber?: string
  showOnJersey?: boolean
  playerNameColor?: string
  textScale?: number
  formation?: string
  kit?: {
    primaryColor: string
    secondaryColor: string
    pattern: string
    collar: string
    outlineColor?: string
    showOutline?: boolean
    showCrestOnJersey?: boolean
  }
  crest?: {
    primaryColor: string
    secondaryColor: string
    shape: string
    pattern: string
    stars: number
    showOutline?: boolean
    outlineColor?: string
    starsColor?: string
  }
}

export function calculateMatchPoints(
  prediction: { homeScore: number; awayScore: number },
  result: { home: number; away: number },
  scoring: LeagueScoring,
): number {
  const exactHome = prediction.homeScore === result.home
  const exactAway = prediction.awayScore === result.away
  if (exactHome && exactAway) return scoring.exactScore
  const predWinner = Math.sign(prediction.homeScore - prediction.awayScore)
  const realWinner = Math.sign(result.home - result.away)
  if (predWinner !== realWinner) return 0
  return predWinner === 0 ? scoring.draw : scoring.winner
}



export function useLeague() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createLeague(config: LeagueConfig): Promise<string> {
    if (!user) throw new Error('Não autenticado')
    setLoading(true); setError(null)
    try {
      const inviteCode = nanoid(8).toUpperCase()
      const leagueId = nanoid(12)
      const leagueData = {
        id: leagueId, ownerId: user.uid,
        name: config.name, description: config.description,
        inviteCode, isPublic: false,
        config: { scope: 'all', type: 'full', scoring: config.scoring },
        matchScope: config.matchScope ?? 'all',
        scopeTeamId: config.scopeTeamId ?? null,
        scopeMatchIds: config.scopeMatchIds ?? [],
        createdAt: serverTimestamp(), membersCount: 1,
      }
      await setDoc(doc(db, 'leagues', leagueId), leagueData)
      await setDoc(doc(db, 'invites', inviteCode), { leagueId, createdAt: serverTimestamp() })
      await setDoc(doc(db, 'leagues', leagueId, 'members', user.uid), {
        userId: user.uid, displayName: user.name ?? 'Usuário',
        photoURL: user.photoURL ?? null, joinedAt: serverTimestamp(),
      })
      await setDoc(doc(db, 'users', user.uid, 'leagues', leagueId), {
        leagueId, name: config.name, inviteCode, role: 'owner', joinedAt: serverTimestamp(),
      })
      return leagueId
    } finally { setLoading(false) }
  }

  async function joinLeague(inviteCode: string): Promise<string> {
    if (!user) throw new Error('Não autenticado')
    const code = inviteCode.trim().toUpperCase()
    setLoading(true); setError(null)
    try {
      const inviteSnap = await getDoc(doc(db, 'invites', code))
      if (!inviteSnap.exists()) throw new Error('Código de convite inválido.')
      const { leagueId } = inviteSnap.data() as { leagueId: string }
      const leagueSnap = await getDoc(doc(db, 'leagues', leagueId))
      if (!leagueSnap.exists()) throw new Error('Liga não encontrada.')
      const league = leagueSnap.data() as League
      const memberSnap = await getDoc(doc(db, 'leagues', leagueId, 'members', user.uid))
      if (memberSnap.exists()) return leagueId
      await setDoc(doc(db, 'leagues', leagueId, 'members', user.uid), {
        userId: user.uid, displayName: user.name ?? 'Usuário',
        photoURL: user.photoURL ?? null, joinedAt: serverTimestamp(),
      })
      await setDoc(doc(db, 'users', user.uid, 'leagues', leagueId), {
        leagueId, name: league.name, inviteCode: code,
        role: 'member', joinedAt: serverTimestamp(),
      })
      return leagueId
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao entrar na liga.')
      throw err
    } finally { setLoading(false) }
  }

  return { createLeague, joinLeague, loading, error }
}

export function useLeagueAdmin(leagueId: string | undefined) {
  const [saving, setSaving] = useState(false)

  async function editLeague(updates: Partial<{
    name: string
    description: string
    scoring: LeagueScoring
    matchScope: MatchScope
    scopeTeamIds: string[]
    scopeMatchIds: string[]
  }>) {
    if (!leagueId) return
    setSaving(true)
    try {
      const patch: Record<string, any> = {}
      if (updates.name !== undefined) patch['name'] = updates.name
      if (updates.description !== undefined) patch['description'] = updates.description
      if (updates.scoring !== undefined) patch['config.scoring'] = updates.scoring
      if (updates.matchScope !== undefined) patch['matchScope'] = updates.matchScope
      if (updates.scopeTeamIds !== undefined) patch['scopeTeamIds'] = updates.scopeTeamIds
      if (updates.scopeMatchIds !== undefined) patch['scopeMatchIds'] = updates.scopeMatchIds
      await updateDoc(doc(db, 'leagues', leagueId), patch)
    } finally { setSaving(false) }
  }

  async function deleteLeagueWithCleanup(inviteCode: string, ownerId: string) {
    if (!leagueId) return
    setSaving(true)
    try {
      // ── Fase 1: buscar sub-coleções (enquanto o doc da liga ainda existe) ──
      const [membersSnap, predsSnap, champSnap] = await Promise.all([
        getDocs(collection(db, 'leagues', leagueId, 'members')),
        getDocs(collection(db, 'leagues', leagueId, 'predictions')),
        getDocs(collection(db, 'leagues', leagueId, 'champion_predictions')),
      ])
      const memberIds = membersSnap.docs.map((d) => d.id)

      // ── Fase 2: tentar limpar sub-coleções (requer regras atualizadas) ──
      // Falha silenciosa: se as regras antigas ainda estiverem ativas, ignora e continua.
      const allSubDocs = [...membersSnap.docs, ...predsSnap.docs, ...champSnap.docs]
      const BATCH_SIZE = 450
      for (let i = 0; i < allSubDocs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db)
        allSubDocs.slice(i, i + BATCH_SIZE).forEach((d) => batch.delete(d.ref))
        await batch.commit().catch((e) =>
          console.warn('[cleanup] falha ao remover sub-coleções:', e),
        )
      }

      // ── Fase 3: deletar o documento da liga e o convite ──
      // O owner SEMPRE tem permissão para isso — é o que efetivamente exclui a liga.
      await deleteDoc(doc(db, 'invites', inviteCode))
      await deleteDoc(doc(db, 'leagues', leagueId))

      // ── Fase 4: limpar refs users/{uid}/leagues/{leagueId} ──
      await deleteDoc(doc(db, 'users', ownerId, 'leagues', leagueId))
      await Promise.allSettled(
        memberIds
          .filter((id) => id !== ownerId)
          .map((id) => deleteDoc(doc(db, 'users', id, 'leagues', leagueId))),
      )
    } finally { setSaving(false) }
  }

  return { editLeague, deleteLeagueWithCleanup, saving }
}

export interface MyLeagueEntry {
  leagueId: string; name: string; inviteCode: string
  role: 'owner' | 'member'; joinedAt: Date | null
}

export function useMyLeagues() {
  const { user } = useAuthStore()
  const [leagues, setLeagues] = useState<MyLeagueEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLeagues([]); setLoading(false); return }
    const ref = collection(db, 'users', user.uid, 'leagues')
    const unsub = onSnapshot(ref, (snap) => {
      const entries = snap.docs.map((d) => {
        const data = d.data()
        return { leagueId: data.leagueId, name: data.name, inviteCode: data.inviteCode,
          role: data.role, joinedAt: data.joinedAt?.toDate?.() ?? null } as MyLeagueEntry
      })
      entries.sort((a, b) => (b.joinedAt?.getTime() ?? 0) - (a.joinedAt?.getTime() ?? 0))
      setLeagues(entries); setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [user])

  return { leagues, loading }
}

export function useLeagueDetails(leagueId: string | undefined) {
  const [league, setLeague] = useState<League | null>(null)
  const [members, setMembers] = useState<LeagueMember[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!leagueId) return
    setLoading(true)
    const unsub1 = onSnapshot(doc(db, 'leagues', leagueId), (snap) => {
      if (!snap.exists()) { setNotFound(true); setLoading(false); return }
      const d = snap.data()
      setLeague({
        id: snap.id, ownerId: d.ownerId, name: d.name,
        description: d.description ?? '', inviteCode: d.inviteCode,
        isPublic: d.isPublic ?? false,
        config: { scoring: d.config?.scoring ?? { winner: 3, draw: 1, exactScore: 5 } },
        matchScope: d.matchScope ?? 'all',
        scopeTeamIds: d.scopeTeamIds ?? (d.scopeTeamId ? [d.scopeTeamId] : []),
        scopeMatchIds: d.scopeMatchIds ?? [],
        createdAt: d.createdAt?.toDate?.() ?? null,
      })
      setLoading(false)
    }, () => setLoading(false))

    const unsub2 = onSnapshot(collection(db, 'leagues', leagueId, 'members'), (snap) => {
      setMembers(snap.docs.map((d) => {
        const m = d.data()
        return { userId: m.userId, displayName: m.displayName ?? 'Usuário',
          photoURL: m.photoURL ?? null, joinedAt: m.joinedAt?.toDate?.() ?? null }
      }))
    })

    return () => { unsub1(); unsub2() }
  }, [leagueId])

  return { league, members, loading, notFound }
}

export function useLeaguePredictions(leagueId: string | undefined) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  useEffect(() => {
    if (!leagueId) return
    const unsub = onSnapshot(collection(db, 'leagues', leagueId, 'predictions'), (snap) => {
      setPredictions(snap.docs.map((d) => {
        const data = d.data()
        return { id: d.id, userId: data.userId, matchId: data.matchId,
          homeScore: data.homeScore, awayScore: data.awayScore,
          comment: data.comment ?? '',
          submittedAt: data.submittedAt?.toDate?.() ?? null }
      }))
    })
    return unsub
  }, [leagueId])
  return predictions
}

export function useMembersCustomTeams(memberIds: string[]) {
  const [teams, setTeams] = useState<Record<string, MemberCustomTeam>>({})
  const key = memberIds.join(',')

  useEffect(() => {
    if (!memberIds.length) return
    Promise.all(
      memberIds.map((uid) =>
        getDoc(doc(db, 'customTeams', uid)).then((snap) => ({ uid, data: snap.data() as MemberCustomTeam | undefined }))
      )
    ).then((results) => {
      const map: Record<string, MemberCustomTeam> = {}
      results.forEach(({ uid, data }) => { if (data) map[uid] = data })
      setTeams(map)
    }).catch(console.error)
  // 'key' é uma string derivada de memberIds.join(',') para evitar
  // re-execuções desnecessárias quando a referência do array muda
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return teams
}

export async function savePrediction(
  leagueId: string, userId: string, matchId: string,
  homeScore: number, awayScore: number, comment?: string,
  matchDate?: string,
): Promise<void> {
  const data: Record<string, unknown> = {
    userId, matchId, homeScore, awayScore,
    comment: comment ?? '',
    submittedAt: serverTimestamp(),
  }
  // Store lock timestamp (10 min before kick-off) so Firestore rules can enforce it
  if (matchDate) {
    const lockedAt = new Date(new Date(matchDate).getTime() - 10 * 60 * 1000)
    data.matchLockedAt = lockedAt
  }
  await setDoc(doc(db, 'leagues', leagueId, 'predictions', `${userId}_${matchId}`), data)
}

export async function deletePrediction(
  leagueId: string, userId: string, matchId: string,
): Promise<void> {
  await deleteDoc(doc(db, 'leagues', leagueId, 'predictions', `${userId}_${matchId}`))
}

export function useChampionPrediction(leagueId: string | undefined) {
  const [champions, setChampions] = useState<ChampionPrediction[]>([])

  useEffect(() => {
    if (!leagueId) return
    const unsub = onSnapshot(collection(db, 'leagues', leagueId, 'champion_predictions'), (snap) => {
      setChampions(snap.docs.map((d) => ({
        userId: d.data().userId,
        teamId: d.data().teamId,
        submittedAt: d.data().submittedAt?.toDate?.() ?? null,
      })))
    })
    return unsub
  }, [leagueId])

  return champions
}

export async function saveChampionPrediction(
  leagueId: string, userId: string, teamId: string,
): Promise<void> {
  await setDoc(doc(db, 'leagues', leagueId, 'champion_predictions', userId), {
    userId, teamId, submittedAt: serverTimestamp(),
  })
}

export function computeStreak(
  userId: string,
  predictions: Prediction[],
  matches: { id: string; status: string; score: { home: number | null; away: number | null }; date: string }[],
  scoring: LeagueScoring,
): number {
  const finished = matches
    .filter((m) => m.status === 'FINISHED' && m.score.home !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const myPreds = new Map(
    predictions.filter((p) => p.userId === userId).map((p) => [p.matchId, p])
  )

  let streak = 0
  for (const match of finished) {
    const pred = myPreds.get(match.id)
    if (!pred) break
    const pts = calculateMatchPoints(
      { homeScore: pred.homeScore, awayScore: pred.awayScore },
      { home: match.score.home!, away: match.score.away! },
      scoring,
    )
    if (pts > 0) streak++
    else break
  }
  return streak
}

export async function leaveLeague(leagueId: string, userId: string): Promise<void> {
  await deleteDoc(doc(db, 'leagues', leagueId, 'members', userId))
  await deleteDoc(doc(db, 'users', userId, 'leagues', leagueId))
}
