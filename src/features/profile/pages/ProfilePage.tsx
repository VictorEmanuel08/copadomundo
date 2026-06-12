import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '@/core/firebase/config'
import { ArrowLeft, Shield, Swords, Trophy, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { KitPreview } from '@/features/custom-team/components/KitPreview'
import { CrestPreview } from '@/features/custom-team/components/CrestPreview'
import { FormationDiagram } from '@/features/custom-team/pages/CustomTeamPage'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface CustomTeamData {
  name?: string
  acronym?: string
  formation?: string
  showOnJersey?: boolean
  playerName?: string
  playerNumber?: string
  playerNameColor?: string
  kit?: { primaryColor: string; secondaryColor: string; tertiaryColor: string; pattern: string; collar: string; numberColor: string }
  crest?: { primaryColor: string; secondaryColor: string; shape: string; pattern: string; stars: number }
}

interface UserData {
  displayName?: string
  photoURL?: string
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [ct, setCt] = useState<CustomTeamData | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    Promise.all([
      getDoc(doc(db, 'customTeams', userId)),
      getDoc(doc(db, 'users', userId)),
    ]).then(([ctSnap, userSnap]) => {
      if (ctSnap.exists()) setCt(ctSnap.data() as CustomTeamData)
      if (userSnap.exists()) setUser(userSnap.data() as UserData)
    }).finally(() => setLoading(false))
  }, [userId])

  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: ct?.name ?? 'Perfil', url })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copiado!', { description: 'Compartilhe o perfil com seus amigos.' })
    }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={28} />
    </div>
  )

  const displayName = user?.displayName ?? 'Participante'

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={15} />
        </button>
        <h1 className="text-xl font-black flex-1 truncate">Perfil</h1>
        <button onClick={handleShare}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
          <Share2 size={12} /> Compartilhar
        </button>
      </div>

      {/* Identity card */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img src={user.photoURL} className="h-14 w-14 rounded-full object-cover shrink-0 border-2 border-border" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center shrink-0 border-2 border-border">
              <span className="text-xl font-black text-primary">{displayName[0]?.toUpperCase()}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-black truncate">{displayName}</p>
            {ct?.name && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Shield size={12} /> {ct.name}
                {ct.acronym && <span className="font-mono font-bold text-foreground/80 ml-1">{ct.acronym}</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Custom team */}
      {ct ? (
        <>
          {/* Kit + Crest */}
          {(ct.kit || ct.crest) && (
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border/40 bg-muted/20">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Seleção</p>
              </div>
              <div className="flex items-center justify-center gap-10 py-6 bg-gradient-to-b from-slate-950 to-emerald-950">
                {ct.kit && (
                  <KitPreview
                    primaryColor={ct.kit.primaryColor} secondaryColor={ct.kit.secondaryColor}
                    pattern={ct.kit.pattern as any}
                    collar={ct.kit.collar as any}
                    number={ct.showOnJersey && ct.playerNumber ? ct.playerNumber : undefined}
                    playerName={ct.showOnJersey && ct.playerName ? ct.playerName : undefined}
                    playerNameColor={ct.playerNameColor}
                    size="md"
                  />
                )}
                {ct.crest && (
                  <div className="flex flex-col items-center gap-2">
                    <CrestPreview
                      primaryColor={ct.crest.primaryColor} secondaryColor={ct.crest.secondaryColor}
                      acronym={ct.acronym || '???'} shape={ct.crest.shape as any}
                      pattern={ct.crest.pattern as any} stars={ct.crest.stars} size="lg"
                    />
                    {ct.name && <p className="text-white text-xs font-black">{ct.name}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Formation */}
          {ct.formation && ct.kit && (
            <div className="rounded-2xl border border-emerald-800/30 bg-emerald-950/40 p-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Swords size={10} /> Tática: {ct.formation}
              </p>
              <FormationDiagram
                formation={ct.formation}
                primary={ct.kit.primaryColor}
                secondary={ct.kit.secondaryColor}
              />
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center text-muted-foreground space-y-2">
          <Shield size={36} className="mx-auto opacity-20" />
          <p className="text-sm">Este participante ainda não criou sua seleção.</p>
        </div>
      )}

      {/* CTA — entrar no bolão */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
        <p className="text-sm font-bold">Quer montar seu bolão?</p>
        <p className="text-xs text-muted-foreground">Crie sua seleção e entre em ligas com amigos.</p>
        <Button size="sm" onClick={() => navigate('/pool')} className="mt-1">
          <Trophy size={13} className="mr-1.5" /> Acessar o Bolão
        </Button>
      </div>
    </div>
  )
}
