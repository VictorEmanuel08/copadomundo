import type { Match } from '@/core/api/types'
import { TeamFlag } from '@/shared/components/TeamFlag'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStandings } from '@/features/standings/hooks/useStandings'

const PHASE_LABELS: Record<string, string> = {
  GROUP_STAGE: 'Fase de Grupos',
  ROUND_OF_32: '16-avos de final',
  ROUND_OF_16: 'Oitavas de final',
  QUARTER_FINALS: 'Quartas de final',
  SEMI_FINALS: 'Semifinal',
  THIRD_PLACE: 'Disputa de 3º Lugar',
  FINAL: 'Final',
}

interface MatchCardProps {
  match: Match
  compact?: boolean
  showDate?: boolean
}

function getCountrySuffix(city: string): string {
  const c = city.toLowerCase()
  if (c.includes('vancouver') || c.includes('toronto')) return 'Canadá'
  if (c.includes('cidade') || c.includes('mexico') || c.includes('guadalajara') || c.includes('monterrey') || c.includes('méxico')) return 'México'
  return 'EUA'
}

export function MatchCard({ match, compact = false, showDate = false }: MatchCardProps) {
  const { data: standings } = useStandings()

  const date = new Date(match.date)
  const timeStr = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })

  const dateStr = date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })

  // Capitalize: sáb, 13/06 -> Sáb, 13/06
  const dateFormatted = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  const hasScore = match.score.home !== null && match.score.away !== null
  const isLive = match.status === 'LIVE'
  const isFinal = match.phase === 'FINAL'

  // Position within group, sorted by points → goal diff → goals for
  const groupRows = standings?.filter((s) => s.group === match.homeTeam.group) ?? []
  const sortedGroup = [...groupRows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff
    return b.goalsFor - a.goalsFor
  })
  const homePos = match.phase === 'GROUP_STAGE'
    ? (sortedGroup.findIndex((s) => s.team.id === match.homeTeam.id) + 1) || undefined
    : undefined
  const awayPos = match.phase === 'GROUP_STAGE'
    ? (sortedGroup.findIndex((s) => s.team.id === match.awayTeam.id) + 1) || undefined
    : undefined

  function renderPositionBadge(pos: number | undefined) {
    if (pos === undefined || match.phase !== 'GROUP_STAGE') return null
    return (
      <span className={cn(
        "text-[9px] font-extrabold px-1 py-0.5 rounded-md tabular-nums shrink-0 align-middle shadow-sm select-none border",
        pos === 1 && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
        pos === 2 && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
        pos === 3 && "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25",
        pos === 4 && "bg-muted text-muted-foreground border-border/50 opacity-60"
      )}>
        {pos}º
      </span>
    )
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-250',
        'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/8',
        isFinal && 'border-gold/30 bg-linear-to-br from-card to-gold/5',
        compact ? 'p-3' : 'p-4',
      )}
    >
      {isLive && (
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <span className="h-2 w-2 animate-ping rounded-full bg-red-500" />
          <span className="text-xs font-bold uppercase tracking-wide text-red-500">Ao vivo</span>
        </div>
      )}

      {/* Header */}
      {!compact && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {match.group && (
            <Badge variant="secondary" className="h-5 rounded-md px-2 text-[11px] font-bold">
              Grupo {match.group}
            </Badge>
          )}
          <Badge
            variant="outline"
            className={cn('h-5 rounded-md px-2 text-[11px] font-bold', isFinal && 'border-gold/50 text-gold')}
          >
            {PHASE_LABELS[match.phase]}
          </Badge>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            {showDate && (
              <>
                <Calendar size={11} className="shrink-0" />
                <span className="text-foreground/80 font-bold">{dateFormatted}</span>
                <span className="opacity-40 font-normal">•</span>
              </>
            )}
            <Clock size={11} className="shrink-0" />
            <span>{timeStr}</span>
          </div>
        </div>
      )}

      {/* Teams + Score */}
      <div className="flex items-center gap-2">
        {/* Home Team */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {renderPositionBadge(homePos)}
          <p className="hidden truncate text-right text-sm font-bold leading-tight sm:block text-foreground/90">
            {match.homeTeam.name}
          </p>
          <p className="block truncate text-right text-sm font-bold leading-tight sm:hidden text-foreground/90">
            {match.homeTeam.shortName}
          </p>
          <TeamFlag code={match.homeTeam.code} name={match.homeTeam.name} size={compact ? 20 : 28} />
        </div>

        {/* Score box */}
        <div
          className={cn(
            'flex w-14 shrink-0 items-center justify-center rounded-xl py-1.5 border border-transparent transition-all',
            hasScore ? 'bg-primary/10 border-primary/10' : 'bg-muted border-border/10',
            isLive && 'bg-red-500/10 border-red-500/10',
          )}
        >
          {hasScore ? (
            <span className="text-base font-black tabular-nums">
              {match.score.home}–{match.score.away}
            </span>
          ) : (
            <span className="text-xs font-bold text-muted-foreground/85">vs</span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <TeamFlag code={match.awayTeam.code} name={match.awayTeam.name} size={compact ? 20 : 28} />
          <p className="hidden truncate text-sm font-bold leading-tight sm:block text-foreground/90">
            {match.awayTeam.name}
          </p>
          <p className="block truncate text-sm font-bold leading-tight sm:hidden text-foreground/90">
            {match.awayTeam.shortName}
          </p>
          {renderPositionBadge(awayPos)}
        </div>
      </div>

      {/* Time & Date in Compact Mode (e.g. Pool list) */}
      {compact && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
          <Calendar size={10} className="shrink-0" />
          <span className="text-foreground/75 font-bold">{dateFormatted}</span>
          <span className="opacity-40 font-normal">•</span>
          <Clock size={10} className="shrink-0" />
          <span>{timeStr}</span>
        </div>
      )}

      {/* Stadium & City */}
      {!compact && match.stadium && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{match.stadium}, {match.city}</span>
        </div>
      )}
    </div>
  )
}
