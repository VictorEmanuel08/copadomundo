import { NavLink } from 'react-router-dom'
import { BarChart2, Calendar, GitMerge, Heart, Trophy, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Agenda', icon: Calendar },
  { to: '/standings', label: 'Grupos', icon: BarChart2 },
  { to: '/bracket', label: 'Chave', icon: GitMerge },
  { to: '/simulador', label: 'Simular', icon: Wand2 },
  { to: '/pool', label: 'Bolão', icon: Trophy },
  { to: '/my-team', label: 'Seleção', icon: Heart },
]

export function BottomNav() {
  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 md:hidden">
      <div className="flex h-16 items-stretch">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex flex-1 flex-col items-center justify-center gap-0.5"
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'flex h-7 w-10 items-center justify-center rounded-xl transition-all duration-200',
                    isActive ? 'gradient-primary shadow-sm' : '',
                  )}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 1.75}
                    className={isActive ? 'text-white' : 'text-muted-foreground'}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium leading-none transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      {/* Safe area for iPhone */}
      <div className="h-safe-bottom" />
    </nav>
  )
}
