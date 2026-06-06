import { useEffect, useRef, useState } from 'react'
import { TeamFlag } from '@/shared/components/TeamFlag'
import { TEAMS } from '@/core/api/mock/teams'
import type { KnockoutMatch, FullBracket } from '../world-cup-bracket/types'
import { cn } from '@/lib/utils'

interface BracketViewProps {
  bracket:    FullBracket
  winners:    Record<string, string | null>
  onPick:     (matchId: string, teamId: string) => void
  disabled?:  boolean
}

function TeamRow({
  teamId,
  isWinner,
  isLoser,
  label,
  onClick,
  disabled,
}: {
  teamId:   string | null
  isWinner: boolean
  isLoser:  boolean
  label?:   string
  onClick?: () => void
  disabled: boolean
}) {
  const team = teamId ? TEAMS.find(t => t.id === teamId) : null

  return (
    <button
      onClick={onClick}
      disabled={disabled || !teamId}
      className={cn(
        'flex w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-[11px] transition-all select-none',
        isWinner
          ? 'border-success/30 bg-success/10 font-extrabold text-success'
          : isLoser
          ? 'border-border/20 bg-muted/10 text-muted-foreground/45 line-through'
          : teamId
          ? 'border-border bg-card hover:border-primary/30 hover:bg-primary/[0.02] active:scale-[0.98] cursor-pointer font-semibold'
          : 'border-dashed border-border/20 bg-transparent text-muted-foreground/30 cursor-default',
      )}
    >
      {team ? (
        <>
          <TeamFlag code={team.code} name={team.name} size={14} />
          <span className="truncate">{team.shortName}</span>
        </>
      ) : (
        <span className="truncate text-[9px] text-muted-foreground/50">{label ?? 'A definir'}</span>
      )}
    </button>
  )
}

function MatchCard({
  match,
  winner,
  onPick,
  disabled = false,
}: {
  match:   KnockoutMatch
  winner:  string | null | undefined
  onPick:  (teamId: string) => void
  disabled?: boolean
}) {
  const isFinal = match.round === 'FINAL'
  const homeWon = !!winner && winner === match.home
  const awayWon = !!winner && winner === match.away
  const hasTeams = !!(match.home || match.away)

  return (
    <div
      className={cn(
        'w-36 overflow-hidden rounded-xl border sm:w-40 shrink-0 shadow-sm transition-all',
        isFinal 
          ? 'border-amber-500 bg-amber-500/[0.01]' 
          : 'border-border bg-card hover:shadow',
      )}
    >
      <div className="divide-y divide-border/30">
        <TeamRow
          teamId={match.home}
          isWinner={homeWon}
          isLoser={awayWon && !!match.home}
          label={match.homeLabel}
          disabled={disabled || !hasTeams}
          onClick={() => match.home && !homeWon && onPick(match.home)}
        />
        <TeamRow
          teamId={match.away}
          isWinner={awayWon}
          isLoser={homeWon && !!match.away}
          label={match.awayLabel}
          disabled={disabled || !hasTeams}
          onClick={() => match.away && !awayWon && onPick(match.away)}
        />
      </div>
      {/* Match metadata */}
      {(match.date || match.stadium || match.city) && (
        <div className="text-[9px] text-muted-foreground px-2 py-1 bg-muted/5">
          {match.date && <div>{match.date}</div>}
          {match.stadium && <div>{match.stadium}</div>}
          {match.city && <div>{match.city}</div>}
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

function QFTree({
  top1, bottom1, r16_1,
  top2, bottom2, r16_2,
  qf,
  winners,
  onPick,
  isLeft = true,
  disabled = false,
}: {
  top1: KnockoutMatch, bottom1: KnockoutMatch, r16_1: KnockoutMatch,
  top2: KnockoutMatch, bottom2: KnockoutMatch, r16_2: KnockoutMatch,
  qf: KnockoutMatch,
  winners: Record<string, string | null>,
  onPick: (matchId: string, teamId: string) => void,
  isLeft?: boolean,
  disabled?: boolean,
}) {
  const top1Won = winners[top1.id] === top1.home || winners[top1.id] === top1.away
  const bottom1Won = winners[bottom1.id] === bottom1.home || winners[bottom1.id] === bottom1.away
  const top2Won = winners[top2.id] === top2.home || winners[top2.id] === top2.away
  const bottom2Won = winners[bottom2.id] === bottom2.home || winners[bottom2.id] === bottom2.away
  
  const r16_1_Won = winners[r16_1.id] === r16_1.home || winners[r16_1.id] === r16_1.away
  const r16_2_Won = winners[r16_2.id] === r16_2.home || winners[r16_2.id] === r16_2.away

  return (
    <div className={cn("flex items-center shrink-0", isLeft ? "flex-row" : "flex-row-reverse")}>
      {/* Coluna 1: 4 confrontos R32 */}
      <div className="flex flex-col gap-4">
        <MatchCard match={top1} winner={winners[top1.id]} onPick={(tid) => onPick(top1.id, tid)} disabled={disabled} />
        <MatchCard match={bottom1} winner={winners[bottom1.id]} onPick={(tid) => onPick(bottom1.id, tid)} disabled={disabled} />
        <MatchCard match={top2} winner={winners[top2.id]} onPick={(tid) => onPick(top2.id, tid)} disabled={disabled} />
        <MatchCard match={bottom2} winner={winners[bottom2.id]} onPick={(tid) => onPick(bottom2.id, tid)} disabled={disabled} />
      </div>

      {/* Conectores R32 -> R16 */}
      <div className="flex flex-col justify-around h-[304px] shrink-0">
        <MatchConnector height={144} topWon={top1Won} bottomWon={bottom1Won} isLeft={isLeft} />
        <MatchConnector height={144} topWon={top2Won} bottomWon={bottom2Won} isLeft={isLeft} />
      </div>

      {/* Coluna 2: 2 confrontos R16 */}
      <div className="flex flex-col justify-around h-[304px] shrink-0">
        <MatchCard match={r16_1} winner={winners[r16_1.id]} onPick={(tid) => onPick(r16_1.id, tid)} disabled={disabled} />
        <MatchCard match={r16_2} winner={winners[r16_2.id]} onPick={(tid) => onPick(r16_2.id, tid)} disabled={disabled} />
      </div>

      {/* Conector R16 -> QF */}
      <div className="flex items-center h-[304px] shrink-0">
        <MatchConnector height={304} topWon={r16_1_Won} bottomWon={r16_2_Won} isLeft={isLeft} />
      </div>

      {/* Coluna 3: 1 confronto QF */}
      <div className="flex items-center h-[304px] shrink-0">
        <MatchCard match={qf} winner={winners[qf.id]} onPick={(tid) => onPick(qf.id, tid)} disabled={disabled} />
      </div>
    </div>
  )
}

export function BracketView({ bracket, winners, onPick, disabled = false }: BracketViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<'left' | 'center' | 'right'>('center')

  // Centraliza o scroll no painel de Finais por padrão
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = scrollContainerRef.current
      if (el) {
        el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
      }
    }, 150)
    return () => clearTimeout(timer)
  }, [])

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

  const champion = winners['m104']
    ? TEAMS.find(t => t.id === winners['m104'])
    : null

  const sf1 = bracket.sf[0]
  const sf2 = bracket.sf[1]
  const sf1_Won = winners[sf1.id] === sf1.home || winners[sf1.id] === sf1.away
  const sf2_Won = winners[sf2.id] === sf2.home || winners[sf2.id] === sf2.away

  const qf1_Won = winners[bracket.qf[0].id] === bracket.qf[0].home || winners[bracket.qf[0].id] === bracket.qf[0].away
  const qf2_Won = winners[bracket.qf[1].id] === bracket.qf[1].home || winners[bracket.qf[1].id] === bracket.qf[1].away
  const qf3_Won = winners[bracket.qf[2].id] === bracket.qf[2].home || winners[bracket.qf[2].id] === bracket.qf[2].away
  const qf4_Won = winners[bracket.qf[3].id] === bracket.qf[3].home || winners[bracket.qf[3].id] === bracket.qf[3].away

  return (
    <div className="space-y-4">
      {/* Cabeçalho explicativo e legenda */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/30 pb-3 select-none">
        <p className="text-xs text-muted-foreground">
          {disabled 
            ? 'Visualize a estrutura do chaveamento. Ele ficará ativo para simular após preencher os grupos.' 
            : 'Clique em uma seleção para avançá-la para a próxima fase eliminatória.'}
        </p>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <div className="h-0.5 w-4 bg-border/40" />
            <span className="text-muted-foreground">Conexão</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-0.5 w-4 bg-success" />
            <span className="text-success">Caminho Ativo</span>
          </div>
        </div>
      </div>

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
              <div className="w-6" /> {/* connector */}
              <div className="text-center w-36 sm:w-40 text-primary">Oitavas de final</div>
              <div className="w-6" /> {/* connector */}
              <div className="text-center w-36 sm:w-40 text-primary">Quartas de final</div>
            </div>
            
            <div className="w-6" /> {/* connector */}
            <div className="text-center w-36 sm:w-40 font-extrabold text-primary">Semifinal</div>
            <div className="w-6" /> {/* connector */}
            
            {/* Centro Header */}
            <div className="text-center w-[192px] sm:w-[208px] font-black text-foreground/80">Final e 3º Lugar</div>
            
            <div className="w-6" /> {/* connector */}
            <div className="text-center w-36 sm:w-40 font-extrabold text-primary">Semifinal</div>
            <div className="w-6" /> {/* connector */}
            
            {/* Lado Direito Headers */}
            <div className="flex shrink-0 flex-row-reverse">
              <div className="text-center w-36 sm:w-40">16-avos de final</div>
              <div className="w-6" /> {/* connector */}
              <div className="text-center w-36 sm:w-40 text-primary">Oitavas de final</div>
              <div className="w-6" /> {/* connector */}
              <div className="text-center w-36 sm:w-40 text-primary">Quartas de final</div>
            </div>
          </div>

          {/* Cards do Chaveamento */}
          <div className="flex items-center justify-center gap-0 px-2 py-2">
            
            {/* ─── LADO ESQUERDO (SF 101) ─── */}
            <div className="flex items-center">
              {/* Árvore de Quartas 1 e 2 */}
              <div className="flex flex-col gap-8">
                <QFTree
                  top1={bracket.r32[1]}    // Match 74
                  bottom1={bracket.r32[4]} // Match 77
                  r16_1={bracket.r16[0]}   // Match 89
                  top2={bracket.r32[0]}    // Match 73
                  bottom2={bracket.r32[2]} // Match 75
                  r16_2={bracket.r16[1]}   // Match 90
                  qf={bracket.qf[0]}       // Match 97
                  winners={winners}
                  onPick={onPick}
                  isLeft={true}
                  disabled={disabled}
                />
                <QFTree
                  top1={bracket.r32[10]}   // Match 83
                  bottom1={bracket.r32[11]}// Match 84
                  r16_1={bracket.r16[4]}   // Match 93
                  top2={bracket.r32[8]}    // Match 81
                  bottom2={bracket.r32[9]} // Match 82
                  r16_2={bracket.r16[5]}   // Match 94
                  qf={bracket.qf[1]}       // Match 98
                  winners={winners}
                  onPick={onPick}
                  isLeft={true}
                  disabled={disabled}
                />
              </div>

              {/* Conector QF -> SF (Left) */}
              <div className="flex items-center h-[640px] shrink-0">
                <MatchConnector height={640} topWon={qf1_Won} bottomWon={qf2_Won} isLeft={true} />
              </div>

              {/* Semifinal Esquerda (SF 101) */}
              <div className="flex items-center h-[640px] shrink-0">
                <MatchCard match={sf1} winner={winners[sf1.id]} onPick={(tid) => onPick(sf1.id, tid)} disabled={disabled} />
              </div>

              {/* Linha SF 101 -> Final */}
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">Grande Final</span>
                <MatchCard match={bracket.final} winner={winners['m104']} onPick={(tid) => onPick('m104', tid)} disabled={disabled} />
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Disputa 3º Lugar</span>
                <MatchCard match={bracket.third} winner={winners['m103']} onPick={(tid) => onPick('m103', tid)} disabled={disabled} />
              </div>
            </div>

            {/* ─── LADO DIREITO (SF 102) ─── */}
            <div className="flex items-center">
              {/* Linha Final <- SF 102 */}
              <div className="flex items-center h-[640px] shrink-0">
                <svg width={24} height={640} className="shrink-0 pointer-events-none">
                  <path d="M 24 320 L 0 320" className={cn("stroke-2 transition-all", sf2_Won ? "stroke-success" : "stroke-border/30")} fill="none" />
                </svg>
              </div>

              {/* Semifinal Direita (SF 102) */}
              <div className="flex items-center h-[640px] shrink-0">
                <MatchCard match={sf2} winner={winners[sf2.id]} onPick={(tid) => onPick(sf2.id, tid)} disabled={disabled} />
              </div>

              {/* Conector SF (Right) <- QF */}
              <div className="flex items-center h-[640px] shrink-0">
                <MatchConnector height={640} topWon={qf3_Won} bottomWon={qf4_Won} isLeft={false} />
              </div>

              {/* Árvore de Quartas 3 e 4 */}
              <div className="flex flex-col gap-8">
                <QFTree
                  top1={bracket.r32[3]}    // Match 76
                  bottom1={bracket.r32[5]} // Match 78
                  r16_1={bracket.r16[2]}   // Match 91
                  top2={bracket.r32[6]}    // Match 79
                  bottom2={bracket.r32[7]} // Match 80
                  r16_2={bracket.r16[3]}   // Match 92
                  qf={bracket.qf[2]}       // Match 99
                  winners={winners}
                  onPick={onPick}
                  isLeft={false}
                  disabled={disabled}
                />
                <QFTree
                  top1={bracket.r32[13]}   // Match 86
                  bottom1={bracket.r32[15]}// Match 88
                  r16_1={bracket.r16[6]}   // Match 95
                  top2={bracket.r32[12]}   // Match 85
                  bottom2={bracket.r32[14]}// Match 87
                  r16_2={bracket.r16[7]}   // Match 96
                  qf={bracket.qf[3]}       // Match 100
                  winners={winners}
                  onPick={onPick}
                  isLeft={false}
                  disabled={disabled}
                />
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
