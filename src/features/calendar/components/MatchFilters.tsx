import { GROUPS } from '@/core/api/mock/standings'
import { cn } from '@/lib/utils'

const PHASES = [
  { value: 'GROUP_STAGE', label: 'Grupos' },
  { value: 'ROUND_OF_32', label: '16-avos' },
  { value: 'ROUND_OF_16', label: 'Oitavas' },
  { value: 'QUARTER_FINALS', label: 'Quartas' },
  { value: 'SEMI_FINALS', label: 'Semis' },
  { value: 'THIRD_PLACE', label: '3º Lugar' },
  { value: 'FINAL', label: 'Final' },
]

interface MatchFiltersProps {
  selectedGroup: string | null
  onGroupChange: (group: string | null) => void
  selectedPhase: string | null
  onPhaseChange: (phase: string | null) => void
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-7 rounded-lg px-3 text-xs font-medium transition-all duration-150',
        active
          ? 'gradient-primary text-white shadow-sm'
          : 'border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

export function MatchFilters({
  selectedGroup,
  onGroupChange,
  selectedPhase,
  onPhaseChange,
}: MatchFiltersProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fase</p>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={selectedPhase === null} onClick={() => onPhaseChange(null)}>
            Todas
          </FilterChip>
          {PHASES.map((p) => (
            <FilterChip
              key={p.value}
              active={selectedPhase === p.value}
              onClick={() => onPhaseChange(p.value)}
            >
              {p.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grupo</p>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={selectedGroup === null} onClick={() => onGroupChange(null)}>
            Todos
          </FilterChip>
          {GROUPS.map((g) => (
            <FilterChip
              key={g}
              active={selectedGroup === g}
              onClick={() => onGroupChange(g)}
            >
              {g}
            </FilterChip>
          ))}
        </div>
      </div>
    </div>
  )
}
