import { useStandings } from '../hooks/useStandings'
import { GroupTable } from '../components/GroupTable'
import { Loader2 } from 'lucide-react'
import { GROUPS } from '@/core/api/mock/standings'

export default function StandingsPage() {
  const { data: standings, isLoading, isError } = useStandings()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    )
  }

  if (isError || !standings) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive">
        Erro ao carregar classificação.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-5 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Copa do Mundo 2026</p>
          <h1 className="mt-0.5 text-2xl font-black tracking-tight sm:text-3xl">Classificação</h1>
          <p className="mt-1 text-sm text-white/70">Fase de Grupos · {GROUPS.length} grupos · 48 seleções</p>
        </div>
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/5" />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-10 select-none">
          📊
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {GROUPS.map((group) => {
          const groupStandings = standings.filter((s) => s.group === group)
          if (!groupStandings.length) return null
          return <GroupTable key={group} group={group} standings={groupStandings} />
        })}
      </div>
    </div>
  )
}
