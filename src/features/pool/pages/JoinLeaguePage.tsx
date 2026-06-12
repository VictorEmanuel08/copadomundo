import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Link2, Loader2, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLeague } from '../hooks/useLeague'
import { useAuthStore } from '@/features/auth/store/authStore'
import { signInWithGoogle } from '@/core/firebase/auth'
import { toast } from 'sonner'

export default function JoinLeaguePage() {
  const navigate = useNavigate()
  const { inviteCode: codeFromUrl } = useParams<{ inviteCode?: string }>()
  const { joinLeague, loading, error } = useLeague()
  const { user, loading: authLoading } = useAuthStore()
  const [code, setCode] = useState(codeFromUrl ?? '')
  const [signingIn, setSigningIn] = useState(false)

  // Auto-join quando usuário loga vindo de um link de convite
  useEffect(() => {
    if (user && codeFromUrl && !loading) {
      joinLeague(codeFromUrl).then((leagueId) => {
        toast.success('Você entrou na liga! 🎉', { description: 'Boa sorte nos palpites!' })
        navigate(`/pool/league/${leagueId}`)
      }).catch(() => {/* error handled by hook */})
    }
  // Só executa quando o user acabou de logar (codeFromUrl não muda)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function handleSignIn() {
    setSigningIn(true)
    try {
      await signInWithGoogle()
      // o useEffect acima vai cuidar do join automático
    } catch {
      toast.error('Erro ao fazer login', { description: 'Tente novamente.' })
    } finally {
      setSigningIn(false)
    }
  }

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

  if (authLoading) return null

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

      {/* Visitante: mostrar login antes de entrar */}
      {!user ? (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
            <Link2 size={24} className="text-primary" />
          </div>
          {codeFromUrl && (
            <div className="rounded-xl bg-muted/50 border border-border px-4 py-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Código de convite</p>
              <p className="text-xl font-black tracking-widest font-mono">{codeFromUrl.toUpperCase()}</p>
            </div>
          )}
          <div>
            <p className="font-bold text-sm">Faça login para entrar na liga</p>
            <p className="text-xs text-muted-foreground mt-1">
              Após o login você será adicionado automaticamente.
            </p>
          </div>
          <Button className="w-full font-bold gap-2" onClick={handleSignIn} disabled={signingIn}>
            {signingIn ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
            Entrar com Google
          </Button>
        </div>
      ) : (
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
      )}

      <p className="text-center text-xs text-muted-foreground">
        Peça ao administrador da liga para compartilhar o código de 8 caracteres.
      </p>
    </div>
  )
}
