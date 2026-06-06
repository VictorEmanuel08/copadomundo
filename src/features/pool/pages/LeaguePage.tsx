import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Copy, Check, Users, Trophy, ListChecks, Info,
  Loader2, LogOut, Crown, Settings, Trash2, Lock,
  Share2, Shield, Swords, AlertTriangle, Search,
  Download, Radio,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useMatches } from '@/features/calendar/hooks/useMatches'
import { TeamFlag } from '@/shared/components/TeamFlag'
import { CrestPreview } from '@/features/custom-team/components/CrestPreview'
import { TEAMS } from '@/core/api/mock/teams'
import { cn } from '@/lib/utils'
import { ScoreInput } from '../components/ScoreInput'
import { ParticipantModal } from '../components/ParticipantModal'
import { useDialog } from '@/shared/components/ConfirmDialog'
import { toast } from 'sonner'
import {
  useLeagueDetails, useLeaguePredictions, useLeagueAdmin,
  useMembersCustomTeams, useChampionPrediction,
  savePrediction, saveChampionPrediction, leaveLeague,
  calculateMatchPoints, computeStreak,
  type LeagueMember, type Prediction, type MatchScope,
} from '../hooks/useLeague'
import type { Match } from '@/core/api/types'

// ── Helpers ────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).replace(',', ' ·')
}

function isMatchLocked(match: Match): boolean {
  if (match.status !== 'SCHEDULED') return true
  return new Date(match.date).getTime() - Date.now() < 30 * 60 * 1000
}

function InviteCodeBadge({ code }: { code: string }) {
  const copy = () => {
    navigator.clipboard.writeText(code)
    toast.success('Código copiado!', { description: `Código ${code} pronto para compartilhar.` })
  }
  return (
    <button onClick={copy}
      className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm font-mono font-bold tracking-widest hover:bg-muted transition-colors">
      <span>{code}</span>
      <Copy size={13} className="text-muted-foreground" />
    </button>
  )
}

// ── Phase label helper ──────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
  GROUP_STAGE:    'Fase de Grupos',
  ROUND_OF_32:    '1ª Rodada',
  ROUND_OF_16:    'Oitavas de Final',
  QUARTER_FINALS: 'Quartas de Final',
  SEMI_FINALS:    'Semifinal',
  THIRD_PLACE:    'Disputa do 3º Lugar',
  FINAL:          'Grande Final 🏆',
}

// ── Prediction row ─────────────────────────────────────────────────────

function PredictionRow({ match, existing, leagueId, userId, scoring }: {
  match: Match
  existing: Prediction | undefined
  leagueId: string
  userId: string
  scoring: { winner: number; draw: number; exactScore: number }
}) {
  const [home, setHome] = useState(existing?.homeScore ?? 0)
  const [away, setAway] = useState(existing?.awayScore ?? 0)
  const [comment, setComment] = useState(existing?.comment ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setHome(existing.homeScore); setAway(existing.awayScore)
      setComment(existing.comment ?? '')
    }
  }, [existing?.id])

  const locked = isMatchLocked(match)
  const isDone = match.status === 'FINISHED'
  const hasResult = match.score.home !== null && match.score.away !== null

  let pointsEarned: number | null = null
  if (isDone && hasResult && existing) {
    pointsEarned = calculateMatchPoints(
      { homeScore: existing.homeScore, awayScore: existing.awayScore },
      { home: match.score.home!, away: match.score.away! }, scoring,
    )
  }

  async function handleSave() {
    setSaving(true)
    try {
      await savePrediction(leagueId, userId, match.id, home, away, comment)
      toast.success(existing ? 'Palpite atualizado!' : 'Palpite enviado! 🎯', {
        description: `${match.homeTeam.shortName} ${home} × ${away} ${match.awayTeam.shortName}`,
      })
    } catch (e: any) {
      console.error(e)
      toast.error('Erro ao salvar palpite', {
        description: 'Verifique sua conexão e tente novamente.',
      })
    } finally { setSaving(false) }
  }

  function handleShare() {
    const scoreStr = existing ? `${existing.homeScore}×${existing.awayScore}` : `${home}×${away}`
    const text = `Meu palpite: ${match.homeTeam.shortName} ${scoreStr} ${match.awayTeam.shortName} — Copa 2026 ⚽`
    if (navigator.share) {
      navigator.share({ text })
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Palpite copiado!', { description: text, duration: 3000 })
    }
  }

  const isKnockout = match.phase !== 'GROUP_STAGE'

  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden transition-all',
      isDone ? 'border-border/40 bg-muted/10' : 'border-border bg-card',
      locked && !isDone && 'opacity-75',
    )}>
      {/* Header */}
      {isKnockout && (
        <div className="px-3 py-1 bg-primary/8 border-b border-primary/20">
          <span className="text-[9px] font-black uppercase tracking-widest text-primary">
            {PHASE_LABELS[match.phase] ?? match.phase}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30 bg-muted/20">
        <span className="text-[10px] font-semibold text-muted-foreground">{formatDate(match.date)}</span>
        <div className="flex items-center gap-2">
          {match.status === 'LIVE' && (
            <span className="flex items-center gap-1 text-[9px] font-black text-red-500 animate-pulse">
              <Radio size={9} /> AO VIVO
            </span>
          )}
          {locked && !isDone && match.status !== 'LIVE' && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500">
              <Lock size={9} /> Encerrado
            </span>
          )}
          {isDone && hasResult && existing !== undefined && (
            <span className={cn(
              'text-[10px] font-black px-2 py-0.5 rounded-full',
              pointsEarned! > 0 ? 'text-success bg-success/10' : 'text-muted-foreground/60 bg-muted/40',
            )}>
              {pointsEarned === scoring.exactScore ? '🎯' : pointsEarned! > 0 ? '✅' : '❌'} +{pointsEarned} pts
            </span>
          )}
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Teams + ScoreInputs */}
        <div className="flex items-center gap-2">
          {/* Home */}
          <div className="flex flex-1 items-center gap-1.5 min-w-0 justify-end">
            <span className="text-sm font-bold truncate">{match.homeTeam.shortName}</span>
            <TeamFlag code={match.homeTeam.code} name={match.homeTeam.name} size={20} />
          </div>

          {/* Score area */}
          <div className="shrink-0 flex items-center gap-1.5">
            {(isDone && hasResult) || (match.status === 'LIVE' && hasResult) ? (
              <div className={cn(
                'flex items-center gap-2 px-3 py-1 rounded-xl border',
                match.status === 'LIVE'
                  ? 'bg-red-500/10 border-red-500/40 text-red-400'
                  : 'bg-muted/40 border-border/40',
              )}>
                <span className="text-base font-black tabular-nums">{match.score.home}</span>
                <span className="text-muted-foreground/50 font-bold">—</span>
                <span className="text-base font-black tabular-nums">{match.score.away}</span>
              </div>
            ) : (
              <>
                <ScoreInput value={home} onChange={setHome} disabled={locked} size="sm" />
                <span className="text-muted-foreground/40 font-bold text-xs mx-0.5">×</span>
                <ScoreInput value={away} onChange={setAway} disabled={locked} size="sm" />
              </>
            )}
          </div>

          {/* Away */}
          <div className="flex flex-1 items-center gap-1.5 min-w-0">
            <TeamFlag code={match.awayTeam.code} name={match.awayTeam.name} size={20} />
            <span className="text-sm font-bold truncate">{match.awayTeam.shortName}</span>
          </div>
        </div>

        {/* Comment */}
        {!isDone && !locked && (
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentário opcional... (ex: Brasil vai golear 🔥)"
            maxLength={100}
            className="w-full rounded-xl border border-border/40 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:text-foreground transition-colors"
          />
        )}
        {isDone && existing?.comment && (
          <p className="text-[10px] text-muted-foreground/60 italic truncate">💬 "{existing.comment}"</p>
        )}

        {/* Save + Share buttons */}
        {!isDone && !locked && (
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 h-8 text-xs font-bold"
              disabled={saving} onClick={handleSave}>
              {saving ? <Loader2 size={12} className="animate-spin" />
                : existing ? 'Atualizar palpite' : 'Enviar palpite'}
            </Button>
            {existing && (
              <button onClick={handleShare}
                className="flex items-center gap-1 h-8 rounded-xl border border-border bg-muted/30 px-3 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
                <Share2 size={11} /> Compartilhar
              </button>
            )}
          </div>
        )}
        {isDone && existing && (
          <button onClick={handleShare}
            className="w-full flex items-center justify-center gap-1.5 h-7 rounded-xl border border-border/40 bg-muted/20 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">
            <Share2 size={10} /> Compartilhar palpite
          </button>
        )}
        {!isDone && locked && !existing && (
          <p className="text-center text-[10px] text-muted-foreground/50">Palpites encerrados para este jogo</p>
        )}
        {!isDone && locked && existing && (
          <p className="text-center text-[10px] text-muted-foreground/60">
            Seu palpite: <strong>{existing.homeScore} × {existing.awayScore}</strong>
          </p>
        )}
      </div>
    </div>
  )
}

// ── Leaderboard with custom teams ──────────────────────────────────────

function exportRankingImage(
  leagueName: string,
  ranked: Array<{ displayName: string; totalPoints: number; streak: number }>,
) {
  const W = 440, ROW_H = 58, HEADER_H = 90, FOOTER_H = 36
  const H = HEADER_H + ranked.length * ROW_H + FOOTER_H
  const canvas = document.createElement('canvas')
  canvas.width = W * 2; canvas.height = H * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#0f172a'); bg.addColorStop(1, '#1e293b')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Title
  ctx.fillStyle = '#3b82f6'; ctx.font = 'bold 18px system-ui, sans-serif'
  ctx.fillText('🏆 ' + leagueName, 20, 34)
  ctx.fillStyle = '#64748b'; ctx.font = '12px system-ui, sans-serif'
  ctx.fillText(`Classificação · ${ranked.length} participantes`, 20, 56)
  ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(20, 70); ctx.lineTo(W - 20, 70); ctx.stroke()

  // Rows
  ranked.forEach((m, i) => {
    const y = HEADER_H + i * ROW_H
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`

    // Row bg (alternate)
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
    ctx.fillRect(0, y, W, ROW_H)

    // Medal
    ctx.font = 'bold 14px system-ui, sans-serif'
    ctx.fillStyle = i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#475569'
    ctx.fillText(medal, 20, y + 34)

    // Name
    ctx.fillStyle = '#f1f5f9'; ctx.font = 'bold 14px system-ui, sans-serif'
    ctx.fillText(m.displayName.slice(0, 22), 60, y + 34)

    // Streak
    if (m.streak > 1) {
      ctx.fillStyle = '#f97316'; ctx.font = 'bold 11px system-ui, sans-serif'
      ctx.fillText(`🔥 ${m.streak}`, W - 130, y + 34)
    }

    // Points
    ctx.fillStyle = '#3b82f6'; ctx.font = 'bold 16px system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`${m.totalPoints} pts`, W - 20, y + 34)
    ctx.textAlign = 'left'

    // Divider
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(20, y + ROW_H - 1); ctx.lineTo(W - 20, y + ROW_H - 1); ctx.stroke()
  })

  // Footer
  ctx.fillStyle = '#334155'; ctx.font = '11px system-ui, sans-serif'
  ctx.fillText('Copa do Mundo 2026 · copa2026.app', 20, H - 12)

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `ranking-${leagueName.toLowerCase().replace(/\s+/g, '-')}.png`,
    })
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success('Imagem gerada!', { description: 'Compartilhe no grupo do WhatsApp 🏆' })
  })
}

function Leaderboard({ members, predictions, matches, scoring, currentUserId, customTeams, onSelectMember, leagueName, champions }: {
  members: LeagueMember[]
  predictions: Prediction[]
  matches: Match[]
  scoring: { winner: number; draw: number; exactScore: number }
  currentUserId: string
  customTeams: Record<string, any>
  onSelectMember: (m: LeagueMember) => void
  leagueName: string
  champions: { userId: string; teamId: string }[]
}) {
  const CHAMPION_BONUS = 30

  const actualChampionId = useMemo(() => {
    const final = matches.find((m) => m.phase === 'FINAL' && m.status === 'FINISHED' && m.score.home !== null)
    if (!final) return null
    if (final.score.home! > final.score.away!) return final.homeTeam.id
    if (final.score.away! > final.score.home!) return final.awayTeam.id
    return null
  }, [matches])

  const ranked = useMemo(() => {
    return members.map((m) => {
      const mine = predictions.filter((p) => p.userId === m.userId)
      let pts = 0
      for (const pred of mine) {
        const match = matches.find((mt) => mt.id === pred.matchId)
        if (!match || match.status !== 'FINISHED' || match.score.home === null) continue
        pts += calculateMatchPoints(
          { homeScore: pred.homeScore, awayScore: pred.awayScore },
          { home: match.score.home!, away: match.score.away! }, scoring,
        )
      }
      const champPred = champions.find((c) => c.userId === m.userId)
      const champBonus = actualChampionId && champPred?.teamId === actualChampionId ? CHAMPION_BONUS : 0
      const streak = computeStreak(m.userId, mine, matches, scoring)
      return { ...m, totalPoints: pts + champBonus, champBonus, streak }
    }).sort((a, b) => b.totalPoints - a.totalPoints)
  }, [members, predictions, matches, scoring, champions, actualChampionId])

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          onClick={() => exportRankingImage(leagueName, ranked)}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-[11px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Download size={11} /> Exportar para WhatsApp
        </button>
      </div>

      {ranked.map((m, i) => {
        const ct = customTeams[m.userId]
        return (
          <button key={m.userId} onClick={() => onSelectMember(m)}
            className={cn(
              'w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-all hover:shadow-md hover:border-primary/30 text-left',
              m.userId === currentUserId ? 'border-primary/30 bg-primary/5' : 'border-border bg-card',
            )}
          >
            <span className={cn('w-7 text-center text-sm font-black shrink-0',
              i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-muted-foreground',
            )}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`}
            </span>

            {/* Photo */}
            {m.photoURL ? (
              <img src={m.photoURL} className="h-8 w-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <span className="text-xs font-black text-primary">{m.displayName[0]?.toUpperCase()}</span>
              </div>
            )}

            {/* Crest */}
            {ct?.crest ? (
              <div className="h-8 w-8 shrink-0">
                <CrestPreview
                  primaryColor={ct.crest.primaryColor} secondaryColor={ct.crest.secondaryColor}
                  acronym={ct.acronym || '?'} shape={ct.crest.shape as any}
                  pattern={ct.crest.pattern as any} stars={ct.crest.stars} size="xs"
                />
              </div>
            ) : (
              <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-muted/40 border border-border/40">
                <Shield size={13} className="text-muted-foreground/30" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{m.displayName}</p>
              {ct?.name && (
                <p className="text-[10px] text-muted-foreground truncate">{ct.name}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {m.streak > 1 && (
                <span className="text-xs font-black text-orange-500">🔥{m.streak}</span>
              )}
              <span className="text-sm font-black text-primary tabular-nums">{m.totalPoints} pts</span>
            </div>
          </button>
        )
      })}

      <div className="rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-[10px] text-muted-foreground flex gap-4 flex-wrap">
        <span>🎯 Exato: <strong>{scoring.exactScore}pts</strong></span>
        <span>✅ Vencedor: <strong>{scoring.winner}pts</strong></span>
        <span>🤝 Empate: <strong>{scoring.draw}pts</strong></span>
        <span>🏆 Campeão: <strong>30pts</strong></span>
      </div>
    </div>
  )
}

// ── Champion prediction card ───────────────────────────────────────────

function ChampionPickCard({ leagueId, userId, champions }: {
  leagueId: string
  userId: string
  champions: { userId: string; teamId: string }[]
}) {
  const myPick = champions.find((c) => c.userId === userId)?.teamId ?? null
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)

  const filtered = TEAMS.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.shortName.toLowerCase().includes(search.toLowerCase())
  )

  const pickedTeam = TEAMS.find((t) => t.id === myPick)

  async function handlePick(teamId: string) {
    const team = TEAMS.find((t) => t.id === teamId)
    setSaving(true)
    try {
      await saveChampionPrediction(leagueId, userId, teamId)
      setOpen(false)
      toast.success('Palpite no campeão salvo! 🏆', {
        description: `Você apostou em ${team?.name ?? 'um time'} para ser campeão.`,
      })
    } catch (e) {
      console.error(e)
      toast.error('Erro ao salvar palpite', { description: 'Tente novamente.' })
    }
    finally { setSaving(false) }
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-3">
        <Trophy size={16} className="text-amber-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-amber-500 uppercase tracking-wide">Palpite no Campeão</p>
          <p className="text-[10px] text-muted-foreground">Bônus de 30 pts · antes do torneio</p>
        </div>
        {pickedTeam ? (
          <div className="flex items-center gap-2 shrink-0">
            <TeamFlag code={pickedTeam.code} name={pickedTeam.name} size={18} />
            <span className="text-xs font-black">{pickedTeam.shortName}</span>
            <button onClick={() => setOpen((v) => !v)}
              className="text-[10px] text-muted-foreground hover:text-foreground underline">
              {open ? 'Cancelar' : 'Mudar'}
            </button>
          </div>
        ) : (
          <button onClick={() => setOpen((v) => !v)}
            className="text-xs font-bold text-amber-500 hover:text-amber-400 shrink-0">
            {open ? 'Cancelar' : 'Escolher ▾'}
          </button>
        )}
      </div>

      {open && (
        <div className="border-t border-amber-500/20 p-3 space-y-2">
          <div className="relative">
            <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar seleção..."
              className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
          </div>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-background divide-y divide-border/20">
            {filtered.map((t) => (
              <button key={t.id} onClick={() => handlePick(t.id)} disabled={saving}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors',
                  t.id === myPick ? 'bg-amber-500/10 text-amber-500 font-bold' : 'hover:bg-muted/40 text-muted-foreground',
                )}>
                <TeamFlag code={t.code} name={t.name} size={16} />
                <span className="flex-1 text-left font-semibold">{t.name}</span>
                {t.id === myPick && <Check size={11} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Team multi-select with flags ───────────────────────────────────────

function TeamMultiSelect({
  value, onChange, matches,
}: {
  value: string[]
  onChange: (ids: string[]) => void
  matches: Match[]
}) {
  const [search, setSearch] = useState('')
  const filtered = TEAMS.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.shortName.toLowerCase().includes(search.toLowerCase()) ||
    t.group.toLowerCase().includes(search.toLowerCase())
  )
  const selectedCount = value.length
  const selectedMatchCount = matches.filter((m) =>
    value.includes(m.homeTeam.id) || value.includes(m.awayTeam.id)
  ).length

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} seleção(ões) · ${selectedMatchCount} jogos` : 'Nenhuma seleção escolhida'}
        </label>
        {selectedCount > 0 && (
          <button onClick={() => onChange([])} className="text-[10px] text-destructive hover:underline font-bold">Limpar</button>
        )}
      </div>

      {/* Selected chips */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((id) => {
            const t = TEAMS.find((t) => t.id === id)
            if (!t) return null
            return (
              <span key={id} className="flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 text-[11px] font-bold text-primary">
                <TeamFlag code={t.code} name={t.name} size={12} />
                {t.shortName}
                <button onClick={() => toggle(id)} className="ml-0.5 text-primary/60 hover:text-primary">×</button>
              </span>
            )
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar seleção..."
          className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {/* Team grid */}
      <div className="max-h-52 overflow-y-auto rounded-xl border border-border bg-background">
        {TEAMS.filter(t => filtered.includes(t)).map((t) => {
          const sel = value.includes(t.id)
          return (
            <button key={t.id} onClick={() => toggle(t.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors border-b border-border/20 last:border-0',
                sel ? 'bg-primary/8 text-foreground' : 'hover:bg-muted/40 text-muted-foreground',
              )}>
              <div className={cn('h-4 w-4 rounded border shrink-0 flex items-center justify-center transition-all',
                sel ? 'bg-primary border-primary' : 'border-muted-foreground/40')}>
                {sel && <Check size={10} className="text-white" strokeWidth={3} />}
              </div>
              <TeamFlag code={t.code} name={t.name} size={16} />
              <span className="flex-1 font-semibold">{t.name}</span>
              <span className="text-[10px] text-muted-foreground/60 font-mono">Gr.{t.group}</span>
            </button>
          )
        })}
      </div>
      <p className="text-[10px] text-muted-foreground">Jogos do mata-mata são incluídos automaticamente conforme a seleção avança.</p>
    </div>
  )
}

// ── Custom match picker with team filter ───────────────────────────────

function CustomMatchPicker({
  allMatches, selected, onToggle,
}: {
  allMatches: Match[]
  selected: Set<string>
  onToggle: (id: string) => void
}) {
  const [search, setSearch] = useState('')
  const now = Date.now()

  const filtered = allMatches.filter((m) => {
    const q = search.toLowerCase()
    if (!q) return true
    return (
      m.homeTeam.name.toLowerCase().includes(q) ||
      m.awayTeam.name.toLowerCase().includes(q) ||
      m.homeTeam.shortName.toLowerCase().includes(q) ||
      m.awayTeam.shortName.toLowerCase().includes(q)
    )
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const upcoming = filtered.filter((m) => new Date(m.date).getTime() > now)
  const past = filtered.filter((m) => new Date(m.date).getTime() <= now)

  function MatchRow({ m }: { m: Match }) {
    const sel = selected.has(m.id)
    return (
      <button onClick={() => onToggle(m.id)}
        className={cn(
          'w-full flex items-center gap-2 px-2.5 py-2 text-left text-xs transition-all',
          sel ? 'bg-primary/8 text-foreground' : 'hover:bg-muted/40 text-muted-foreground',
        )}>
        <div className={cn('h-4 w-4 rounded border shrink-0 flex items-center justify-center transition-all',
          sel ? 'bg-primary border-primary' : 'border-muted-foreground/30')}>
          {sel && <Check size={10} className="text-white" strokeWidth={3} />}
        </div>
        <TeamFlag code={m.homeTeam.code} name={m.homeTeam.name} size={14} />
        <span className="font-bold">{m.homeTeam.shortName}</span>
        <span className="text-muted-foreground/40 mx-0.5">vs</span>
        <span className="font-bold">{m.awayTeam.shortName}</span>
        <TeamFlag code={m.awayTeam.code} name={m.awayTeam.name} size={14} />
        <span className="ml-auto text-[10px] text-muted-foreground/50 shrink-0">
          {new Date(m.date).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', timeZone:'America/Sao_Paulo' }).replace('.', '')}
        </span>
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">
          {selected.size} jogo(s) selecionado(s) de {allMatches.length}
        </p>
        {selected.size > 0 && (
          <button onClick={() => allMatches.forEach(m => selected.has(m.id) && onToggle(m.id))}
            className="text-[10px] text-destructive hover:underline font-bold">Limpar</button>
        )}
      </div>
      <div className="relative">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrar por seleção..."
          className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="max-h-64 overflow-y-auto rounded-xl border border-border bg-background divide-y divide-border/20">
        {upcoming.length > 0 && (
          <>
            <div className="px-3 py-1.5 bg-muted/30 sticky top-0">
              <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Próximos ({upcoming.length})</p>
            </div>
            {upcoming.map(m => <MatchRow key={m.id} m={m} />)}
          </>
        )}
        {past.length > 0 && (
          <>
            <div className="px-3 py-1.5 bg-muted/20 sticky top-0">
              <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">Passados ({past.length})</p>
            </div>
            {past.map(m => <MatchRow key={m.id} m={m} />)}
          </>
        )}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">Nenhum jogo encontrado</p>
        )}
      </div>
    </div>
  )
}

// ── Admin panel ────────────────────────────────────────────────────────

function AdminPanel({ leagueId, league, allMatches, onDeleted }: {
  leagueId: string
  league: NonNullable<ReturnType<typeof useLeagueDetails>['league']>
  allMatches: Match[]
  onDeleted: () => void
}) {
  const { user } = useAuthStore()
  const { editLeague, deleteLeagueWithCleanup, saving } = useLeagueAdmin(leagueId)

  // Edit state
  const [name, setName] = useState(league.name)
  const [desc, setDesc] = useState(league.description)
  const [scoring, setScoring] = useState(league.config.scoring)
  const [matchScope, setMatchScope] = useState<MatchScope>(league.matchScope)
  const [scopeTeamIds, setScopeTeamIds] = useState<string[]>(
    (league as any).scopeTeamIds?.length
      ? (league as any).scopeTeamIds
      : league.scopeTeamId ? [league.scopeTeamId] : []
  )
  const [selectedMatchIds, setSelectedMatchIds] = useState<Set<string>>(
    new Set(league.scopeMatchIds ?? [])
  )
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSaveSettings() {
    try {
      await editLeague({
        name, description: desc, scoring, matchScope,
        scopeTeamId: matchScope === 'team' && scopeTeamIds.length > 0 ? scopeTeamIds[0] : null,
        scopeMatchIds: matchScope === 'custom' ? Array.from(selectedMatchIds) : [],
        ...(matchScope === 'team' ? { scopeTeamIds } : {}),
      })
      toast.success('Configurações salvas!', { description: `Liga "${name}" atualizada.` })
    } catch {
      toast.error('Erro ao salvar configurações', { description: 'Tente novamente.' })
    }
  }

  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete() {
    if (!user) return
    setDeleteError(null)
    // Navega imediatamente para evitar o flash "Liga não encontrada"
    // causado pelo onSnapshot detectar a deleção do documento
    toast.success('Liga excluída', {
      description: `"${league.name}" foi removida permanentemente.`,
    })
    onDeleted()
    try {
      await deleteLeagueWithCleanup(league.inviteCode, user.uid)
    } catch (e: any) {
      console.error('[delete league]', e)
      toast.error('Limpeza incompleta', {
        description: 'Liga removida, mas alguns dados podem ter ficado. Contate o suporte se necessário.',
      })
    }
  }

  function toggleMatch(id: string) {
    setSelectedMatchIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* ── Configurações ── */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <h3 className="font-black text-sm uppercase tracking-wide text-foreground/80 flex items-center gap-1.5">
          <Settings size={14} /> Configurações da Liga
        </h3>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} maxLength={120}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Scoring */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pontuação</p>
            {([
              { key: 'winner', label: 'Acertou o vencedor' },
              { key: 'draw', label: 'Acertou o empate' },
              { key: 'exactScore', label: 'Placar exato' },
            ] as const).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs">{label}</span>
                <div className="flex items-center gap-2">
                  <ScoreInput size="sm" value={scoring[key]} onChange={(v) => setScoring((s) => ({ ...s, [key]: v }))} />
                  <span className="text-xs text-muted-foreground w-4">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Escopo de jogos ── */}
        <div className="space-y-3 pt-2 border-t border-border/40">
          <p className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Swords size={12} /> Jogos incluídos
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {([
              { v: 'all', label: 'Todos', desc: '72+ jogos' },
              { v: 'team', label: 'Por seleção', desc: 'Jogos de um time' },
              { v: 'custom', label: 'Personalizado', desc: 'Você escolhe' },
            ] as const).map(({ v, label, desc }) => (
              <button key={v} onClick={() => setMatchScope(v as MatchScope)}
                className={cn(
                  'rounded-xl border p-2.5 text-left transition-all',
                  matchScope === v ? 'border-primary bg-primary/8 text-primary' : 'border-border bg-muted/20 hover:border-primary/30',
                )}>
                <p className="text-xs font-bold">{label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
              </button>
            ))}
          </div>

          {matchScope === 'team' && (
            <TeamMultiSelect
              value={scopeTeamIds}
              onChange={setScopeTeamIds}
              matches={allMatches}
            />
          )}

          {matchScope === 'custom' && (
            <CustomMatchPicker
              allMatches={allMatches}
              selected={selectedMatchIds}
              onToggle={toggleMatch}
            />
          )}
        </div>

        <Button className="w-full font-bold" disabled={saving} onClick={handleSaveSettings}>
          {saving ? <><Loader2 size={13} className="animate-spin mr-1.5" />Salvando...</> : 'Salvar configurações'}
        </Button>
      </div>

      {/* ── Zona de Perigo ── */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
        <h3 className="font-black text-sm text-destructive flex items-center gap-1.5">
          <AlertTriangle size={14} /> Zona de Perigo
        </h3>
        {deleteError && (
          <p className="text-xs text-destructive font-medium bg-destructive/10 rounded-lg px-3 py-2">
            ⚠️ {deleteError}
          </p>
        )}
        {!confirmDelete ? (
          <Button variant="outline"
            className="w-full gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 font-bold"
            onClick={() => setConfirmDelete(true)}>
            <Trash2 size={14} /> Excluir liga permanentemente
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-destructive font-medium">
              Tem certeza? Esta ação é irreversível. Todos os palpites serão perdidos.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 font-bold"
                onClick={() => setConfirmDelete(false)}>Cancelar</Button>
              <Button className="flex-1 font-bold bg-destructive hover:bg-destructive/90 text-white border-none"
                disabled={saving} onClick={handleDelete}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : 'Confirmar exclusão'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────

type Tab = 'palpites' | 'classificacao' | 'info' | 'admin'

export default function LeaguePage() {
  const { leagueId } = useParams<{ leagueId: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('palpites')
  const [selectedMember, setSelectedMember] = useState<LeagueMember | null>(null)
  const { confirm } = useDialog()

  const { league, members, loading, notFound } = useLeagueDetails(leagueId)
  const predictions = useLeaguePredictions(leagueId)
  const { data: allMatches } = useMatches()
  const customTeams = useMembersCustomTeams(members.map((m) => m.userId))
  const champions = useChampionPrediction(leagueId)

  const isOwner = user?.uid === league?.ownerId

  // Filter matches based on league scope
  const scopedMatches = useMemo(() => {
    if (!allMatches || !league) return []
    // scopeTeamIds (new) takes priority; fall back to legacy scopeTeamId (single)
    const teamIds: string[] = (league as any).scopeTeamIds?.length
      ? (league as any).scopeTeamIds
      : league.scopeTeamId ? [league.scopeTeamId] : []
    if (league.matchScope === 'team' && teamIds.length > 0) {
      return allMatches.filter((m) =>
        teamIds.includes(m.homeTeam.id) || teamIds.includes(m.awayTeam.id)
      )
    }
    if (league.matchScope === 'custom' && league.scopeMatchIds?.length) {
      return allMatches.filter((m) => league.scopeMatchIds!.includes(m.id))
    }
    return allMatches
  }, [allMatches, league])

  const upcomingMatches = useMemo(() => {
    const cutoff = Date.now() - 2 * 60 * 60 * 1000
    return scopedMatches
      .filter((m) => m.status === 'LIVE' || (m.status === 'SCHEDULED' && new Date(m.date).getTime() > cutoff))
      .sort((a, b) => {
        if (a.status === 'LIVE' && b.status !== 'LIVE') return -1
        if (b.status === 'LIVE' && a.status !== 'LIVE') return 1
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })
  }, [scopedMatches])

  const finishedMatches = useMemo(() =>
    scopedMatches.filter((m) => m.status === 'FINISHED')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [scopedMatches]
  )

  const myPredictions = useMemo(() =>
    predictions.filter((p) => p.userId === user?.uid),
    [predictions, user]
  )

  async function handleLeave() {
    if (!leagueId || !user) return
    const ok = await confirm({
      title: 'Sair da liga?',
      description: 'Você poderá entrar novamente com o código de convite.',
      confirmLabel: 'Sair',
      cancelLabel: 'Cancelar',
      variant: 'destructive',
    })
    if (!ok) return
    try {
      await leaveLeague(leagueId, user.uid)
      toast.success('Você saiu da liga', { description: `Até mais! Use o código para entrar novamente.` })
      navigate('/pool')
    } catch (e: any) {
      console.error('[leave league]', e)
      toast.error('Erro ao sair da liga', { description: 'Verifique sua conexão e tente novamente.' })
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/pool/join/${league?.inviteCode}`
    if (navigator.share) {
      navigator.share({ title: `Bolão: ${league?.name}`, text: `Entre no meu bolão com o código ${league?.inviteCode}`, url })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copiado!', { description: 'Compartilhe com seus amigos para entrar no bolão.' })
    }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={28} />
    </div>
  )

  if (notFound || !league) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <p className="text-5xl">🏳️</p>
      <div>
        <p className="text-lg font-black">Liga não encontrada</p>
        <p className="text-sm text-muted-foreground mt-1">
          Esta liga foi excluída ou o link é inválido.
        </p>
      </div>
      <Button onClick={() => navigate('/pool')} className="mt-2">
        ← Voltar ao Bolão
      </Button>
    </div>
  )

  const scoring = league.config.scoring

  const tabs = (
    [
      { id: 'palpites' as Tab, label: 'Palpites', icon: <ListChecks size={12} /> },
      { id: 'classificacao' as Tab, label: 'Ranking', icon: <Trophy size={12} /> },
      { id: 'info' as Tab, label: 'Info', icon: <Info size={12} /> },
      { id: 'admin' as Tab, label: 'Admin', icon: <Settings size={12} />, ownerOnly: true },
    ] as { id: Tab; label: string; icon: React.ReactNode; ownerOnly?: boolean }[]
  ).filter((t) => !t.ownerOnly || isOwner)

  return (
    <div className="space-y-5">
      {/* Participant modal */}
      {selectedMember && (
        <ParticipantModal
          member={selectedMember}
          predictions={predictions}
          matches={allMatches ?? []}
          scoring={scoring}
          currentUserId={user?.uid}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('/pool')}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={15} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-black truncate">{league.name}</h1>
            {isOwner && <Crown size={14} className="text-amber-500 shrink-0" />}
          </div>
          {league.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{league.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users size={11} /> {members.length} participante{members.length !== 1 ? 's' : ''}
            </span>
            <InviteCodeBadge code={league.inviteCode} />
            <button onClick={handleShare}
              className="flex items-center gap-1 text-xs text-primary font-bold hover:underline">
              <Share2 size={11} /> Compartilhar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 bg-muted/50 p-1 rounded-xl border border-border/40">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-bold transition-all',
              tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              t.id === 'admin' && tab !== 'admin' && 'text-amber-500 hover:text-amber-400',
            )}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Palpites ── */}
      {tab === 'palpites' && user && (
        <div className="space-y-4">
          <ChampionPickCard leagueId={leagueId!} userId={user.uid} champions={champions} />

          {upcomingMatches.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                {upcomingMatches.some((m) => m.status === 'LIVE') ? 'Ao vivo & próximos' : 'Próximos jogos'} · {upcomingMatches.length}
              </p>
              {upcomingMatches.map((m) => (
                <PredictionRow key={m.id} match={m}
                  existing={myPredictions.find((p) => p.matchId === m.id)}
                  leagueId={leagueId!} userId={user.uid} scoring={scoring} />
              ))}
            </div>
          )}
          {finishedMatches.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Encerrados</p>
              {finishedMatches.map((m) => (
                <PredictionRow key={m.id} match={m}
                  existing={myPredictions.find((p) => p.matchId === m.id)}
                  leagueId={leagueId!} userId={user.uid} scoring={scoring} />
              ))}
            </div>
          )}
          {upcomingMatches.length === 0 && finishedMatches.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p className="font-semibold">Nenhum jogo disponível.</p>
              {isOwner && <p className="text-xs mt-1">Configure o escopo de jogos na aba Admin.</p>}
            </div>
          )}
        </div>
      )}

      {/* ── Classificação ── */}
      {tab === 'classificacao' && (
        <div className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
            Classificação · {members.length} participantes
          </p>
          {members.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Nenhum participante ainda.</div>
          ) : (
            <Leaderboard
              members={members} predictions={predictions}
              matches={allMatches ?? []} scoring={scoring}
              currentUserId={user?.uid ?? ''} customTeams={customTeams}
              onSelectMember={setSelectedMember}
              champions={champions}
              leagueName={league.name}
            />
          )}
        </div>
      )}

      {/* ── Info ── */}
      {tab === 'info' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Código de convite</p>
            <div className="flex items-center gap-3 flex-wrap">
              <InviteCodeBadge code={league.inviteCode} />
              <Button size="sm" variant="outline" className="gap-1.5 font-bold text-xs" onClick={handleShare}>
                <Share2 size={12} /> Compartilhar link
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              Participantes · {members.length}
            </p>
            {members.map((m) => {
              const ct = customTeams[m.userId]
              return (
                <button key={m.userId} onClick={() => setSelectedMember(m)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-all hover:shadow-md hover:border-primary/30 text-left',
                    m.userId === user?.uid ? 'border-primary/30 bg-primary/5' : 'border-border bg-card',
                  )}>
                  {m.photoURL ? (
                    <img src={m.photoURL} className="h-8 w-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="text-xs font-black text-primary">{m.displayName[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  {ct?.crest ? (
                    <div className="h-8 w-8 shrink-0">
                      <CrestPreview primaryColor={ct.crest.primaryColor} secondaryColor={ct.crest.secondaryColor}
                        acronym={ct.acronym || '?'} shape={ct.crest.shape as any}
                        pattern={ct.crest.pattern as any} stars={ct.crest.stars} size="xs" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-center">
                      <Shield size={12} className="text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{m.displayName}</p>
                    {ct?.name && <p className="text-[10px] text-muted-foreground truncate">{ct.name}</p>}
                  </div>
                  {m.userId === league.ownerId && (
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full shrink-0">Admin</span>
                  )}
                </button>
              )
            })}
          </div>

          {!isOwner && (
            <Button variant="outline"
              className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 font-bold"
              onClick={handleLeave}>
              <LogOut size={14} /> Sair da liga
            </Button>
          )}
        </div>
      )}

      {/* ── Admin ── */}
      {tab === 'admin' && isOwner && (
        <AdminPanel
          leagueId={leagueId!} league={league}
          allMatches={allMatches ?? []}
          onDeleted={() => navigate('/pool')}
        />
      )}
    </div>
  )
}
