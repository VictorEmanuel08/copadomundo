import type { Standing } from '@/core/api/types'
import { TeamFlag } from '@/shared/components/TeamFlag'
import { cn } from '@/lib/utils'

interface GroupTableProps {
  group: string
  standings: Standing[]
  qualifiedThirds?: Set<string>   // ids dos 8 terceiros classificados
}

export function GroupTable({ group, standings, qualifiedThirds }: GroupTableProps) {
  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff
    return b.goalsFor - a.goalsFor
  })

  // 3º colocado deste grupo que se classificou (entre os 8 melhores terceiros).
  const thirdQualified = !!qualifiedThirds && sorted.length > 2 && qualifiedThirds.has(sorted[2].team.id)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-transparent px-4 py-2.5">
        <h3 className="font-bold text-primary">Grupo {group}</h3>
        <span className="text-xs text-muted-foreground">{sorted.length} seleções</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2 text-left font-semibold">#</th>
              <th className="px-4 py-2 text-left font-semibold">Seleção</th>
              <th className="px-2 py-2 text-center font-semibold">P</th>
              <th className="px-2 py-2 text-center font-semibold">J</th>
              <th className="px-2 py-2 text-center font-semibold">V</th>
              <th className="px-2 py-2 text-center font-semibold">E</th>
              <th className="px-2 py-2 text-center font-semibold">D</th>
              <th className="px-2 py-2 text-center font-semibold">GP</th>
              <th className="px-2 py-2 text-center font-semibold">GC</th>
              <th className="px-2 py-2 text-center font-semibold">SG</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const isTop2 = i < 2
              const isThirdQ = i === 2 && thirdQualified
              return (
              <tr
                key={s.team.id}
                className={cn(
                  'border-b border-border/40 last:border-0 transition-colors hover:bg-muted/20',
                  isTop2 && 'border-l-[3px] border-l-primary',
                  isThirdQ && 'border-l-[3px] border-l-amber-500 bg-amber-500/[0.04]',
                )}
              >
                <td className="px-4 py-2.5">
                  <span className={cn(
                    'text-xs font-bold',
                    isTop2 ? 'text-primary' : isThirdQ ? 'text-amber-500' : 'text-muted-foreground',
                  )}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <TeamFlag code={s.team.code} name={s.team.name} size={18} />
                    <span className="hidden font-medium sm:inline">{s.team.name}</span>
                    <span className="font-medium sm:hidden">{s.team.shortName}</span>
                    {isThirdQ && (
                      <span className="ml-1 shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                        3º classificado
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2.5 text-center text-sm font-black text-primary">{s.points}</td>
                <td className="px-2 py-2.5 text-center text-muted-foreground">{s.played}</td>
                <td className="px-2 py-2.5 text-center">{s.won}</td>
                <td className="px-2 py-2.5 text-center">{s.drawn}</td>
                <td className="px-2 py-2.5 text-center">{s.lost}</td>
                <td className="px-2 py-2.5 text-center">{s.goalsFor}</td>
                <td className="px-2 py-2.5 text-center">{s.goalsAgainst}</td>
                <td
                  className={cn(
                    'px-2 py-2.5 text-center text-xs font-semibold',
                    s.goalDiff > 0 ? 'text-success' : s.goalDiff < 0 ? 'text-destructive' : 'text-muted-foreground',
                  )}
                >
                  {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 rounded-full bg-primary" />
          Classificados para oitavas
        </span>
        {thirdQualified && (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-0.5 rounded-full bg-amber-500" />
            3º melhor — classificado
          </span>
        )}
      </div>
    </div>
  )
}
