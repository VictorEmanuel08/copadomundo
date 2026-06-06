import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScoreInputProps {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function ScoreInput({ value, onChange, disabled = false, size = 'md' }: ScoreInputProps) {
  const isSmall = size === 'sm'

  const btnBase = cn(
    'flex items-center justify-center rounded-full border font-bold transition-all duration-150 select-none',
    isSmall ? 'h-7 w-7' : 'h-9 w-9',
    disabled
      ? 'border-border/20 bg-transparent text-muted-foreground/20 cursor-not-allowed'
      : 'border-border bg-muted/50 text-muted-foreground hover:border-primary/60 hover:bg-primary/10 hover:text-primary active:scale-90 cursor-pointer',
  )

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => { if (!disabled && value > 0) onChange(value - 1) }}
        disabled={disabled || value <= 0}
        className={btnBase}
        aria-label="Diminuir"
      >
        <Minus size={isSmall ? 11 : 13} strokeWidth={2.5} />
      </button>

      <span
        className={cn(
          'tabular-nums font-black text-foreground leading-none text-center select-none',
          isSmall ? 'w-6 text-xl' : 'w-9 text-3xl',
        )}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => { if (!disabled) onChange(value + 1) }}
        disabled={disabled}
        className={btnBase}
        aria-label="Aumentar"
      >
        <Plus size={isSmall ? 11 : 13} strokeWidth={2.5} />
      </button>
    </div>
  )
}
