import { useState, useEffect, useMemo } from 'react'
import { X, Shield, Swords, ListChecks } from 'lucide-react'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '@/core/firebase/config'
import { KitPreview } from '@/features/custom-team/components/KitPreview'
import { CrestPreview } from '@/features/custom-team/components/CrestPreview'
import { FormationDiagram } from '@/features/custom-team/pages/CustomTeamPage'
import { TeamFlag } from '@/shared/components/TeamFlag'
import { cn } from '@/lib/utils'
import { calculateMatchPoints } from '../hooks/useLeague'
import type { Prediction, LeagueMember } from '../hooks/useLeague'
import type { Match } from '@/core/api/types'

interface ParticipantModalProps {
  member: LeagueMember
  predictions: Prediction[]   // all predictions in the league
  matches: Match[]
  scoring: { winner: number; draw: number; exactScore: number }
  onClose: () => void
  currentUserId?: string
}

interface CustomTeamData {
  name?: string
  acronym?: string
  formation?: string
  showOnJersey?: boolean
  kit?: { primaryColor: string; secondaryColor: string; tertiaryColor: string; pattern: string; collar: string; numberColor: string }
  crest?: { primaryColor: string; secondaryColor: string; shape: string; pattern: string; stars: number }
  playerName?: string
  playerNumber?: string
  playerNameColor?: string
}

type ModalTab = 'perfil' | 'palpites' | 'h2h'

export function ParticipantModal({
  member, predictions, matches, scoring, onClose, currentUserId,
}: ParticipantModalProps) {
  const [ct, setCt] = useState<CustomTeamData | null>(null)
  const [tab, setTab] = useState<ModalTab>('perfil')

  useEffect(() => {
    getDoc(doc(db, 'customTeams', member.userId))
      .then((snap) => { if (snap.exists()) setCt(snap.data() as CustomTeamData) })
      .catch(console.error)
  }, [member.userId])

  const myPreds = useMemo(() =>
    predictions.filter((p) => p.userId === member.userId),
    [predictions, member.userId]
  )

  const myPredMap = useMemo(() => {
    const m: Record<string, Prediction> = {}
    myPreds.forEach((p) => { m[p.matchId] = p })
    return m
  }, [myPreds])

  const currentUserPredMap = useMemo(() => {
    const m: Record<string, Prediction> = {}
    if (currentUserId) {
      predictions.filter((p) => p.userId === currentUserId)
        .forEach((p) => { m[p.matchId] = p })
    }
    return m
  }, [predictions, currentUserId])

  const totalPoints = useMemo(() => {
    let pts = 0
    myPreds.forEach((pred) => {
      const match = matches.find((m) => m.id === pred.matchId)
      if (!match || match.status !== 'FINISHED' || match.score.home === null) return
      pts += calculateMatchPoints(
        { homeScore: pred.homeScore, awayScore: pred.awayScore },
        { home: match.score.home!, away: match.score.away! }, scoring,
      )
    })
    return pts
  }, [myPreds, matches, scoring])

  const matchesWithPreds = useMemo(() =>
    matches.filter((m) => myPredMap[m.id]).slice(0, 30),
    [matches, myPredMap]
  )

  const isMe = member.userId === currentUserId

  function predBadge(pred: Prediction, match: Match) {
    if (match.status !== 'FINISHED' || match.score.home === null) return null
    const pts = calculateMatchPoints(
      { homeScore: pred.homeScore, awayScore: pred.awayScore },
      { home: match.score.home!, away: match.score.away! }, scoring,
    )
    if (pts === scoring.exactScore) return '🎯'
    if (pts > 0) return '✅'
    return '❌'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-lg max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-border bg-background overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 shrink-0">
          {member.photoURL ? (
            <img src={member.photoURL} className="h-10 w-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <span className="font-black text-primary">{member.displayName[0]?.toUpperCase()}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-black text-base truncate">{member.displayName}</p>
            {ct?.name && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <Shield size={10} /> {ct.name}
                {ct.acronym && <span className="font-mono font-bold ml-0.5 text-foreground/80">{ct.acronym}</span>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-black text-primary">{totalPoints} pts</span>
            <button onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/50 hover:bg-muted transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-muted/40 p-1 mx-5 mt-3 rounded-xl border border-border/30 shrink-0">
          {([
            { id: 'perfil', label: 'Seleção', icon: <Shield size={11} /> },
            { id: 'palpites', label: 'Palpites', icon: <ListChecks size={11} /> },
            ...(currentUserId && !isMe ? [{ id: 'h2h', label: 'H2H', icon: <Swords size={11} /> }] : []),
          ] as { id: ModalTab; label: string; icon: React.ReactNode }[]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as ModalTab)}
              className={cn('flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold transition-all',
                tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* ── Perfil / Seleção ── */}
          {tab === 'perfil' && (
            <div className="space-y-4">
              {ct ? (
                <>
                  {/* Jersey + Crest */}
                  <div className="flex items-center justify-center gap-8 py-4 rounded-2xl bg-gradient-to-b from-slate-950 to-emerald-950 border border-border/20">
                    {ct.kit && (
                      <KitPreview
                        primaryColor={ct.kit.primaryColor} secondaryColor={ct.kit.secondaryColor}
                        tertiaryColor={ct.kit.tertiaryColor} pattern={ct.kit.pattern as any}
                        collar={ct.kit.collar as any} numberColor={ct.kit.numberColor}
                        number={ct?.showOnJersey && ct?.playerNumber ? ct.playerNumber : undefined}
                        playerName={ct?.showOnJersey && ct?.playerName ? ct.playerName : undefined}
                        playerNameColor={ct?.playerNameColor}
                        size="md"
                      />
                    )}
                    {ct.crest && (
                      <div className="flex flex-col items-center gap-2">
                        <CrestPreview
                          primaryColor={ct.crest.primaryColor} secondaryColor={ct.crest.secondaryColor}
                          acronym={ct.acronym || '???'} shape={ct.crest.shape as any}
                          pattern={ct.crest.pattern as any} stars={ct.crest.stars} size="lg"
                        />
                        {ct.name && <p className="text-white text-xs font-black text-center">{ct.name}</p>}
                      </div>
                    )}
                    {!ct.kit && !ct.crest && (
                      <p className="text-muted-foreground text-sm">Seleção não personalizada.</p>
                    )}
                  </div>

                  {/* Formation */}
                  {ct.formation && ct.kit && (
                    <div className="rounded-2xl bg-emerald-950/60 border border-emerald-800/30 p-4 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Swords size={10} /> Tática: {ct.formation}
                      </p>
                      <FormationDiagram
                        formation={ct.formation}
                        primary={ct.kit.primaryColor}
                        secondary={ct.kit.secondaryColor}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="py-10 text-center text-muted-foreground text-sm">
                  <Shield size={32} className="mx-auto mb-2 opacity-20" />
                  Este participante ainda não criou sua seleção.
                </div>
              )}
            </div>
          )}

          {/* ── Palpites ── */}
          {tab === 'palpites' && (
            <div className="space-y-2">
              {matchesWithPreds.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-sm">
                  <ListChecks size={32} className="mx-auto mb-2 opacity-20" />
                  Nenhum palpite enviado ainda.
                </div>
              ) : (
                matchesWithPreds.map((m) => {
                  const pred = myPredMap[m.id]!
                  const badge = predBadge(pred, m)
                  return (
                    <div key={m.id}
                      className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
                      <div className="flex flex-1 items-center gap-1.5 min-w-0 justify-end">
                        <span className="text-xs font-bold truncate">{m.homeTeam.shortName}</span>
                        <TeamFlag code={m.homeTeam.code} name={m.homeTeam.name} size={14} />
                      </div>
                      <div className="flex flex-col items-center shrink-0">
                        <span className="text-sm font-black tabular-nums text-primary">
                          {pred.homeScore} × {pred.awayScore}
                        </span>
                        {badge && <span className="text-[10px]">{badge}</span>}
                        {m.status === 'FINISHED' && m.score.home !== null && (
                          <span className="text-[9px] text-muted-foreground">
                            ({m.score.home}×{m.score.away})
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 items-center gap-1.5 min-w-0">
                        <TeamFlag code={m.awayTeam.code} name={m.awayTeam.name} size={14} />
                        <span className="text-xs font-bold truncate">{m.awayTeam.shortName}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* ── Head-to-Head ── */}
          {tab === 'h2h' && currentUserId && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                Você vs {member.displayName.split(' ')[0]}
              </p>
              {matches.filter((m) => myPredMap[m.id] || currentUserPredMap[m.id]).slice(0, 30).map((m) => {
                const theirPred = myPredMap[m.id]
                const myPred = currentUserPredMap[m.id]
                return (
                  <div key={m.id} className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center justify-center gap-1.5 py-1.5 bg-muted/20 border-b border-border/30">
                      <TeamFlag code={m.homeTeam.code} name={m.homeTeam.name} size={12} />
                      <span className="text-[10px] font-bold">{m.homeTeam.shortName}</span>
                      <span className="text-muted-foreground/40 text-[10px]">vs</span>
                      <span className="text-[10px] font-bold">{m.awayTeam.shortName}</span>
                      <TeamFlag code={m.awayTeam.code} name={m.awayTeam.name} size={12} />
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-border/30">
                      <div className={cn('flex flex-col items-center py-2 px-3', !myPred && 'opacity-40')}>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase">Você</p>
                        <p className="text-base font-black tabular-nums text-foreground mt-0.5">
                          {myPred ? `${myPred.homeScore}×${myPred.awayScore}` : '—'}
                        </p>
                        {myPred && m.status === 'FINISHED' && m.score.home !== null && (
                          <span className="text-xs">{predBadge(myPred, m)}</span>
                        )}
                      </div>
                      <div className={cn('flex flex-col items-center py-2 px-3', !theirPred && 'opacity-40')}>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase">{member.displayName.split(' ')[0]}</p>
                        <p className="text-base font-black tabular-nums text-primary mt-0.5">
                          {theirPred ? `${theirPred.homeScore}×${theirPred.awayScore}` : '—'}
                        </p>
                        {theirPred && m.status === 'FINISHED' && m.score.home !== null && (
                          <span className="text-xs">{predBadge(theirPred, m)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
