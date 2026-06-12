import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Users, Link2, LogIn, Lock, AlertCircle,
  ChevronRight, Crown, Loader2, Check, Radio,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LegalDisclaimer } from '../components/LegalDisclaimer'
import { useMatches } from '@/features/calendar/hooks/useMatches'
import { useAuthStore } from '@/features/auth/store/authStore'
import { signInWithGoogle } from '@/core/firebase/auth'
import { useMyLeagues } from '../hooks/useLeague'
import { usePublicPool, savePublicPrediction, type MatchStats } from '../hooks/usePublicPool'
import { TeamFlag } from '@/shared/components/TeamFlag'
import { ScoreInput } from '../components/ScoreInput'
import { cn } from '@/lib/utils'
import type { Match } from '@/core/api/types'

// ── Public match prediction card ────────────────────────────────────────

function StatBar({ homeWinPct, drawPct, awayWinPct }: { homeWinPct: number; drawPct: number; awayWinPct: number }) {
  const hasData = homeWinPct + drawPct + awayWinPct > 0
  if (!hasData) return null
  return (
    <div className="space-y-1">
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        <div className="bg-primary transition-all duration-500" style={{ width: `${homeWinPct}%` }} />
        <div className="bg-muted-foreground/30 transition-all duration-500" style={{ width: `${drawPct}%` }} />
        <div className="bg-success transition-all duration-500" style={{ width: `${awayWinPct}%` }} />
      </div>
      <div className="flex justify-between text-[9px] font-semibold text-muted-foreground">
        <span className="text-primary">{homeWinPct}% casa</span>
        <span>{drawPct}% empate</span>
        <span className="text-success">{awayWinPct}% visitante</span>
      </div>
    </div>
  )
}

function isMatchLocked(match: Match): boolean {
  if (match.status !== 'SCHEDULED') return true
  return new Date(match.date).getTime() - Date.now() < 10 * 60 * 1000
}

function PublicMatchCard({
  match,
  stats,
  user,
}: {
  match: Match
  stats: MatchStats
  user: { uid: string; name: string | null; photoURL: string | null } | null
}) {
  const [home, setHome] = useState<number>(stats.myPrediction?.homeScore ?? 0)
  const [away, setAway] = useState<number>(stats.myPrediction?.awayScore ?? 0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isDone = match.status === 'FINISHED'
  const isLive = match.status === 'LIVE'
  const locked = isMatchLocked(match)

  const dateStr = new Date(match.date).toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).replace(',', ' ·')

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      await savePublicPrediction(user.uid, match.id, home, away, user.name ?? 'Usuário', user.photoURL)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={cn(
      'rounded-2xl border bg-card overflow-hidden',
      isLive ? 'border-red-500/40' : isDone ? 'border-border/40 bg-muted/10' : 'border-border',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border/40">
        <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
          {isLive && <Radio size={9} className="animate-pulse text-red-500" />}
          {isLive ? <span className="text-red-500 font-black">AO VIVO</span> : dateStr}
        </span>
        <div className="flex items-center gap-2">
          {locked && !isDone && !isLive && (
            <span className="text-[9px] font-bold text-amber-500/80 flex items-center gap-0.5">
              <Lock size={8} /> Fechado
            </span>
          )}
          {stats.total > 0 && (
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
              <Users size={9} /> {stats.total} palpite{stats.total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Teams + inputs */}
        <div className="flex items-center gap-2">
          {/* Home */}
          <div className="flex flex-1 items-center gap-1.5 min-w-0">
            <TeamFlag code={match.homeTeam.code} name={match.homeTeam.name} size={18} />
            <span className="text-sm font-bold truncate">{match.homeTeam.shortName}</span>
          </div>

          {/* Score inputs / result */}
          <div className="flex items-center gap-1.5 shrink-0">
            {(isDone || isLive) && match.score.home !== null ? (
              <span className={cn(
                'text-sm font-black tabular-nums px-2 py-1 rounded-lg border',
                isLive ? 'text-red-400 bg-red-500/10 border-red-500/30' : 'text-foreground bg-muted/40 border-border/30',
              )}>
                {match.score.home} – {match.score.away}
              </span>
            ) : locked ? (
              <span className="text-xs text-muted-foreground px-2 font-bold">
                {stats.myPrediction ? `${stats.myPrediction.homeScore}×${stats.myPrediction.awayScore}` : '–'}
              </span>
            ) : user ? (
              <div className="flex items-center gap-1.5">
                <ScoreInput value={home} onChange={setHome} size="sm" />
                <span className="text-muted-foreground/40 font-bold text-xs">×</span>
                <ScoreInput value={away} onChange={setAway} size="sm" />
              </div>
            ) : (
              <span className="text-xs text-muted-foreground px-2">vs</span>
            )}
          </div>

          {/* Away */}
          <div className="flex flex-1 items-center gap-1.5 min-w-0 justify-end">
            <span className="text-sm font-bold truncate">{match.awayTeam.shortName}</span>
            <TeamFlag code={match.awayTeam.code} name={match.awayTeam.name} size={18} />
          </div>
        </div>

        {/* Stats bar */}
        {stats.total > 0 && (
          <StatBar
            homeWinPct={stats.homeWinPct}
            drawPct={stats.drawPct}
            awayWinPct={stats.awayWinPct}
          />
        )}

        {/* Top predicted scores */}
        {stats.topScores.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {stats.topScores.map((s, i) => (
              <span
                key={i}
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                  i === 0
                    ? 'border-primary/40 bg-primary/8 text-primary'
                    : 'border-border bg-muted/30 text-muted-foreground',
                )}
              >
                {s.home}×{s.away}
                <span className="ml-1 opacity-60">({s.count})</span>
              </span>
            ))}
            <span className="text-[9px] text-muted-foreground/50 self-center ml-0.5">placar mais votado</span>
          </div>
        )}

        {/* Save button */}
        {user && !isDone && !isLive && !locked && (
          <Button
            size="sm"
            className={cn(
              'w-full h-7 text-xs font-bold transition-all',
              saved && 'bg-success/15 text-success border-success/30',
            )}
            variant={saved ? 'outline' : 'default'}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : saved ? (
              <><Check size={12} className="mr-1" /> Palpite salvo!</>
            ) : stats.myPrediction ? (
              'Atualizar palpite'
            ) : (
              'Enviar palpite'
            )}
          </Button>
        )}

        {user && !isDone && !isLive && locked && !stats.myPrediction && (
          <p className="text-[10px] text-center text-muted-foreground/50 py-0.5">
            Palpites fecharam 10 min antes
          </p>
        )}

        {!user && !isDone && !locked && (
          <p className="text-[10px] text-center text-muted-foreground">
            <button onClick={signInWithGoogle} className="text-primary font-bold hover:underline">
              Faça login
            </button>{' '}para enviar seu palpite
          </p>
        )}
      </div>
    </div>
  )
}

// ── Past Matches Section ────────────────────────────────────────────────

const PAST_PAGE_SIZE = 6

function PastMatchesSection({ matches, getMatchStats, user }: {
  matches: Match[]
  getMatchStats: (matchId: string) => MatchStats
  user: { uid: string; name: string | null; photoURL: string | null } | null
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? matches : matches.slice(0, PAST_PAGE_SIZE)

  return (
    <div className="space-y-3 pt-2 border-t border-border/40">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
          Jogos Encerrados
          <span className="text-muted-foreground/50">· {matches.length}</span>
        </p>
        {matches.length > PAST_PAGE_SIZE && (
          <button onClick={() => setExpanded(v => !v)}
            className="text-[10px] font-bold text-primary hover:underline">
            {expanded ? 'Ver menos' : `Ver todos (${matches.length})`}
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((m) => (
          <PublicMatchCard key={m.id} match={m} stats={getMatchStats(m.id)} user={user} />
        ))}
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────

export default function PoolPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: matches } = useMatches()
  const { leagues: myLeagues, loading: loadingLeagues } = useMyLeagues()
  const { getMatchStats, totalParticipants, totalPredictions, loading: loadingPool } = usePublicPool()

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [pendingPath, setPendingPath] = useState<string | null>(null)
  const [showAllMatches, setShowAllMatches] = useState(false)

  const liveMatches = useMemo(() => {
    if (!matches) return []
    return matches
      .filter((m) => m.status === 'LIVE')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [matches])

  const upcomingMatches = useMemo(() => {
    if (!matches) return []
    return matches
      .filter((m) => m.status === 'SCHEDULED')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [matches])

  const finishedMatches = useMemo(() => {
    if (!matches) return []
    return matches
      .filter((m) => m.status === 'FINISHED')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [matches])

  const activeMatches = useMemo(() => [...liveMatches, ...upcomingMatches], [liveMatches, upcomingMatches])
  const visibleMatches = showAllMatches ? activeMatches : activeMatches.slice(0, 6)

  const handleAction = (path: string) => {
    if (!user) {
      setPendingPath(path)
      setShowLoginModal(true)
    } else {
      navigate(path)
    }
  }

  const handleLoginSuccess = async () => {
    try {
      await signInWithGoogle()
      setShowLoginModal(false)
      if (pendingPath) {
        navigate(pendingPath)
        setPendingPath(null)
      }
    } catch (err) {
      console.error('Error signing in:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Visitor Banner */}
      {!user && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0" />
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-wider">Modo Visitante</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Faça login para enviar palpites, ver suas ligas e competir com amigos.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleLoginSuccess}
            className="w-full sm:w-auto font-bold bg-amber-600 hover:bg-amber-700 text-white border-none shrink-0"
          >
            <LogIn size={13} className="mr-1.5" />
            Fazer Login
          </Button>
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, #92400e, #d97706, #f59e0b)' }}>
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Copa do Mundo 2026</p>
          <h1 className="mt-0.5 text-2xl font-black tracking-tight sm:text-3xl">Bolão</h1>
          <p className="mt-1 text-sm text-white/80">Faça seus palpites e dispute com amigos</p>
          {!loadingPool && totalParticipants > 0 && (
            <div className="mt-3 flex gap-4">
              <div>
                <p className="text-2xl font-black leading-none">{totalParticipants}</p>
                <p className="text-[10px] text-white/70 uppercase tracking-wide mt-0.5">
                  {totalParticipants === 1 ? 'participante' : 'participantes'}
                </p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-2xl font-black leading-none">{totalPredictions}</p>
                <p className="text-[10px] text-white/70 uppercase tracking-wide mt-0.5">palpites enviados</p>
              </div>
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-20 select-none">🏆</span>
      </div>

      <LegalDisclaimer />

      {/* Action cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => handleAction('/pool/league/new')} className="w-full text-left focus:outline-none">
          <div className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-sm relative">
              <Plus size={20} className="text-white" />
              {!user && <span className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5"><Lock size={8} className="text-muted-foreground" /></span>}
            </div>
            <div>
              <p className="font-bold text-sm flex items-center gap-1.5">
                Criar Liga Privada
                {!user && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-bold">🔒 Login</span>}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Convide amigos com um código exclusivo</p>
            </div>
          </div>
        </button>

        <button onClick={() => handleAction('/pool/join')} className="w-full text-left focus:outline-none">
          <div className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-success/30 hover:shadow-lg hover:shadow-success/10 cursor-pointer">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/15 relative">
              <Link2 size={20} className="text-success" />
              {!user && <span className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5"><Lock size={8} className="text-muted-foreground" /></span>}
            </div>
            <div>
              <p className="font-bold text-sm flex items-center gap-1.5">
                Entrar em Liga
                {!user && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-bold">🔒 Login</span>}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Use um código de convite</p>
            </div>
          </div>
        </button>
      </div>

      {/* ─── Minhas Ligas ─────────────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-sm">Minhas Ligas Privadas</h2>
          <Button variant="ghost" size="sm" className="gap-1 text-xs font-bold"
            onClick={() => handleAction('/pool/league/new')}>
            <Plus size={12} /> Nova liga
          </Button>
        </div>

        {!user ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Users size={28} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm font-semibold text-muted-foreground">Faça login para ver suas ligas.</p>
          </div>
        ) : loadingLeagues ? (
          <div className="flex justify-center py-10">
            <Loader2 size={20} className="animate-spin text-muted-foreground/40" />
          </div>
        ) : myLeagues.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Users size={28} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm font-semibold text-muted-foreground">Você ainda não tem ligas privadas.</p>
            <p className="text-xs text-muted-foreground mt-1">Crie uma liga ou entre com um código de convite.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myLeagues.map((lg) => (
              <button
                key={lg.leagueId}
                onClick={() => navigate(`/pool/league/${lg.leagueId}`)}
                className="w-full text-left flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/30 hover:shadow transition-all"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  {lg.role === 'owner'
                    ? <Crown size={16} className="text-amber-500" />
                    : <Users size={16} className="text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{lg.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{lg.inviteCode}</p>
                </div>
                <ChevronRight size={15} className="text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Bolão da Galera ───────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <div>
              <p className="font-black text-sm">Bolão da Galera</p>
              <p className="text-[10px] text-muted-foreground">Público · todos os usuários participam</p>
            </div>
          </div>
          {!loadingPool && totalPredictions > 0 && (
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full flex items-center gap-1">
              <Users size={10} /> {totalParticipants} participantes
            </span>
          )}
        </div>

        {loadingPool ? (
          <div className="flex justify-center py-10">
            <Loader2 size={22} className="animate-spin text-muted-foreground/40" />
          </div>
        ) : activeMatches.length === 0 && finishedMatches.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Nenhum jogo disponível.
          </div>
        ) : (
          <>
            {/* Jogos ao vivo + próximos */}
            {activeMatches.length > 0 && (
              <>
                {liveMatches.length > 0 && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <p className="text-[11px] font-black uppercase tracking-wider text-red-500">
                      Ao Vivo · {liveMatches.length} jogo{liveMatches.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {visibleMatches.map((m) => (
                    <PublicMatchCard
                      key={m.id}
                      match={m}
                      stats={getMatchStats(m.id)}
                      user={user}
                    />
                  ))}
                </div>
                {activeMatches.length > 6 && (
                  <button
                    onClick={() => setShowAllMatches((v) => !v)}
                    className="w-full py-2.5 text-xs font-bold text-primary hover:underline"
                  >
                    {showAllMatches
                      ? 'Mostrar menos'
                      : `Ver todos os ${activeMatches.length} jogos`}
                  </button>
                )}
              </>
            )}

            {/* Jogos encerrados */}
            {finishedMatches.length > 0 && (
              <PastMatchesSection matches={finishedMatches} getMatchStats={getMatchStats} user={user} />
            )}
          </>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Lock size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-foreground">Login Necessário</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Você precisa estar logado para acessar ligas privadas e palpites vinculados ao seu perfil.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleLoginSuccess} className="w-full font-bold gradient-primary text-white border-none gap-1.5">
                <LogIn size={14} /> Entrar com Google
              </Button>
              <Button variant="outline" onClick={() => { setShowLoginModal(false); setPendingPath(null) }}
                className="w-full font-semibold">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
