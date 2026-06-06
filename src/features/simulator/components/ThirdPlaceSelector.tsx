import { useMemo } from 'react'
import { TeamFlag } from '@/shared/components/TeamFlag'
import { TEAMS } from '@/core/api/mock/teams'
import type { GroupResult, GroupLetter } from '../world-cup-bracket/types'
import { ALL_GROUPS } from '../world-cup-bracket/types'
import { cn } from '@/lib/utils'
import { Check, Sparkles } from 'lucide-react'

interface ThirdPlaceSelectorProps {
  groups:   Record<GroupLetter, GroupResult>
  selected: string[]           // teamIds dos 8 terceiros selecionados
  onChange: (selected: string[]) => void
}

const MAX = 8

export function ThirdPlaceSelector({ groups, selected, onChange }: ThirdPlaceSelectorProps) {
  // Coletar todos os 3º colocados atualmente definidos nos grupos
  const allThirds = ALL_GROUPS
    .map(g => {
      const id = groups[g]?.third
      if (!id) return null
      const team = TEAMS.find(t => t.id === id)
      if (!team) return null
      return { group: g, team }
    })
    .filter(Boolean) as { group: GroupLetter; team: typeof TEAMS[0] }[]

  const completedGroupsCount = ALL_GROUPS.filter(g => 
    groups[g]?.first && groups[g]?.second && groups[g]?.third
  ).length

  const allGroupsDone = completedGroupsCount === ALL_GROUPS.length
  const isMaxed = selected.length >= MAX

  function toggle(teamId: string) {
    if (!allGroupsDone) return // Apenas permite interações se todos os grupos estiverem prontos
    
    if (selected.includes(teamId)) {
      onChange(selected.filter(id => id !== teamId))
    } else if (!isMaxed) {
      onChange([...selected, teamId])
    }
  }

  // Seleciona automaticamente os primeiros 8 terceiros colocados disponíveis
  function handleAutoSelect() {
    if (!allGroupsDone) return
    const first8 = allThirds.slice(0, MAX).map(t => t.team.id)
    onChange(first8)
  }

  function handleClear() {
    onChange([])
  }

  // Mapear os 3º colocados selecionados em detalhes para exibição no resumo
  const selectedThirdsDetails = useMemo(() => {
    return selected.map(id => {
      const entry = allThirds.find(t => t.team.id === id)
      return entry ?? null
    }).filter(Boolean) as { group: GroupLetter; team: typeof TEAMS[0] }[]
  }, [selected, allThirds])

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/30 pb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Melhores Terceiros Colocados</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {allThirds.length} de 12 terceiros definidos nos grupos · selecione os {MAX} classificados.
          </p>
        </div>

        {allGroupsDone && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAutoSelect}
              className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/15 active:scale-95 transition-all"
            >
              <Sparkles size={11} />
              Auto-Selecionar
            </button>
            {selected.length > 0 && (
              <button
                onClick={handleClear}
                className="bg-muted hover:bg-muted-foreground/10 border border-border/40 text-muted-foreground text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
              >
                Limpar
              </button>
            )}
            <div className={cn(
              'flex h-7 px-3.5 items-center justify-center rounded-lg text-xs font-black border',
              isMaxed 
                ? 'bg-success/15 border-success/20 text-success' 
                : 'bg-primary/5 border-primary/10 text-primary',
            )}>
              {selected.length} / {MAX}
            </div>
          </div>
        )}
      </div>

      {/* Resumo Visual dos 8 Classificados (Chips com Origem de Grupo) */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
          Chaveamento de Terceiros Classificados
        </span>
        <div className="grid grid-cols-4 gap-2 md:flex md:flex-wrap md:items-center">
          {Array.from({ length: MAX }).map((_, i) => {
            const item = selectedThirdsDetails[i]
            return item ? (
              <div 
                key={item.team.id}
                className="flex items-center gap-1.5 border border-success/30 bg-success/5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-success animate-scale-in shrink-0 md:min-w-[110px]"
              >
                <TeamFlag code={item.team.code} name={item.team.name} size={14} />
                <span className="truncate flex-1 text-[11px]">{item.team.shortName}</span>
                <span className="text-[9px] bg-success/20 px-1 py-0.5 rounded text-success">
                  3º {item.group}
                </span>
              </div>
            ) : (
              <div 
                key={i}
                className="flex items-center justify-center border border-dashed border-border/50 bg-muted/5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-muted-foreground/40 shrink-0 md:min-w-[110px] h-[29px]"
              >
                Vago {i + 1}
              </div>
            )
          })}
        </div>
      </div>

      {/* Banner de Status dos Grupos */}
      {!allGroupsDone && (
        <div className="rounded-xl border border-dashed border-border bg-muted/15 p-4 text-center">
          <p className="text-xs text-muted-foreground font-medium">
            Classifique a fase de grupos para liberar a seleção dos melhores terceiros.
            <span className="font-extrabold text-foreground block mt-1.5">
              {completedGroupsCount} de 12 grupos concluídos (Faltam {12 - completedGroupsCount})
            </span>
          </p>
        </div>
      )}

      {/* Grid de Seleção de Terceiros */}
      {allThirds.length > 0 && (
        <div className="relative">
          <div className={cn(
            "grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 transition-opacity duration-200",
            !allGroupsDone && "opacity-40 pointer-events-none"
          )}>
            {allThirds.map(({ group, team }) => {
              const isSelected = selected.includes(team.id)
              const isDisabled = !isSelected && isMaxed && allGroupsDone

              return (
                <button
                  key={team.id}
                  onClick={() => toggle(team.id)}
                  disabled={isDisabled || !allGroupsDone}
                  className={cn(
                    'relative flex flex-col items-center gap-2 rounded-xl border p-2.5 text-center transition-all',
                    isSelected
                      ? 'border-success bg-success/5 font-bold shadow-sm'
                      : isDisabled
                      ? 'cursor-not-allowed border-border/30 bg-muted/10 opacity-30'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-primary/5 active:scale-95 cursor-pointer',
                  )}
                >
                  {/* Badge de Selecionado */}
                  {isSelected && (
                    <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-success">
                      <Check size={8} className="text-white stroke-[3px]" />
                    </div>
                  )}

                  <TeamFlag code={team.code} name={team.name} size={24} />
                  
                  <div className="min-w-0 w-full">
                    <p className="text-[10px] font-extrabold leading-tight truncate text-foreground">
                      {team.name}
                    </p>
                    <p className="text-[8px] text-muted-foreground tracking-tight mt-0.5">
                      3º {group}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
