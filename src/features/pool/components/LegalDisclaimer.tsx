import { Info } from 'lucide-react'

export function LegalDisclaimer() {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
      <Info size={14} className="mt-0.5 shrink-0" />
      <p>
        A plataforma <strong>não realiza apostas</strong>, não arrecada valores e não controla pagamentos.
        Qualquer acordo financeiro entre participantes é de responsabilidade exclusiva deles.
      </p>
    </div>
  )
}
