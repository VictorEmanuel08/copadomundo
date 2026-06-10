import { useState, useMemo } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TeamFlag } from '@/shared/components/TeamFlag'
import { TEAMS } from '@/core/api/mock/teams'
import { cn } from '@/lib/utils'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

interface Props {
  selected: string[]
  onChange: (ids: string[]) => void
}

export function TeamMultiSelect({ selected, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return TEAMS
    return TEAMS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.shortName.toLowerCase().includes(q) ||
        t.group.toLowerCase().includes(q),
    )
  }, [search])

  const byGroup = useMemo(() => {
    const map = new Map<string, typeof TEAMS>()
    for (const t of filtered) {
      if (!map.has(t.group)) map.set(t.group, [])
      map.get(t.group)!.push(t)
    }
    return map
  }, [filtered])

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  const label =
    selected.length === 0
      ? 'Todas as seleções'
      : selected.length === 1
        ? TEAMS.find((t) => t.id === selected[0])?.name ?? '1 seleção'
        : `${selected.length} seleções`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-all',
            selected.length > 0
              ? 'border-primary/50 bg-primary/10 text-primary'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
          )}
        >
          <Search size={11} className="shrink-0" />
          <span className="max-w-[160px] truncate">{label}</span>
          {selected.length > 0 && (
            <span
              role="button"
              tabIndex={0}
              className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 hover:bg-primary/40 transition-colors cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onChange([]) }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange([]) } }}
            >
              <X size={9} className="text-primary" />
            </span>
          )}
          <ChevronDown size={11} className={cn('ml-auto shrink-0 transition-transform', open && 'rotate-180')} />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-72 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search size={13} className="shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar seleção..."
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={11} className="text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {selected.length > 0 && (
          <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
            <span className="text-[11px] text-muted-foreground">{selected.length} selecionada(s)</span>
            <button
              onClick={() => onChange([])}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Limpar
            </button>
          </div>
        )}

        <ScrollArea className="h-64">
          <div className="py-1">
            {byGroup.size === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Nenhum resultado</p>
            ) : (
              GROUPS.filter((g) => byGroup.has(g)).map((g) => (
                <div key={g}>
                  <p className="px-3 pt-2 pb-0.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                    Grupo {g}
                  </p>
                  {byGroup.get(g)!.map((team) => {
                    const checked = selected.includes(team.id)
                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => toggle(team.id)}
                        className={cn(
                          'flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent',
                          checked && 'bg-primary/8',
                        )}
                      >
                        <TeamFlag code={team.code} name={team.name} size={18} />
                        <span className={cn('flex-1 font-medium', checked && 'text-primary font-semibold')}>
                          {team.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">{team.shortName}</span>
                        <div
                          className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all',
                            checked ? 'border-primary bg-primary text-white' : 'border-border',
                          )}
                        >
                          {checked && <Check size={10} strokeWidth={3} />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
