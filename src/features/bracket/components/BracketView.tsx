import { useEffect, useRef, useState, useMemo } from 'react'
import { TeamFlag } from '@/shared/components/TeamFlag'
import { useBracket } from '../hooks/useBracket'
import { TEAMS } from '@/core/api/mock/teams'
import { generateBracket } from '@/features/simulator/world-cup-bracket/bracket'
import { deriveScenarioState, findLiveMatch, winnerOf } from '@/features/simulator/world-cup-bracket/scenario'
import { useStandings } from '@/features/standings/hooks/useStandings'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { Team, MatchWinner } from '@/core/api/types'

function formatMatchDate(iso: string): string {
  const d = new Date(iso)
  const day = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'America/Sao_Paulo' }).replace('.', '')
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
  return `${day} · ${time}`
}

function shortVenue(stadium: string | null | undefined, city: string | null | undefined): string {
  const parts: string[] = []
  if (stadium) parts.push(stadium)
  if (city) parts.push(city.split(',')[0])
  return parts.join(' · ')
}

interface TeamRowProps {
  team: Team | null
  score: number | null
  pen?: number | null
  winner: boolean
  loser: boolean
  label: string
  status?: string
}

// Um confronto está decidido se a API marcou o vencedor (cobre pênaltis, em que
// o placar de exibição fica empatado) ou, em caches antigos, se o placar difere.
function isDecided(m: { winner?: MatchWinner; homeScore: number | null; awayScore: number | null }): boolean {
  if (m.winner === 'HOME_TEAM' || m.winner === 'AWAY_TEAM') return true
  return m.homeScore != null && m.awayScore != null && m.homeScore !== m.awayScore
}

function TeamRow({ team, score, pen, winner, loser, label }: TeamRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] transition-all select-none',
        winner && 'bg-success/5 font-extrabold text-success',
        loser && 'opacity-40 line-through text-muted-foreground/80',
      )}
    >
      {team ? (
        <>
          <TeamFlag code={team.code} name={team.name} size={14} />
          <span className="truncate flex-1">{team.shortName}</span>
          {score !== null && (
            <span className={cn('font-bold tabular-nums ml-1', winner ? 'text-success' : 'text-muted-foreground')}>
              {score}
              {pen != null && (
                <span className="ml-0.5 text-[9px] font-semibold opacity-70" title="Pênaltis">({pen})</span>
              )}
            </span>
          )}
        </>
      ) : (
        <span className="truncate text-[9px] text-muted-foreground/50">{label}</span>
      )}
    </div>
  )
}

function MatchNode({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  penHome,
  penAway,
  winner,
  homeLabel,
  awayLabel,
  status,
  label,
  date,
  stadium,
  city,
}: {
  homeTeam: Team | null
  awayTeam: Team | null
  homeScore: number | null
  awayScore: number | null
  penHome?: number | null
  penAway?: number | null
  winner?: MatchWinner
  homeLabel: string
  awayLabel: string
  status?: string
  label?: string
  date?: string | null
  stadium?: string | null
  city?: string | null
}) {
  const isFinal = label === 'Final'

  // Lado vencedor pelo campo oficial (cobre pênaltis); cai p/ comparação de
  // gols em caches antigos sem `winner`.
  const decided: 'home' | 'away' | null =
    winner === 'HOME_TEAM' ? 'home'
    : winner === 'AWAY_TEAM' ? 'away'
    : (homeScore !== null && awayScore !== null && homeScore !== awayScore)
      ? (homeScore > awayScore ? 'home' : 'away')
      : null
  const homeWon = decided === 'home'
  const awayWon = decided === 'away'
  const homeLost = decided === 'away'
  const awayLost = decided === 'home'

  return (
    <div
      className={cn(
        'w-36 overflow-hidden rounded-xl border sm:w-40 shrink-0 shadow-sm transition-all',
        isFinal 
          ? 'border-amber-500 bg-amber-500/[0.01]' 
          : 'border-border bg-card hover:shadow',
      )}
    >
      {label && (
        <div className={cn(
          "px-2.5 py-1 border-b text-[9px] font-bold uppercase tracking-wider flex justify-between items-center",
          isFinal ? "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400" : "border-border/30 bg-muted/10 text-muted-foreground",
        )}>
          <span>{label}</span>
          {status === 'LIVE' && (
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" title="Ao vivo" />
          )}
        </div>
      )}
      <div className="divide-y divide-border/30">
        <TeamRow
          team={homeTeam}
          score={homeScore}
          pen={penHome}
          winner={homeWon}
          loser={homeLost}
          label={homeLabel}
        />
        <TeamRow
          team={awayTeam}
          score={awayScore}
          pen={penAway}
          winner={awayWon}
          loser={awayLost}
          label={awayLabel}
        />
      </div>
      {/* Match metadata */}
      {(date || stadium || city) && (
        <div className="px-2 py-1.5 bg-muted/5 border-t border-border/20 space-y-0.5">
          {date && (
            <p className="text-[9px] font-semibold text-primary/80 tabular-nums truncate">
              {formatMatchDate(date)}
            </p>
          )}
          {(stadium || city) && (
            <p className="text-[9px] text-muted-foreground/70 truncate leading-tight">
              {shortVenue(stadium, city)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function MatchConnector({
  height,
  topWon,
  bottomWon,
  isLeft = true,
}: {
  height: number
  topWon: boolean
  bottomWon: boolean
  isLeft?: boolean
}) {
  const W = 24
  const H = height

  const yTop = H / 4
  const yBot = (3 * H) / 4
  const yMid = H / 2
  const xStart = isLeft ? 0 : W
  const xEnd = isLeft ? W : 0
  const xMid = W / 2

  const pathTop = `M ${xStart} ${yTop} L ${xMid} ${yTop} L ${xMid} ${yMid}`
  const pathBot = `M ${xStart} ${yBot} L ${xMid} ${yBot} L ${xMid} ${yMid}`
  const pathOut = `M ${xMid} ${yMid} L ${xEnd} ${yMid}`

  return (
    <svg width={W} height={H} className="shrink-0 pointer-events-none">
      <path d={pathTop} fill="none" className={cn("stroke-2 transition-all", topWon ? "stroke-success" : "stroke-border/30")} />
      <path d={pathBot} fill="none" className={cn("stroke-2 transition-all", bottomWon ? "stroke-success" : "stroke-border/30")} />
      <path d={pathOut} fill="none" className={cn("stroke-2 transition-all", (topWon || bottomWon) ? "stroke-success" : "stroke-border/30")} />
    </svg>
  )
}

interface MergedMatch {
  homeTeam: Team | null
  awayTeam: Team | null
  homeScore: number | null
  awayScore: number | null
  penHome?: number | null
  penAway?: number | null
  winner?: MatchWinner
  homeLabel: string
  awayLabel: string
  status?: string
  date?: string | null
  stadium?: string | null
  city?: string | null
}

function QFTree({
  top1, bottom1, r16_1,
  top2, bottom2, r16_2,
  qf,
  isLeft = true,
}: {
  top1: MergedMatch, bottom1: MergedMatch, r16_1: MergedMatch,
  top2: MergedMatch, bottom2: MergedMatch, r16_2: MergedMatch,
  qf: MergedMatch,
  isLeft?: boolean,
}) {
  const top1Won = isDecided(top1)
  const bottom1Won = isDecided(bottom1)
  const top2Won = isDecided(top2)
  const bottom2Won = isDecided(bottom2)

  const r16_1_Won = isDecided(r16_1)
  const r16_2_Won = isDecided(r16_2)

  return (
    <div className={cn("flex items-center shrink-0", isLeft ? "flex-row" : "flex-row-reverse")}>
      {/* Coluna 1: R32 matches */}
      <div className="flex flex-col gap-4">
        <MatchNode {...top1} />
        <MatchNode {...bottom1} />
        <MatchNode {...top2} />
        <MatchNode {...bottom2} />
      </div>

      {/* Conectores R32 -> R16 */}
      <div className="flex flex-col justify-around h-[304px] shrink-0">
        <MatchConnector height={144} topWon={top1Won} bottomWon={bottom1Won} isLeft={isLeft} />
        <MatchConnector height={144} topWon={top2Won} bottomWon={bottom2Won} isLeft={isLeft} />
      </div>

      {/* Coluna 2: R16 matches */}
      <div className="flex flex-col justify-around h-[304px] shrink-0">
        <MatchNode {...r16_1} />
        <MatchNode {...r16_2} />
      </div>

      {/* Conector R16 -> QF */}
      <div className="flex items-center h-[304px] shrink-0">
        <MatchConnector height={304} topWon={r16_1_Won} bottomWon={r16_2_Won} isLeft={isLeft} />
      </div>

      {/* Coluna 3: QF match */}
      <div className="flex items-center h-[304px] shrink-0">
        <MatchNode {...qf} />
      </div>
    </div>
  )
}

export function BracketView() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<'left' | 'center' | 'right'>('left')

  const { data: standings, isLoading: loadingStandings } = useStandings()
  const { data: apiMatches, isLoading: loadingBracket } = useBracket()

  // Começa pela esquerda (Chave A) para já mostrar conteúdo sem rolar
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = scrollContainerRef.current
      if (el) {
        el.scrollLeft = 0
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [loadingBracket])

  const handleScrollTo = (section: 'left' | 'center' | 'right') => {
    const el = scrollContainerRef.current
    if (!el) return
    setActiveSection(section)

    let scrollLeft = 0
    if (section === 'center') {
      scrollLeft = (el.scrollWidth - el.clientWidth) / 2
    } else if (section === 'right') {
      scrollLeft = el.scrollWidth - el.clientWidth
    }

    el.scrollTo({ left: scrollLeft, behavior: 'smooth' })
  }

  const mergedBracket = useMemo(() => {
    if (!standings) return null

    // Deriva grupos + 8 terceiros + vencedores reais a partir da MESMA fonte
    // (classificação + mata-mata da API). Toda a lógica vive em scenario.ts —
    // o simulador consome exatamente a mesma derivação.
    const sim = deriveScenarioState(standings, apiMatches)
    const baseBracket = generateBracket(sim)

    const mergeMatch = (baseMatch: any, roundName: string): MergedMatch => {
      const live = findLiveMatch(apiMatches, roundName, baseMatch.home, baseMatch.away)
      const homeTeam = live?.homeTeam ?? (baseMatch.home ? TEAMS.find(t => t.id === baseMatch.home) ?? null : null)
      const awayTeam = live?.awayTeam ?? (baseMatch.away ? TEAMS.find(t => t.id === baseMatch.away) ?? null : null)

      return {
        homeTeam,
        awayTeam,
        homeScore: live?.score.home ?? null,
        awayScore: live?.score.away ?? null,
        penHome: live?.penalties?.home ?? null,
        penAway: live?.penalties?.away ?? null,
        winner: live?.winner ?? null,
        homeLabel: baseMatch.homeLabel || 'A definir',
        awayLabel: baseMatch.awayLabel || 'A definir',
        status: live?.status || 'SCHEDULED',
        date: live?.date ?? null,
        stadium: live?.stadium ?? null,
        city: live?.city ?? null,
      }
    }

    const r32 = baseBracket.r32.map((m) => mergeMatch(m, 'R32'))
    const r16 = baseBracket.r16.map((m) => mergeMatch(m, 'R16'))
    const qf = baseBracket.qf.map((m) => mergeMatch(m, 'QF'))
    const sf = baseBracket.sf.map((m) => mergeMatch(m, 'SF'))
    const third = mergeMatch(baseBracket.third, 'THIRD')
    const final = mergeMatch(baseBracket.final, 'FINAL')

    let champion: Team | null = null
    const finalLive = findLiveMatch(apiMatches, 'FINAL', baseBracket.final.home, baseBracket.final.away)
    if (finalLive && finalLive.status === 'FINISHED') {
      const champId = winnerOf(finalLive)
      champion = finalLive.homeTeam?.id === champId
        ? finalLive.homeTeam
        : finalLive.awayTeam?.id === champId
          ? finalLive.awayTeam
          : null
    }

    return { r32, r16, qf, sf, third, final, champion }
  }, [standings, apiMatches])

  if (loadingStandings || loadingBracket) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    )
  }

  if (!mergedBracket) {
    return (
      <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
        Erro ao construir chaveamento oficial.
      </div>
    )
  }

  const { r32, r16, qf, sf, third, final, champion } = mergedBracket

  const sf1 = sf[0]
  const sf2 = sf[1]
  const sf1_Won = isDecided(sf1)
  const sf2_Won = isDecided(sf2)

  const qf1_Won = isDecided(qf[0])
  const qf2_Won = isDecided(qf[1])
  const qf3_Won = isDecided(qf[2])
  const qf4_Won = isDecided(qf[3])

  return (
    <div className="space-y-4">
      {/* Navegação mobile rápida para a rolagem de chaveamento */}
      <div className="flex justify-center md:hidden pb-1 select-none">
        <div className="flex bg-muted/65 p-1 rounded-xl border border-border/40">
          {([
            { id: 'left', label: 'Chave A' },
            { id: 'center', label: 'Finais' },
            { id: 'right', label: 'Chave B' },
          ] as const).map(sec => (
            <button
              key={sec.id}
              onClick={() => handleScrollTo(sec.id)}
              className={cn(
                'px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all duration-200 active:scale-95',
                activeSection === sec.id
                  ? 'bg-card text-foreground shadow-sm font-extrabold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea
        viewportRef={scrollContainerRef}
        className="w-full pb-2 select-none"
      >
        <ScrollBar orientation="horizontal" />
        <div className="flex flex-col min-w-max items-center">
          
          <div className="flex items-center justify-center gap-0 px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/30 pb-2.5 mb-5 w-full select-none">
            <div className="flex shrink-0">
              <div className="text-center w-36 sm:w-40">16-avos de final</div>
              <div className="w-6" />
              <div className="text-center w-36 sm:w-40 text-primary">Oitavas de final</div>
              <div className="w-6" />
              <div className="text-center w-36 sm:w-40 text-primary">Quartas de final</div>
            </div>
            
            <div className="w-6" />
            <div className="text-center w-36 sm:w-40 font-extrabold text-primary">Semifinal</div>
            <div className="w-6" />
            
            <div className="text-center w-[192px] sm:w-[208px] font-black text-foreground/80">Final e 3º Lugar</div>
            
            <div className="w-6" />
            <div className="text-center w-36 sm:w-40 font-extrabold text-primary">Semifinal</div>
            <div className="w-6" />
            
            <div className="flex shrink-0 flex-row-reverse">
              <div className="text-center w-36 sm:w-40">16-avos de final</div>
              <div className="w-6" />
              <div className="text-center w-36 sm:w-40 text-primary">Oitavas de final</div>
              <div className="w-6" />
              <div className="text-center w-36 sm:w-40 text-primary">Quartas de final</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-0 px-2 py-2">
            <div className="flex items-center">
              <div className="flex flex-col gap-8">
                <QFTree
                  top1={r32[1]}
                  bottom1={r32[4]}
                  r16_1={r16[0]}
                  top2={r32[0]}
                  bottom2={r32[2]}
                  r16_2={r16[1]}
                  qf={qf[0]}
                  isLeft={true}
                />
                <QFTree
                  top1={r32[10]}
                  bottom1={r32[11]}
                  r16_1={r16[4]}
                  top2={r32[8]}
                  bottom2={r32[9]}
                  r16_2={r16[5]}
                  qf={qf[1]}
                  isLeft={true}
                />
              </div>

              {/* Conector QF -> SF (Left) */}
              <div className="flex items-center h-[640px] shrink-0">
                <MatchConnector height={640} topWon={qf1_Won} bottomWon={qf2_Won} isLeft={true} />
              </div>

              {/* Semifinal Esquerda */}
              <div className="flex items-center h-[640px] shrink-0">
                <MatchNode {...sf1} />
              </div>

              <div className="flex items-center h-[640px] shrink-0">
                <svg width={24} height={640} className="shrink-0 pointer-events-none">
                  <path d="M 0 320 L 24 320" className={cn("stroke-2 transition-all", sf1_Won ? "stroke-success" : "stroke-border/30")} fill="none" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-12 h-[640px] px-6 shrink-0 relative">
              <div className="flex flex-col items-center gap-2">
                <MatchNode {...final} label="Final" />
              </div>

              {champion ? (
                <div className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-amber-500 bg-amber-500/[0.03] max-w-[160px] shadow-sm animate-scale-in text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M5.166 2.621A1 1 0 0 1 6 2h12a1 1 0 0 1 .834.455l3.42 5.13a6 6 0 0 1-2.298 8.163l-2.456 1.403a4.004 4.004 0 0 1-.9 2.277L18 21a1 1 0 0 1-1.664.757l-1.5-1.363a1 1 0 0 0-1.34 0l-1.5 1.363A1 1 0 0 1 10.5 21l1.3-1.572a4.004 4.004 0 0 1-.9-2.277l-2.456-1.403a6 6 0 0 1-2.298-8.163l3.42-5.13ZM6 4l-2.28 3.42a4 4 0 0 0 1.532 5.442l2.456 1.403a2.001 2.001 0 0 0 2.222-.249l1.635-1.486a2 2 0 0 1 2.68 0l1.635 1.486a2 2 0 0 0 2.222.25l2.456-1.404a4 4 0 0 0 1.532-5.441L18 4H6Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Campeão do Mundo</p>
                    <p className="text-xs font-black text-foreground truncate max-w-[130px]">{champion.name}</p>
                  </div>
                </div>
              ) : (
                <div className="h-16 flex items-center justify-center opacity-10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path fillRule="evenodd" d="M5.166 2.621A1 1 0 0 1 6 2h12a1 1 0 0 1 .834.455l3.42 5.13a6 6 0 0 1-2.298 8.163l-2.456 1.403a4.004 4.004 0 0 1-.9 2.277L18 21a1 1 0 0 1-1.664.757l-1.5-1.363a1 1 0 0 0-1.34 0l-1.5 1.363A1 1 0 0 1 10.5 21l1.3-1.572a4.004 4.004 0 0 1-.9-2.277l-2.456-1.403a6 6 0 0 1-2.298-8.163l3.42-5.13ZM6 4l-2.28 3.42a4 4 0 0 0 1.532 5.442l2.456 1.403a2.001 2.001 0 0 0 2.222-.249l1.635-1.486a2 2 0 0 1 2.68 0l1.635 1.486a2 2 0 0 0 2.222.25l2.456-1.404a4 4 0 0 0 1.532-5.441L18 4H6Z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                <MatchNode {...third} label="3º Lugar" />
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center h-[640px] shrink-0">
                <svg width={24} height={640} className="shrink-0 pointer-events-none">
                  <path d="M 24 320 L 0 320" className={cn("stroke-2 transition-all", sf2_Won ? "stroke-success" : "stroke-border/30")} fill="none" />
                </svg>
              </div>

              <div className="flex items-center h-[640px] shrink-0">
                <MatchNode {...sf2} />
              </div>

              <div className="flex items-center h-[640px] shrink-0">
                <MatchConnector height={640} topWon={qf3_Won} bottomWon={qf4_Won} isLeft={false} />
              </div>

              <div className="flex flex-col gap-8">
                <QFTree
                  top1={r32[3]}
                  bottom1={r32[5]}
                  r16_1={r16[2]}
                  top2={r32[6]}
                  bottom2={r32[7]}
                  r16_2={r16[3]}
                  qf={qf[2]}
                  isLeft={false}
                />
                <QFTree
                  top1={r32[13]}
                  bottom1={r32[15]}
                  r16_1={r16[6]}
                  top2={r32[12]}
                  bottom2={r32[14]}
                  r16_2={r16[7]}
                  qf={qf[3]}
                  isLeft={false}
                />
              </div>
            </div>
            
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
