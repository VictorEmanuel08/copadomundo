import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Lock, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { LegalDisclaimer } from '../components/LegalDisclaimer'
import { useLeague } from '../hooks/useLeague'
import { useAuthStore } from '@/features/auth/store/authStore'
import { signInWithGoogle } from '@/core/firebase/auth'

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold">{label}</label>
      {children}
    </div>
  )
}

function NumberInput({
  value,
  onChange,
  min = 0,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-20 rounded-lg border border-border bg-card px-3 py-1.5 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring"
    />
  )
}

export default function CreateLeaguePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { createLeague, loading } = useLeague()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [scoring, setScoring] = useState({ winner: 3, draw: 1, exactScore: 5 })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      const id = await createLeague({ name, description, scoring })
      toast.success('Liga criada! 🎉', { description: `"${name}" está pronta. Convide seus amigos!` })
      navigate(`/pool/league/${id}`)
    } catch {
      toast.error('Erro ao criar liga', { description: 'Verifique sua conexão e tente novamente.' })
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 text-center flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Lock size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black">Login Necessário</h1>
          <p className="text-sm text-muted-foreground max-w-[340px] mx-auto">
            Você precisa estar logado para acessar a criação de ligas do Bolão.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-[280px]">
          <Button onClick={signInWithGoogle} className="gap-2 w-full font-bold">
            <LogIn size={14} />
            Fazer login com Google
          </Button>
          <Button variant="outline" onClick={() => navigate('/pool')} className="w-full">
            Voltar para o Bolão
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/pool')}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="text-xl font-black">Criar Liga Privada</h1>
          <p className="text-xs text-muted-foreground">Configure sua liga e convide amigos</p>
        </div>
      </div>

      <LegalDisclaimer />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Identidade</h2>

          <Field label="Nome da liga *">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Liga dos Amigos"
              maxLength={40}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>

          <Field label="Descrição">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma descrição breve..."
              rows={2}
              maxLength={120}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Pontuação</h2>
          <p className="text-xs text-muted-foreground">Defina quantos pontos cada tipo de acerto vale.</p>

          <div className="space-y-3">
            {[
              { key: 'winner', label: 'Acertou o vencedor' },
              { key: 'draw', label: 'Acertou o empate' },
              { key: 'exactScore', label: 'Acertou o placar exato' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <span className="text-sm">{label}</span>
                <div className="flex items-center gap-2">
                  <NumberInput
                    value={scoring[key as keyof typeof scoring]}
                    onChange={(v) => setScoring((s) => ({ ...s, [key]: v }))}
                  />
                  <span className="text-xs text-muted-foreground">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
          {loading && <Loader2 size={14} className="mr-1.5 animate-spin" />}
          Criar Liga
        </Button>
      </form>
    </div>
  )
}
