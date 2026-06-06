import { NavLink } from 'react-router-dom'
import { BarChart2, Calendar, GitMerge, Sliders, Trophy, Star, Bell, BellOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AuthButton } from '@/features/auth/components/AuthButton'
import { ThemeToggle } from '@/components/ThemeToggle'
import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications'
import { useAuthStore } from '@/features/auth/store/authStore'
import logoImg from '@/assets/logo.png'

const NAV_ITEMS = [
  { to: '/', label: 'Calendário', icon: Calendar },
  { to: '/standings', label: 'Grupos', icon: BarChart2 },
  { to: '/bracket', label: 'Chaveamento', icon: GitMerge },
  { to: '/simulator', label: 'Simulador', icon: Sliders },
  { to: '/pool', label: 'Bolão', icon: Trophy },
  { to: '/my-team', label: 'Minha Seleção', icon: Star },
]

function NotifButton() {
  const { user } = useAuthStore()
  const { permission, loading, enable, disable } = usePushNotifications()
  if (!user || permission === 'unsupported') return null
  if (permission === 'denied') return null

  return (
    <button
      onClick={permission === 'granted' ? disable : enable}
      disabled={loading}
      title={permission === 'granted' ? 'Desativar notificações' : 'Ativar notificações de jogos'}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg border transition-all',
        permission === 'granted'
          ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
          : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted',
      )}
    >
      {permission === 'granted' ? <Bell size={14} /> : <BellOff size={14} />}
    </button>
  )
}

export function Header() {
  return (
    <header className="glass sticky top-0 z-50 border-b border-border bg-background/80 block">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 lg:px-6">
        {/* Logo */}
        <NavLink to="/" className="flex shrink-0 items-center gap-2.5 font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-white shadow-sm">
            <img src={logoImg} alt="Logo" />
          </div>
          <div className="flex items-baseline gap-1 text-sm leading-none">
            <span className="font-black tracking-tight text-foreground">Copa</span>
            <span className="font-black tracking-tight text-foreground">⚽</span>
            <span className="font-black tracking-tight text-primary">2026</span>
          </div>
        </NavLink>

        {/* Nav */}
        <nav className="hidden md:flex flex-1 items-center gap-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary/12 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Ações da direita: Tema + Auth */}
        <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
          <NotifButton />
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  )
}
