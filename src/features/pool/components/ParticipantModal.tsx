import { useState, useEffect, useMemo } from "react"
import { X, Shield, Swords, ListChecks, Trophy } from "lucide-react"
import { TEAMS } from "@/core/api/mock/teams"
import { getDoc, doc } from "firebase/firestore"
import { db } from "@/core/firebase/config"
import { KitPreview } from "@/features/custom-team/components/KitPreview"
import { CrestPreview } from "@/features/custom-team/components/CrestPreview"
import { FormationDiagram } from "@/features/custom-team/pages/CustomTeamPage"
import { TeamFlag } from "@/shared/components/TeamFlag"
import { cn } from "@/lib/utils"
import { calculateMatchPoints } from "../hooks/useLeague"
import type { Prediction, LeagueMember } from "../hooks/useLeague"
import type { Match } from "@/core/api/types"

interface ParticipantModalProps {
  member: LeagueMember
  predictions: Prediction[]
  matches: Match[]
  scoring: { winner: number; draw: number; exactScore: number }
  champions?: { userId: string; teamId: string }[]
  onClose: () => void
  currentUserId?: string
}

interface CustomTeamData {
  name?: string
  acronym?: string
  formation?: string
  showOnJersey?: boolean
  textScale?: number
  playerName?: string
  playerNumber?: string
  playerNameColor?: string
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

type ModalTab = "perfil" | "palpites" | "1x1"

export function ParticipantModal({
  member,
  predictions,
  matches,
  scoring,
  champions = [],
  onClose,
  currentUserId,
}: ParticipantModalProps) {
  const [ct, setCt] = useState<CustomTeamData | null>(null)
  const [tab, setTab] = useState<ModalTab>("perfil")

  const championPick = useMemo(() => {
    const pick = champions.find((c) => c.userId === member.userId)
    if (!pick) return null
    return TEAMS.find((t) => t.id === pick.teamId) ?? null
  }, [champions, member.userId])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  useEffect(() => {
    getDoc(doc(db, "customTeams", member.userId))
      .then((snap) => {
        if (snap.exists()) setCt(snap.data() as CustomTeamData)
      })
      .catch(console.error)
  }, [member.userId])

  const myPreds = useMemo(
    () => predictions.filter((p) => p.userId === member.userId),
    [predictions, member.userId]
  )

  const myPredMap = useMemo(() => {
    const m: Record<string, Prediction> = {}
    myPreds.forEach((p) => {
      m[p.matchId] = p
    })
    return m
  }, [myPreds])

  const currentUserPredMap = useMemo(() => {
    const m: Record<string, Prediction> = {}
    if (currentUserId) {
      predictions
        .filter((p) => p.userId === currentUserId)
        .forEach((p) => {
          m[p.matchId] = p
        })
    }
    return m
  }, [predictions, currentUserId])

  const totalPoints = useMemo(() => {
    let pts = 0
    myPreds.forEach((pred) => {
      const match = matches.find((m) => m.id === pred.matchId)
      if (!match || match.status !== "FINISHED" || match.score.home === null)
        return
      pts += calculateMatchPoints(
        { homeScore: pred.homeScore, awayScore: pred.awayScore },
        { home: match.score.home!, away: match.score.away! },
        scoring
      )
    })
    return pts
  }, [myPreds, matches, scoring])

  const matchesWithPreds = useMemo(
    () => matches.filter((m) => myPredMap[m.id]).slice(0, 30),
    [matches, myPredMap]
  )

  const isMe = member.userId === currentUserId

  function predBadge(pred: Prediction, match: Match) {
    if (match.status !== "FINISHED" || match.score.home === null) return null
    const pts = calculateMatchPoints(
      { homeScore: pred.homeScore, awayScore: pred.awayScore },
      { home: match.score.home!, away: match.score.away! },
      scoring
    )
    if (pts === scoring.exactScore) return "🎯"
    if (pts > 0) return "✅"
    return "❌"
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border/40 px-5 py-4">
          {member.photoURL ? (
            <img
              src={member.photoURL}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <span className="font-black text-primary">
                {member.displayName[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-black">
              {member.displayName}
            </p>
            {ct?.name && (
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Shield size={10} /> {ct.name}
                {ct.acronym && (
                  <span className="ml-0.5 font-mono font-bold text-foreground/80">
                    {ct.acronym}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-sm font-black text-primary">
              {totalPoints} pts
            </span>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/50 transition-colors hover:bg-muted"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-5 mt-3 flex shrink-0 gap-0.5 rounded-xl border border-border/30 bg-muted/40 p-1">
          {(
            [
              { id: "perfil", label: "Seleção", icon: <Shield size={11} /> },
              {
                id: "palpites",
                label: "Palpites",
                icon: <ListChecks size={11} />,
              },
              ...(currentUserId && !isMe
                ? [{ id: "1x1", label: "1X1", icon: <Swords size={11} /> }]
                : []),
            ] as { id: ModalTab; label: string; icon: React.ReactNode }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as ModalTab)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold transition-all",
                tab === t.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* ── Perfil / Seleção ── */}
          {tab === "perfil" && (
            <div className="space-y-4">
              {ct ? (
                <>
                  {/* Jersey + Crest */}
                  <div className="flex items-center justify-center gap-8 rounded-2xl border border-border/20 bg-gradient-to-b from-slate-950 to-emerald-950 py-4">
                    {ct.kit && (
                      <KitPreview
                        primaryColor={ct.kit.primaryColor}
                        secondaryColor={ct.kit.secondaryColor}
                        pattern={ct.kit.pattern as any}
                        collar={ct.kit.collar as any}
                        numberColor={ct.playerNameColor ?? '#ffffff'}
                        outlineColor={ct.kit.outlineColor}
                        showOutline={ct.kit.showOutline ?? true}
                        showCrest={ct.kit.showCrestOnJersey}
                        crestPrimary={ct.crest?.primaryColor}
                        crestSecondary={ct.crest?.outlineColor ?? ct.crest?.secondaryColor}
                        crestShape={ct.crest?.shape as any}
                        crestPattern={ct.crest?.pattern as any}
                        crestAcronym={ct.acronym}
                        crestStars={ct.crest?.stars}
                        number={ct.showOnJersey && ct.playerNumber ? ct.playerNumber : undefined}
                        playerName={ct.showOnJersey && ct.playerName ? ct.playerName : undefined}
                        playerNameColor={ct.playerNameColor}
                        textScale={ct.textScale}
                        size="md"
                      />
                    )}
                    {ct.crest && (
                      <div className="flex flex-col items-center gap-2">
                        <CrestPreview
                          primaryColor={ct.crest.primaryColor}
                          secondaryColor={ct.crest.secondaryColor}
                          acronym={ct.acronym || "???"}
                          shape={ct.crest.shape as any}
                          pattern={ct.crest.pattern as any}
                          stars={ct.crest.stars}
                          showOutline={ct.crest.showOutline ?? true}
                          outlineColor={ct.crest.outlineColor}
                          starsColor={ct.crest.starsColor}
                          size="lg"
                        />
                        {ct.name && (
                          <p className="text-center text-xs font-black text-white">
                            {ct.name}
                          </p>
                        )}
                      </div>
                    )}
                    {!ct.kit && !ct.crest && (
                      <p className="text-sm text-muted-foreground">
                        Seleção não personalizada.
                      </p>
                    )}
                  </div>

                  {/* Formation */}
                  {ct.formation && ct.kit && (
                    <div className="space-y-2 rounded-2xl border border-emerald-800/30 bg-emerald-950/60 p-4">
                      <p className="flex items-center gap-1.5 text-[10px] font-black tracking-wider text-emerald-400 uppercase">
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
                <div className="py-10 text-center text-sm text-muted-foreground">
                  <Shield size={32} className="mx-auto mb-2 opacity-20" />
                  Este participante ainda não criou sua seleção.
                </div>
              )}

              {/* Champion pick */}
              <div className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3",
                championPick
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-border/30 bg-muted/20"
              )}>
                <Trophy size={16} className={championPick ? "text-amber-500 shrink-0" : "text-muted-foreground/30 shrink-0"} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-500/80">Aposta no Campeão</p>
                  {championPick ? (
                    <div className="mt-1 flex items-center gap-2">
                      <TeamFlag code={championPick.code} name={championPick.name} size={20} />
                      <span className="text-sm font-black">{championPick.name}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Ainda não escolheu</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Palpites ── */}
          {tab === "palpites" && (
            <div className="space-y-2">
              {matchesWithPreds.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  <ListChecks size={32} className="mx-auto mb-2 opacity-20" />
                  Nenhum palpite enviado ainda.
                </div>
              ) : (
                matchesWithPreds.map((m) => {
                  const pred = myPredMap[m.id]!
                  const finished = m.status === "FINISHED" && m.score.home !== null
                  const pts = finished
                    ? calculateMatchPoints(
                        { homeScore: pred.homeScore, awayScore: pred.awayScore },
                        { home: m.score.home!, away: m.score.away! },
                        scoring,
                      )
                    : null
                  const isExact = pts === scoring.exactScore
                  const isRight = pts !== null && pts > 0 && !isExact

                  const borderColor = !finished
                    ? "border-border"
                    : isExact
                    ? "border-emerald-500/50"
                    : isRight
                    ? "border-blue-500/40"
                    : "border-red-500/30"

                  const bgColor = !finished
                    ? "bg-card"
                    : isExact
                    ? "bg-emerald-500/5"
                    : isRight
                    ? "bg-blue-500/5"
                    : "bg-red-500/5"

                  return (
                    <div key={m.id} className={cn("overflow-hidden rounded-xl border", borderColor, bgColor)}>
                      {/* Teams row */}
                      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
                        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
                          <span className="truncate text-xs font-bold">{m.homeTeam.shortName}</span>
                          <TeamFlag code={m.homeTeam.code} name={m.homeTeam.name} size={15} />
                        </div>
                        <span className="shrink-0 text-[10px] text-muted-foreground/50 font-bold">vs</span>
                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                          <TeamFlag code={m.awayTeam.code} name={m.awayTeam.name} size={15} />
                          <span className="truncate text-xs font-bold">{m.awayTeam.shortName}</span>
                        </div>
                      </div>

                      {/* Scores comparison */}
                      <div className="flex items-stretch gap-0 pb-2.5 px-3">
                        {/* Prediction */}
                        <div className="flex flex-1 flex-col items-center gap-0.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">Palpite</span>
                          <span className={cn(
                            "text-base font-black tabular-nums",
                            !finished ? "text-foreground" : isExact ? "text-emerald-500" : isRight ? "text-blue-400" : "text-red-400"
                          )}>
                            {pred.homeScore} – {pred.awayScore}
                          </span>
                        </div>

                        {/* Divider + result badge */}
                        <div className="flex flex-col items-center justify-center px-2 gap-0.5">
                          <div className="h-full w-px bg-border/40" />
                          {finished && pts !== null && (
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-[9px] font-black",
                              isExact ? "bg-emerald-500/15 text-emerald-500" : isRight ? "bg-blue-500/15 text-blue-400" : "bg-red-500/10 text-red-400"
                            )}>
                              {isExact ? "🎯 Exato" : isRight ? "✅ Certo" : "❌ Errou"}
                            </span>
                          )}
                        </div>

                        {/* Real score */}
                        <div className="flex flex-1 flex-col items-center gap-0.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">
                            {finished ? "Placar Real" : "Aguardando"}
                          </span>
                          <span className="text-base font-black tabular-nums text-muted-foreground">
                            {finished ? `${m.score.home} – ${m.score.away}` : "– – –"}
                          </span>
                        </div>
                      </div>

                      {/* Points earned */}
                      {finished && pts !== null && pts > 0 && (
                        <div className={cn(
                          "flex items-center justify-center gap-1 py-1 text-[10px] font-black",
                          isExact ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-400"
                        )}>
                          +{pts} pts
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* ── Head-to-Head ── */}
          {tab === "1x1" && currentUserId && (
            <div className="space-y-3">
              <p className="text-center text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Você vs {member.displayName.split(" ")[0]}
              </p>
              {matches
                .filter((m) => myPredMap[m.id] || currentUserPredMap[m.id])
                .slice(0, 30)
                .map((m) => {
                  const theirPred = myPredMap[m.id]
                  const myPred = currentUserPredMap[m.id]
                  return (
                    <div
                      key={m.id}
                      className="overflow-hidden rounded-xl border border-border bg-card"
                    >
                      <div className="flex items-center justify-center gap-1.5 border-b border-border/30 bg-muted/20 py-1.5">
                        <TeamFlag
                          code={m.homeTeam.code}
                          name={m.homeTeam.name}
                          size={12}
                        />
                        <span className="text-[10px] font-bold">
                          {m.homeTeam.shortName}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40">
                          vs
                        </span>
                        <span className="text-[10px] font-bold">
                          {m.awayTeam.shortName}
                        </span>
                        <TeamFlag
                          code={m.awayTeam.code}
                          name={m.awayTeam.name}
                          size={12}
                        />
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-border/30">
                        <div
                          className={cn(
                            "flex flex-col items-center px-3 py-2",
                            !myPred && "opacity-40"
                          )}
                        >
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">
                            Você
                          </p>
                          <p className="mt-0.5 text-base font-black text-foreground tabular-nums">
                            {myPred
                              ? `${myPred.homeScore}×${myPred.awayScore}`
                              : "—"}
                          </p>
                          {myPred &&
                            m.status === "FINISHED" &&
                            m.score.home !== null && (
                              <span className="text-xs">
                                {predBadge(myPred, m)}
                              </span>
                            )}
                        </div>
                        <div
                          className={cn(
                            "flex flex-col items-center px-3 py-2",
                            !theirPred && "opacity-40"
                          )}
                        >
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">
                            {member.displayName.split(" ")[0]}
                          </p>
                          <p className="mt-0.5 text-base font-black text-primary tabular-nums">
                            {theirPred
                              ? `${theirPred.homeScore}×${theirPred.awayScore}`
                              : "—"}
                          </p>
                          {theirPred &&
                            m.status === "FINISHED" &&
                            m.score.home !== null && (
                              <span className="text-xs">
                                {predBadge(theirPred, m)}
                              </span>
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
