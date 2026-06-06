import { Heart } from 'lucide-react'
import { TEAMS, GROUPS } from '@/core/api/mock/teams'
import { TeamFlag } from '@/shared/components/TeamFlag'
import { useFavorites } from '../hooks/useFavorites'
import { cn } from '@/lib/utils'

export function TeamSelector() {
  const { favoriteIds, toggleFavorite } = useFavorites()

  return (
    <div className="space-y-6">
      {GROUPS.map((group) => {
        const teams = TEAMS.filter((t) => t.group === group)
        return (
          <div key={group} className="space-y-2">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/30 pb-1">
              Grupo {group}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {teams.map((team) => {
                const isFav = favoriteIds.includes(team.id)
                return (
                  <button
                    key={team.id}
                    onClick={() => toggleFavorite(team.id)}
                    className={cn(
                      'group relative flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all duration-150',
                      isFav
                        ? 'border-primary/45 bg-primary/8 shadow-sm shadow-primary/8 font-bold'
                        : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50',
                    )}
                  >
                    <TeamFlag code={team.code} name={team.name} size={22} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold leading-tight">{team.name}</p>
                      <p className="text-[9px] text-muted-foreground font-mono">{team.code.toUpperCase()}</p>
                    </div>
                    <Heart
                      size={13}
                      className={cn(
                        'shrink-0 transition-all',
                        isFav ? 'fill-primary text-primary scale-110' : 'text-muted-foreground/35 group-hover:text-muted-foreground/75',
                      )}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
