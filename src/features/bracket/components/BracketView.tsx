import { useEffect, useRef, useState, useMemo } from 'react'
import { TeamFlag } from '@/shared/components/TeamFlag'
import { useBracket } from '../hooks/useBracket'
import { TEAMS } from '@/core/api/mock/teams'
import { ALL_GROUPS, type GroupLetter } from '@/features/simulator/world-cup-bracket/types'
import { generateBracket } from '@/features/simulator/world-cup-bracket/bracket'
import { useStandings } from '@/features/standings/hooks/useStandings'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { Team } from '@/core/api/types'

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
  winner: boolean
  loser: boolean
  label: string
  status?: string
}

function TeamRow({ team, score, winner, loser, label }: TeamRowProps) {
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
  homeLabel: string
  awayLabel: string
  status?: string
  label?: string
  date?: string | null
  stadium?: string | null
  city?: string | null
}) {
  const isFinal = label === 'Final'
  
  const homeWon = homeScore !== null && awayScore !== null && homeScore > awayScore
  const awayWon = homeScore !== null && awayScore !== null && awayScore > homeScore
  const homeLost = homeScore !== null && awayScore !== null && homeScore < awayScore
  const awayLost = homeScore !== null && awayScore !== null && awayScore < homeScore

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
          winner={homeWon}
          loser={homeLost}
          label={homeLabel}
        />
        <TeamRow
          team={awayTeam}
          score={awayScore}
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
  const top1Won = top1.homeScore !== null && top1.awayScore !== null && top1.homeScore !== top1.awayScore
  const bottom1Won = bottom1.homeScore !== null && bottom1.awayScore !== null && bottom1.homeScore !== bottom1.awayScore
  const top2Won = top2.homeScore !== null && top2.awayScore !== null && top2.homeScore !== top2.awayScore
  const bottom2Won = bottom2.homeScore !== null && bottom2.awayScore !== null && bottom2.homeScore !== bottom2.awayScore
  
  const r16_1_Won = r16_1.homeScore !== null && r16_1.awayScore !== null && r16_1.homeScore !== r16_1.awayScore
  const r16_2_Won = r16_2.homeScore !== null && r16_2.awayScore !== null && r16_2.homeScore !== r16_2.awayScore

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
  const [activeSection, setActiveSection] = useState<'left' | 'center' | 'right'>('center')

  // Buscar classificação real e matches do bracket via cache Firestore
  const { data: standings, isLoading: loadingStandings } = useStandings()
  const { data: apiMatches, isLoading: loadingBracket } = useBracket()

  // Centraliza o scroll no painel de Finais por padrão
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = scrollContainerRef.current
      if (el) {
        el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
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

  // ── Mapeamento Dinâmico de Grupos e Placeholders ────────────────────
  const mergedBracket = useMemo(() => {
    if (!standings) return null

    // 1. Verificar se a fase de grupos já começou/finalizou
    const groupStatus: Record<GroupLetter, { first: string | null; second: string | null; third: string | null }> = {} as any
    const finishedGroups: GroupLetter[] = []

    for (const g of ALL_GROUPS) {
      const rows = standings.filter(s => s.group === g)
      const isFinished = rows.length > 0 && rows.every(s => s.played === 3)
      const isStarted = rows.some(s => s.played > 0)
      
      // Se começou ou terminou, pegamos os times em sua ordem de pontos
      if (isStarted || isFinished) {
        const sorted = [...rows].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points
          if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff
          return b.goalsFor - a.goalsFor
        })
        
        groupStatus[g] = {
          first: sorted[0]?.team.id ?? null,
          second: sorted[1]?.team.id ?? null,
          third: sorted[2]?.team.id ?? null,
        }
        
        if (isFinished) {
          finishedGroups.push(g)
        }
      } else {
        groupStatus[g] = { first: null, second: null, third: null }
      }
    }

    // Calcular os 8 melhores terceiros colocados se houver grupos finalizados
    let bestThirdsIds: string[] = []
    if (finishedGroups.length === 12) {
      const thirdsList = ALL_GROUPS.map(g => {
        const rows = standings.filter(s => s.group === g)
        const sorted = [...rows].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points
          if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff
          return b.goalsFor - a.goalsFor
        })
        return sorted[2] // 3rd placed row
      }).filter(Boolean)

      const sortedThirds = [...thirdsList].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff
        return b.goalsFor - a.goalsFor
      })
      bestThirdsIds = sortedThirds.slice(0, 8).map(r => r.team.id)
    }

    // 2. Gerar bracket estrutural com placeholders da FIFA 2026
    const baseBracket = generateBracket({
      groups: groupStatus,
      thirds: bestThirdsIds,
      bracket: {}
    })

    // 3. Mesclar placeholders estruturais com dados dinâmicos da API
    // Mapeamento de rounds e slots para a lista de matches da API (apiMatches)
    const findApiMatch = (roundName: string, slotIdx: number) => {
      if (!apiMatches || apiMatches.length === 0) return null
      
      const roundMap: Record<string, string> = {
        'R32': 'ROUND_OF_32',
        'R16': 'ROUND_OF_16',
        'QF': 'QUARTER_FINALS',
        'SF': 'SEMI_FINALS',
        'THIRD': 'THIRD_PLACE',
        'FINAL': 'FINAL'
      }
      
      const apiPhase = roundMap[roundName]
      const matchesInPhase = apiMatches.filter(m => m.round === apiPhase)
      // Ordena por ID do match para alinhar com o chaveamento
      const sorted = [...matchesInPhase].sort((a, b) => a.id.localeCompare(b.id))
      return sorted[slotIdx] ?? null
    }

    const mergeMatch = (baseMatch: any, roundName: string, slotIdx: number): MergedMatch => {
      const live = findApiMatch(roundName, slotIdx)

      // Resolve real teams and metadata
      const homeTeam = live?.homeTeam ?? (baseMatch.home ? TEAMS.find(t => t.id === baseMatch.home) ?? null : null)
      const awayTeam = live?.awayTeam ?? (baseMatch.away ? TEAMS.find(t => t.id === baseMatch.away) ?? null : null)

      return {
        homeTeam,
        awayTeam,
        homeScore: live?.score.home ?? null,
        awayScore: live?.score.away ?? null,
        homeLabel: baseMatch.homeLabel || 'A definir',
        awayLabel: baseMatch.awayLabel || 'A definir',
        status: live?.status || 'SCHEDULED',
        date: live?.date ?? null,
        stadium: live?.stadium ?? null,
        city: live?.city ?? null,
      }
    }

    const r32 = baseBracket.r32.map((m, i) => mergeMatch(m, 'R32', i))
    const r16 = baseBracket.r16.map((m, i) => mergeMatch(m, 'R16', i))
    const qf = baseBracket.qf.map((m, i) => mergeMatch(m, 'QF', i))
    const sf = baseBracket.sf.map((m, i) => mergeMatch(m, 'SF', i))
    const third = mergeMatch(baseBracket.third, 'THIRD', 0)
    const final = mergeMatch(baseBracket.final, 'FINAL', 0)

    // Achar o Campeão Real
    let champion: Team | null = null
    const finalLive = findApiMatch('FINAL', 0)
    if (finalLive && finalLive.status === 'FINISHED' && finalLive.score.home !== null && finalLive.score.away !== null) {
      if (finalLive.score.home > finalLive.score.away) {
        champion = finalLive.homeTeam
      } else {
        champion = finalLive.awayTeam
      }
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
  const sf1_Won = sf1.homeScore !== null && sf1.awayScore !== null && sf1.homeScore !== sf1.awayScore
  const sf2_Won = sf2.homeScore !== null && sf2.awayScore !== null && sf2.homeScore !== sf2.awayScore

  const qf1_Won = qf[0].homeScore !== null && qf[0].awayScore !== null && qf[0].homeScore !== qf[0].awayScore
  const qf2_Won = qf[1].homeScore !== null && qf[1].awayScore !== null && qf[1].homeScore !== qf[1].awayScore
  const qf3_Won = qf[2].homeScore !== null && qf[2].awayScore !== null && qf[2].homeScore !== qf[2].awayScore
  const qf4_Won = qf[3].homeScore !== null && qf[3].awayScore !== null && qf[3].homeScore !== qf[3].awayScore

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

      {/* Bracket horizontal com rolagem */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto pb-6 scrollbar-thin select-none"
      >
        <div className="flex flex-col min-w-max items-center">
          
          {/* Cabeçalho de Rodadas (Alinhado Horizontalmente) */}
          <div className="flex items-center justify-center gap-0 px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/30 pb-2.5 mb-5 w-full select-none">
            {/* Lado Esquerdo Headers */}
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
            
            {/* Centro Header */}
            <div className="text-center w-[192px] sm:w-[208px] font-black text-foreground/80">Final e 3º Lugar</div>
            
            <div className="w-6" />
            <div className="text-center w-36 sm:w-40 font-extrabold text-primary">Semifinal</div>
            <div className="w-6" />
            
            {/* Lado Direito Headers */}
            <div className="flex shrink-0 flex-row-reverse">
              <div className="text-center w-36 sm:w-40">16-avos de final</div>
              <div className="w-6" />
              <div className="text-center w-36 sm:w-40 text-primary">Oitavas de final</div>
              <div className="w-6" />
              <div className="text-center w-36 sm:w-40 text-primary">Quartas de final</div>
            </div>
          </div>

          {/* Cards do Chaveamento */}
          <div className="flex items-center justify-center gap-0 px-2 py-2">
            
            {/* ─── LADO ESQUERDO ─── */}
            <div className="flex items-center">
              {/* Árvore de Quartas 1 e 2 */}
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

              {/* Linha SF1 -> Final */}
              <div className="flex items-center h-[640px] shrink-0">
                <svg width={24} height={640} className="shrink-0 pointer-events-none">
                  <path d="M 0 320 L 24 320" className={cn("stroke-2 transition-all", sf1_Won ? "stroke-success" : "stroke-border/30")} fill="none" />
                </svg>
              </div>
            </div>

            {/* ─── CENTRO (FINAL, 3º LUGAR, CAMPEÃO) ─── */}
            <div className="flex flex-col items-center justify-center gap-12 h-[640px] px-6 shrink-0 relative">
              
              {/* Grande Final */}
              <div className="flex flex-col items-center gap-2">
                <MatchNode {...final} label="Final" />
              </div>

              {/* Painel do Campeão Sóbrio */}
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

              {/* Disputa do 3º Lugar */}
              <div className="flex flex-col items-center gap-2">
                <MatchNode {...third} label="3º Lugar" />
              </div>
            </div>

            {/* ─── LADO DIREITO ─── */}
            <div className="flex items-center">
              {/* Linha Final <- SF2 */}
              <div className="flex items-center h-[640px] shrink-0">
                <svg width={24} height={640} className="shrink-0 pointer-events-none">
                  <path d="M 24 320 L 0 320" className={cn("stroke-2 transition-all", sf2_Won ? "stroke-success" : "stroke-border/30")} fill="none" />
                </svg>
              </div>

              {/* Semifinal Direita */}
              <div className="flex items-center h-[640px] shrink-0">
                <MatchNode {...sf2} />
              </div>

              {/* Conector SF2 <- QF */}
              <div className="flex items-center h-[640px] shrink-0">
                <MatchConnector height={640} topWon={qf3_Won} bottomWon={qf4_Won} isLeft={false} />
              </div>

              {/* Árvore de Quartas 3 e 4 */}
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
      </div>
    </div>
  )
}
