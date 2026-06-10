import { useMemo, useState } from 'react'
import { useMatches } from '../hooks/useMatches'
import { MatchCard } from '../components/MatchCard'
import { MatchFilters } from '../components/MatchFilters'
import { Loader2, Calendar, Heart, ChevronDown } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import type { Match } from '@/core/api/types'
import { cn } from '@/lib/utils'

type GroupByOption = 'date' | 'phase' | 'round'

const PHASE_NAMES: Record<string, string> = {
  ROUND_OF_32: '16-avos de final',
  ROUND_OF_16: 'Oitavas de final',
  QUARTER_FINALS: 'Quartas de final',
  SEMI_FINALS: 'Semifinais',
  THIRD_PLACE: 'Disputa de 3º lugar',
  FINAL: 'Final',
}

function groupMatches(
  matches: Match[],
  type: GroupByOption,
  roundMap?: Map<string, number>,
): Map<string, Match[]> {
  const map = new Map<string, Match[]>()
  const sorted = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  for (const m of sorted) {
    let key = ''
    if (type === 'date') {
      key = new Date(m.date).toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long',
        timeZone: 'America/Sao_Paulo',
      })
    } else if (type === 'phase') {
      if (m.phase === 'GROUP_STAGE') {
        key = m.group ? `Grupo ${m.group}` : 'Fase de Grupos'
      } else {
        key = PHASE_NAMES[m.phase] ?? m.phase
      }
    } else if (type === 'round') {
      const round = roundMap?.get(m.id)
      if (round !== undefined) {
        key = `${round}ª Rodada`
      } else {
        key = PHASE_NAMES[m.phase] ?? (m.phase === 'GROUP_STAGE' ? 'Fase de Grupos' : (m.phase ?? 'Outros'))
      }
    }
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(m)
  }
  return map
}

const PAGE_SIZE = 16

function MatchGroupedList({
  matches, groupBy, roundMap,
}: {
  matches: Match[]
  groupBy: GroupByOption
  roundMap: Map<string, number>
}) {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const grouped = useMemo(() => groupMatches(matches, groupBy, roundMap), [matches, groupBy, roundMap])

  // Show complete groups — stop adding new groups once we hit the limit
  const entries = useMemo(() => Array.from(grouped.entries()), [grouped])
  const totalMatches = matches.length
  const shownMatches = useMemo(() => {
    let count = 0
    const result: [string, Match[]][] = []
    for (const [title, group] of entries) {
      if (count > 0 && count >= limit) break
      result.push([title, group])
      count += group.length
    }
    return result
  }, [entries, limit])
  const shownCount = shownMatches.reduce((s, [, g]) => s + g.length, 0)

  return (
    <div className="space-y-6">
      {shownMatches.map(([title, groupMatches]) => (
        <div key={title} className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">{title}</h3>
            <div className="h-px flex-1 bg-border/50" />
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {groupMatches.length} {groupMatches.length === 1 ? 'jogo' : 'jogos'}
            </span>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {groupMatches.map((match) => (
              <MatchCard key={match.id} match={match} showDate={groupBy === 'phase' || groupBy === 'round'} />
            ))}
          </div>
        </div>
      ))}

      {shownCount < totalMatches && (
        <button
          onClick={() => setLimit((l) => l + PAGE_SIZE)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-bold text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
        >
          <ChevronDown size={14} />
          Mostrar mais ({totalMatches - shownCount} restantes)
        </button>
      )}
    </div>
  )
}

function MatchListSection({
  matches, groupBy, roundMap,
}: {
  matches: Match[]
  groupBy: GroupByOption
  roundMap: Map<string, number>
}) {
  const now = new Date()
  const todayStr = now.toLocaleDateString('pt-BR')

  const todayMatches = useMemo(() => {
    return matches.filter(m => {
      if (m.status === 'FINISHED') return false
      const d = new Date(m.date)
      return d.toLocaleDateString('pt-BR') === todayStr
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [matches, todayStr])

  const liveMatches = useMemo(() =>
    matches.filter(m => m.status === 'LIVE')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [matches])

  const finishedMatches = useMemo(() =>
    matches.filter(m => m.status === 'FINISHED')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [matches])

  const upcomingMatches = useMemo(() => {
    return matches.filter(m => {
      if (m.status === 'FINISHED' || m.status === 'LIVE') return false
      const d = new Date(m.date)
      return d.toLocaleDateString('pt-BR') !== todayStr
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [matches, todayStr])

  const totalCount = todayMatches.length + liveMatches.length + finishedMatches.length + upcomingMatches.length

  if (totalCount === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Calendar size={20} className="text-muted-foreground" />
        </div>
        <p className="font-medium">Nenhum jogo encontrado</p>
        <p className="mt-1 text-sm text-muted-foreground">Tente remover alguns filtros.</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {liveMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-red-500/30 pb-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <h2 className="text-sm font-black uppercase tracking-wider text-red-500">Ao Vivo</h2>
          </div>
          <MatchGroupedList matches={liveMatches} groupBy={groupBy} roundMap={roundMap} />
        </section>
      )}

      {todayMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Jogos de Hoje</h2>
          </div>
          <MatchGroupedList matches={todayMatches} groupBy={groupBy} roundMap={roundMap} />
        </section>
      )}

      {upcomingMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Próximos Jogos</h2>
          </div>
          <MatchGroupedList matches={upcomingMatches} groupBy={groupBy} roundMap={roundMap} />
        </section>
      )}

      {finishedMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/45" />
            <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Jogos Finalizados</h2>
          </div>
          <MatchGroupedList matches={finishedMatches} groupBy={groupBy} roundMap={roundMap} />
        </section>
      )}
    </div>
  )
}

export default function CalendarPage() {
  const { data: matches, isLoading } = useMatches()
  const { favoriteIds } = useFavorites()
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all')
  const [groupBy, setGroupBy] = useState<GroupByOption>('date')

  const now = useMemo(() => new Date(), [])
  const startOfToday = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()), [now])
  const endOfToday = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999), [now])
  const startOfTomorrow = useMemo(() => new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000), [startOfToday])
  const endOfTomorrow = useMemo(() => new Date(endOfToday.getTime() + 24 * 60 * 60 * 1000), [endOfToday])
  const endOfWeek = useMemo(() => new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000), [startOfToday])

  const matchRoundMap = useMemo(() => {
    if (!matches) return new Map<string, number>()
    const map = new Map<string, number>()
    const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']
    for (const g of GROUPS) {
      const gMatches = matches
        .filter(m => m.phase === 'GROUP_STAGE' && m.group === g)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      gMatches.forEach((m, i) => map.set(m.id, Math.floor(i / 2) + 1))
    }
    return map
  }, [matches])

  const filtered = useMemo(() => {
    if (!matches) return []
    return matches.filter((m) => {
      if (selectedPhase && m.phase !== selectedPhase) return false
      if (selectedTeams.length > 0 && m.homeTeam && m.awayTeam) {
        if (!selectedTeams.includes(m.homeTeam.id) && !selectedTeams.includes(m.awayTeam.id)) return false
      }
      const matchTime = new Date(m.date).getTime()
      if (timeFilter === 'today') {
        if (matchTime < startOfToday.getTime() || matchTime > endOfToday.getTime()) return false
      } else if (timeFilter === 'tomorrow') {
        if (matchTime < startOfTomorrow.getTime() || matchTime > endOfTomorrow.getTime()) return false
      } else if (timeFilter === 'week') {
        if (matchTime < startOfToday.getTime() || matchTime > endOfWeek.getTime()) return false
      }
      return true
    })
  }, [matches, selectedPhase, selectedTeams, timeFilter, startOfToday, endOfToday, startOfTomorrow, endOfTomorrow, endOfWeek])

  const favoriteMatches = useMemo(
    () => (matches ?? []).filter((m) =>
      m.homeTeam && m.awayTeam && (
        favoriteIds.includes(m.homeTeam.id) || favoriteIds.includes(m.awayTeam.id)
      )
    ),
    [matches, favoriteIds],
  )

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    )
  }

  const liveCount = (matches ?? []).filter(m => m.status === 'LIVE').length

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-5 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Copa do Mundo</p>
          <h1 className="mt-0.5 text-2xl font-black tracking-tight sm:text-3xl">Calendário 2026</h1>
          <p className="mt-1 text-sm text-white/70 flex items-center gap-2">
            {filtered.length} jogos
            {liveCount > 0 && (
              <span className="flex items-center gap-1 text-red-300 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                {liveCount} ao vivo
              </span>
            )}
          </p>
        </div>
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-4 right-20 h-16 w-16 rounded-full bg-white/5" />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-10 select-none">⚽</span>
      </div>

      <MatchFilters
        selectedPhase={selectedPhase}
        onPhaseChange={setSelectedPhase}
        selectedTeams={selectedTeams}
        onTeamsChange={setSelectedTeams}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quando</p>
          <div className="flex flex-wrap gap-1.5">
            {([
              { id: 'all', label: 'Todos' },
              { id: 'today', label: 'Hoje' },
              { id: 'tomorrow', label: 'Amanhã' },
              { id: 'week', label: 'Esta Semana' },
            ] as const).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                className={cn(
                  'h-7 rounded-lg px-3 text-xs font-semibold transition-all duration-150 active:scale-95',
                  timeFilter === filter.id
                    ? 'gradient-primary text-white shadow-sm'
                    : 'border border-border bg-card text-muted-foreground hover:border-primary/45 hover:text-foreground',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:text-right">Visualização</p>
          <div className="flex bg-muted/60 p-0.5 rounded-lg border border-border/40 w-fit sm:ml-auto">
            {([
              { id: 'date' as GroupByOption, label: 'Por Data' },
              { id: 'round' as GroupByOption, label: 'Por Rodada' },
              { id: 'phase' as GroupByOption, label: 'Por Grupo' },
            ]).map((mode) => (
              <button
                key={mode.id}
                onClick={() => setGroupBy(mode.id)}
                className={cn(
                  'px-3 py-1 text-[11px] font-bold rounded-md transition-all duration-150',
                  groupBy === mode.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all" className="flex-1 gap-1.5 sm:flex-none">
            <Calendar size={13} />
            Todos os jogos
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex-1 gap-1.5 sm:flex-none">
            <Heart size={13} />
            Favoritos
            {favoriteMatches.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {favoriteMatches.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-5">
          <MatchListSection matches={filtered} groupBy={groupBy} roundMap={matchRoundMap} />
        </TabsContent>

        <TabsContent value="favorites" className="mt-5">
          {favoriteIds.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Heart size={20} className="text-muted-foreground" />
              </div>
              <p className="font-medium">Sem favoritos ainda</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vá em <strong>Minha Seleção</strong> para favoritar times.
              </p>
            </div>
          ) : favoriteMatches.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Calendar size={20} className="text-muted-foreground" />
              </div>
              <p className="font-medium">Nenhum jogo dos seus times favoritos</p>
              <p className="mt-1 text-sm text-muted-foreground">Os jogos aparecerão aqui quando forem agendados.</p>
            </div>
          ) : (
            <MatchListSection matches={favoriteMatches} groupBy={groupBy} roundMap={matchRoundMap} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
