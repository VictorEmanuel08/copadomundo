import { useRef, useState, useEffect } from 'react'
import { Copy, Check, Pipette } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Paleta de cores (por família) ──────────────────────────────────────
const SWATCHES = [
  // Vermelhos / Laranjas
  '#7F1D1D', '#DC2626', '#F97316', '#FB923C',
  // Amarelos / Dourado
  '#CA8A04', '#EAB308', '#FDE68A', '#F59E0B',
  // Verdes
  '#14532D', '#16A34A', '#22C55E', '#065F46',
  // Azuis
  '#1E3A8A', '#1D4ED8', '#3B82F6', '#38BDF8',
  // Roxos / Rosas
  '#4C1D95', '#7C3AED', '#EC4899', '#9F1239',
  // Neutros
  '#000000', '#1E293B', '#475569', '#94A3B8',
  '#CBD5E1', '#E2E8F0', '#F8FAFC', '#FFFFFF',
]

function isValidHex(h: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(h)
}

interface ColorPickerProps {
  label: string
  value: string
  onChange: (v: string) => void
  compact?: boolean
}

export function ColorPicker({ label, value, onChange, compact = false }: ColorPickerProps) {
  const nativeRef = useRef<HTMLInputElement>(null)
  const [hex, setHex] = useState(value.replace('#', '').toUpperCase())
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  // Keep hex in sync if parent changes value
  useEffect(() => {
    setHex(value.replace('#', '').toUpperCase())
  }, [value])

  function applyColor(raw: string) {
    const cleaned = raw.startsWith('#') ? raw : '#' + raw
    if (isValidHex(cleaned)) {
      onChange(cleaned)
    }
  }

  function handleHexInput(raw: string) {
    const clean = raw.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0, 6)
    setHex(clean)
    if (clean.length === 6) applyColor('#' + clean)
  }

  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-1.5 relative">
      <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">{label}</label>

      {/* Main row */}
      <div className="flex items-center gap-2">
        {/* Color swatch (click to open native picker) */}
        <button
          type="button"
          onClick={() => nativeRef.current?.click()}
          title="Abrir seletor de cor"
          className="h-9 w-9 shrink-0 rounded-xl border-2 border-white/15 shadow-md ring-1 ring-border cursor-pointer hover:scale-105 transition-transform"
          style={{ background: value }}
        />
        <input
          ref={nativeRef}
          type="color"
          value={value}
          onChange={(e) => { applyColor(e.target.value); setHex(e.target.value.replace('#', '').toUpperCase()) }}
          className="sr-only"
        />

        {/* Hex input */}
        <div className="flex flex-1 items-center gap-1 rounded-xl border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all">
          <span className="text-xs font-mono text-muted-foreground select-none">#</span>
          <input
            value={hex}
            onChange={(e) => handleHexInput(e.target.value)}
            onBlur={() => { if (hex.length < 6) setHex(value.replace('#','').toUpperCase()) }}
            maxLength={6}
            className="flex-1 bg-transparent text-sm font-mono font-bold focus:outline-none uppercase tracking-wider w-0"
            placeholder="000000"
          />
        </div>

        {/* Copy */}
        <button
          type="button"
          onClick={handleCopy}
          title="Copiar cor"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
        </button>

        {/* Expand swatches toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          title="Ver paleta"
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all',
            open ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted',
          )}
        >
          <Pipette size={13} />
        </button>
      </div>

      {/* Swatches grid */}
      {open && (
        <div className="rounded-2xl border border-border bg-card p-3 shadow-xl space-y-2 z-10 relative">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Paleta</p>
          <div className="grid grid-cols-8 gap-1.5">
            {SWATCHES.map((s) => (
              <button
                key={s}
                type="button"
                title={s}
                onClick={() => { applyColor(s); setHex(s.replace('#','').toUpperCase()); setOpen(false) }}
                className={cn(
                  'h-7 w-7 rounded-lg border transition-all hover:scale-110 active:scale-95',
                  value.toLowerCase() === s.toLowerCase()
                    ? 'border-primary ring-2 ring-primary scale-110'
                    : 'border-border/50 hover:border-primary/60',
                  s === '#FFFFFF' && 'shadow-sm',
                )}
                style={{ background: s }}
              />
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground/60">Ou use o seletor de cor (ícone esquerdo) para cor personalizada.</p>
        </div>
      )}
    </div>
  )
}
