import { BracketView } from '../components/BracketView'

export default function BracketPage() {
  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-5 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Copa do Mundo 2026</p>
          <h1 className="mt-0.5 text-2xl font-black tracking-tight sm:text-3xl">Chaveamento</h1>
          <p className="mt-1 text-sm text-white/70">Fase eliminatória · 16-avos de final até a Grande Final</p>
        </div>
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/5" />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-10 select-none">
          🏆
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">
            O chaveamento é preenchido dinamicamente com base nos resultados reais da fase de grupos.
            Use o <strong className="text-foreground">Simulador</strong> para projetar seus próprios cruzamentos.
          </p>
        </div>
        <div className="p-4">
          <BracketView />
        </div>
      </div>
    </div>
  )
}
