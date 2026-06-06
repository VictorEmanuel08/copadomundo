import { TeamFlag } from '@/shared/components/TeamFlag'
import { TEAMS } from '@/core/api/mock/teams'
import type { GroupResult, GroupLetter } from '../world-cup-bracket/types'
import { cn } from '@/lib/utils'

interface GroupSelectorProps {
  group:    GroupLetter
  result:   GroupResult
  onChange: (result: GroupResult) => void
}

export function GroupSelector({ group, result, onChange }: GroupSelectorProps) {
  const teams = TEAMS.filter(t => t.group === group)

  // Determinar qual posição cada time ocupa
  const getTeamPosition = (teamId: string): 'first' | 'second' | 'third' | 'fourth' | null => {
    if (result.first === teamId) return 'first'
    if (result.second === teamId) return 'second'
    if (result.third === teamId) return 'third'
    
    // Se o grupo estiver completo (1º, 2º e 3º definidos), o time restante é o 4º
    const isComplete = result.first && result.second && result.third
    if (isComplete) {
      const isUnplaced = teamId !== result.first && teamId !== result.second && teamId !== result.third
      if (isUnplaced) return 'fourth'
    }
    return null
  }

  // Manipular clique nos chips de posição (1º, 2º, 3º)
  const handleRankClick = (pos: 'first' | 'second' | 'third', teamId: string) => {
    const next = { ...result }

    // Se este time já estava em outra posição, remove de lá
    if (next.first === teamId) next.first = null
    if (next.second === teamId) next.second = null
    if (next.third === teamId) next.third = null

    // Se clicou no chip já ativo -> desmarca (toggle)
    if (result[pos] === teamId) {
      next[pos] = null
    } else {
      // Se outro time já ocupava essa posição, limpa a posição dele
      next[pos] = teamId
    }

    onChange(next)
  }

  const handleClearGroup = () => {
    onChange({ first: null, second: null, third: null })
  }

  const isDone = !!(result.first && result.second && result.third)
  const hasSelections = !!(result.first || result.second || result.third)

  return (
    <div className={cn(
      'overflow-hidden rounded-2xl border bg-card transition-all duration-200',
      isDone 
        ? 'border-success/35 dark:border-success/20 bg-success/[0.01]' 
        : 'border-border/60 hover:border-border/80',
    )}>
      <div className={cn(
        'flex items-center justify-between px-4 py-2.5 border-b text-xs font-bold uppercase tracking-wider select-none',
        isDone 
          ? 'border-success/20 bg-success/5 text-success' 
          : 'border-border/30 bg-muted/10 text-foreground/80',
      )}>
        <span>Grupo {group}</span>
        <div className="flex items-center gap-2">
          {hasSelections && (
            <button
              onClick={handleClearGroup}
              className="text-[10px] text-muted-foreground hover:text-foreground font-bold tracking-tight lowercase transition-colors"
            >
              Limpar
            </button>
          )}
          {isDone && (
            <span className="text-[9px] bg-success text-success-foreground px-2 py-0.5 rounded-md font-extrabold">
              Pronto
            </span>
          )}
        </div>
      </div>

      {/* Tabela de Classificação */}
      <div className="divide-y divide-border/30">
        {teams.map(team => {
          const position = getTeamPosition(team.id)
          const isEliminated = position === 'fourth'
          const isSelected = position && position !== 'fourth'

          return (
            <div 
              key={team.id} 
              className={cn(
                'flex items-center justify-between px-3 py-2 transition-all',
                isEliminated && 'opacity-40 bg-muted/5',
                position === 'first' && 'bg-amber-500/[0.02]',
                position === 'second' && 'bg-blue-500/[0.02]',
                position === 'third' && 'bg-orange-500/[0.02]',
              )}
            >
              {/* Seleção (Posição + Bandeira + Nome) */}
              <div className="flex items-center gap-2 min-w-0">
                {/* Indicador de Posição Sólido e Numérico (Sem medalhas) */}
                <div className={cn(
                  'flex items-center justify-center w-7 h-5 rounded text-[10px] font-black shrink-0 border select-none',
                  position === 'first' && 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
                  position === 'second' && 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400',
                  position === 'third' && 'border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400',
                  position === 'fourth' && 'border-border/40 bg-muted/40 text-muted-foreground/60',
                  !position && 'border-transparent text-muted-foreground/30 font-normal',
                )}>
                  {position === 'first' && '1º'}
                  {position === 'second' && '2º'}
                  {position === 'third' && '3º'}
                  {position === 'fourth' && '4º'}
                  {!position && '—'}
                </div>

                <TeamFlag code={team.code} name={team.name} size={18} />
                <span className={cn(
                  'text-xs font-semibold truncate select-none',
                  isSelected && 'font-extrabold text-foreground',
                  isEliminated && 'text-muted-foreground/80 line-through',
                )}>
                  {team.name}
                </span>
              </div>

              {/* Seletor de Chips de Posição (1º, 2º, 3º) */}
              <div className="flex items-center gap-1 shrink-0 ml-3">
                {([
                  { key: 'first', label: '1º', activeClass: 'bg-amber-500 text-white dark:text-amber-950 border-amber-500' },
                  { key: 'second', label: '2º', activeClass: 'bg-blue-500 text-white dark:text-blue-950 border-blue-500' },
                  { key: 'third', label: '3º', activeClass: 'bg-orange-500 text-white dark:text-orange-950 border-orange-500' },
                ] as const).map(chip => {
                  const isActive = result[chip.key] === team.id
                  return (
                    <button
                      key={chip.key}
                      onClick={() => handleRankClick(chip.key, team.id)}
                      disabled={isEliminated}
                      className={cn(
                        'flex h-6 w-8 items-center justify-center rounded-lg border text-[10px] font-extrabold transition-all select-none',
                        isActive
                          ? chip.activeClass
                          : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted hover:border-border/80 hover:text-foreground active:scale-90',
                        isEliminated && 'opacity-30 cursor-not-allowed',
                      )}
                    >
                      {chip.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
