import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Link2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLeague } from '../hooks/useLeague'
import { toast } from 'sonner'

export default function JoinLeaguePage() {
  const navigate = useNavigate()
  const { inviteCode: codeFromUrl } = useParams<{ inviteCode?: string }>()
  const { joinLeague, loading, error } = useLeague()
  const [code, setCode] = useState(codeFromUrl ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    try {
      const leagueId = await joinLeague(code.trim())
      toast.success('Você entrou na liga! 🎉', { description: 'Boa sorte nos palpites!' })
      navigate(`/pool/league/${leagueId}`)
    } catch {
      // error already handled by hook state
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/pool')}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="text-xl font-black">Entrar em Liga</h1>
          <p className="text-xs text-muted-foreground">Cole o código de convite do seu amigo</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 mx-auto">
          <Link2 size={24} className="text-success" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Código de convite</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: ABC1XY2Z"
              maxLength={12}
              autoFocus
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center text-lg font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive text-center font-medium rounded-lg bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full font-bold"
            disabled={loading || code.trim().length < 6}
          >
            {loading ? (
              <><Loader2 size={14} className="mr-1.5 animate-spin" /> Entrando...</>
            ) : (
              'Entrar na liga'
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Peça ao administrador da liga para compartilhar o código de 8 caracteres.
      </p>
    </div>
  )
}
