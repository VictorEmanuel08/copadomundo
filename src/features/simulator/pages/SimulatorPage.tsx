import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Share2, RotateCcw, CheckCircle2, ChevronRight, LayoutGrid, GitFork } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupSelector } from '../components/GroupSelector'
import { ThirdPlaceSelector } from '../components/ThirdPlaceSelector'
import { BracketView } from '../components/BracketView'
import { ALL_GROUPS, type GroupLetter, type SimState } from '../world-cup-bracket/types'
import { generateBracket, countCompleteGroups, isGroupComplete } from '../world-cup-bracket/bracket'
import { serializeState, deserializeState, emptyState, buildShareURL } from '../world-cup-bracket/serializer'
import { cn } from '@/lib/utils'

type Step = 'groups' | 'bracket'

function useSimState() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [state, setState] = useState<SimState>(() => {
    const s = searchParams.get('state') || searchParams.get('s')
    if (s) {
      const parsed = deserializeState(s)
      if (parsed) return parsed
    }
    return emptyState()
  })

  // Sincroniza URL ao mudar estado (usando a rota /simulador e state=)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      const encoded = serializeState(state)
      navigate(`/simulador?state=${encoded}`, { replace: true })
    }, 300)
    return () => clearTimeout(syncTimer.current)
  }, [state, navigate])

  function setGroup(group: GroupLetter, result: SimState['groups'][GroupLetter]) {
    // Ao alterar grupo, limpa os terceiros se o terceiro mudou
    setState(prev => {
      const newState = {
        ...prev,
        groups: { ...prev.groups, [group]: result },
        bracket: {} as Record<string, string | null>,
      }
      // Remove o terceiro antigo dos selecionados
      const oldThird = prev.groups[group]?.third
      const newThird = result.third
      if (oldThird && oldThird !== newThird) {
        newState.thirds = prev.thirds.filter(id => id !== oldThird)
      }
      return newState
    })
  }

  function setThirds(thirds: string[]) {
    setState(prev => ({ ...prev, thirds, bracket: {} }))
  }

  function setBracketWinner(matchId: string, teamId: string) {
    setState(prev => {
      const newBracket = { ...prev.bracket }
      if (newBracket[matchId] === teamId) {
        // Toggle: clicou no mesmo time → remove
        delete newBracket[matchId]
      } else {
        newBracket[matchId] = teamId
      }
      return { ...prev, bracket: newBracket }
    })
  }

  function reset() {
    setState(emptyState())
  }

  return { state, setGroup, setThirds, setBracketWinner, reset }
}

export default function SimulatorPage() {
  const { state, setGroup, setThirds, setBracketWinner, reset } = useSimState()
  const [tab, setTab] = useState<Step>('groups')
  const [copied, setCopied] = useState(false)

  const completedGroups = useMemo(() => countCompleteGroups(state.groups), [state.groups])
  const allGroupsDone   = completedGroups === ALL_GROUPS.length
  const thirdsReady     = state.thirds.length === 8
  const bracketReady    = allGroupsDone && thirdsReady

  const fullBracket = useMemo(
    () => generateBracket(state),
    [state],
  )

  // Avança automaticamente para a aba do mata-mata quando estiver tudo pronto
  useEffect(() => {
    if (bracketReady && tab === 'groups') {
      setTab('bracket')
    }
  }, [bracketReady])

  async function share() {
    const url = buildShareURL(state)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('Copie o link da sua simulação:', url)
    }
  }

  const scrollToGroup = (g: GroupLetter) => {
    const el = document.getElementById(`group-${g}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const pct = Math.round((completedGroups / ALL_GROUPS.length) * 100)

  return (
    <div className="space-y-6 select-none">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Simulador de Chaveamento</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">Copa do Mundo 2026</h1>
            <p className="mt-1 text-xs text-muted-foreground max-w-md">
              Classifique as seleções nos grupos e dispute o chaveamento das eliminatórias de forma dinâmica.
            </p>
          </div>
          
          <div className="flex gap-2 shrink-0">
            {bracketReady && (
              <Button
                size="sm"
                onClick={share}
                className="bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                {copied
                  ? <><CheckCircle2 size={13} className="mr-1.5" />Copiado!</>
                  : <><Share2 size={13} className="mr-1.5" />Compartilhar</>
                }
              </Button>
            )}
            <Button
              size="sm"
              onClick={reset}
              variant="outline"
              className="border-border hover:bg-muted text-muted-foreground rounded-xl"
              title="Resetar toda a simulação"
            >
              <RotateCcw size={13} className="mr-1.5" />
              Limpar Tudo
            </Button>
          </div>
        </div>

        {/* Abas e Progresso integrado */}
        <div className="relative z-10 mt-6 flex flex-col gap-4 border-t border-border/30 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Abas Esportivas */}
          <div className="flex bg-muted/60 p-1 rounded-xl border border-border/40 self-start shrink-0">
            <button
              onClick={() => setTab('groups')}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase transition-all duration-200 active:scale-95',
                tab === 'groups'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <LayoutGrid size={13} />
              1. Grupos & Terceiros
            </button>
            <button
              onClick={() => setTab('bracket')}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase transition-all duration-200 active:scale-95',
                tab === 'bracket'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <GitFork size={13} />
              2. Fase Eliminatória
            </button>
          </div>

          {/* Barra de Progresso simplificada */}
          <div className="flex items-center gap-3 w-full sm:max-w-xs text-xs font-bold text-muted-foreground">
            <span className="shrink-0">{pct}% Concluído</span>
            <div className="h-2 w-full rounded-full bg-muted border border-border/10">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo da Aba 1: Grupos e Terceiros */}
      {tab === 'groups' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Painel Dashboard de Progresso com Âncoras */}
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Painel de Conclusão de Grupos</span>
              <span>{completedGroups} de 12 completos</span>
            </div>
            
            <div className="grid grid-cols-6 gap-1.5 sm:flex sm:flex-wrap sm:items-center">
              {ALL_GROUPS.map(g => {
                const isDone = isGroupComplete(state.groups[g])
                return (
                  <button
                    key={g}
                    onClick={() => scrollToGroup(g)}
                    className={cn(
                      'flex items-center justify-center h-8 w-full sm:w-11 rounded-lg text-xs font-black border transition-all active:scale-95 cursor-pointer',
                      isDone
                        ? 'bg-success/15 border-success/30 text-success'
                        : 'bg-muted/40 border-border/40 text-muted-foreground/60 hover:bg-muted hover:border-border/80 hover:text-foreground',
                    )}
                  >
                    {g}
                    {isDone && <span className="ml-1 text-[8px]">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Grid dos Grupos */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ALL_GROUPS.map(g => (
              <div key={g} id={`group-${g}`}>
                <GroupSelector
                  group={g}
                  result={state.groups[g]}
                  onChange={r => setGroup(g, r)}
                />
              </div>
            ))}
          </div>

          {/* Painel de Terceiros colocados */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <ThirdPlaceSelector
              groups={state.groups}
              selected={state.thirds}
              onChange={setThirds}
            />
          </div>

          {/* Botão de avanço rápido */}
          {bracketReady && (
            <div className="flex justify-end pt-2">
              <Button 
                size="lg" 
                onClick={() => setTab('bracket')} 
                className="gap-2 rounded-xl font-bold px-6 shadow-sm bg-primary text-white"
              >
                Visualizar Mata-Mata <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo da Aba 2: Mata-Mata */}
      {tab === 'bracket' && (
        <div className="space-y-4 animate-fade-in">
          {/* Banner explicativo de bloqueio / leitura */}
          {!bracketReady && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                Aviso: O chaveamento está em modo de leitura. Complete a classificação dos grupos e a escolha dos melhores terceiros para poder simular e avançar os times.
              </p>
            </div>
          )}

          {/* Container do Bracket */}
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <BracketView
              bracket={fullBracket}
              winners={state.bracket}
              onPick={(matchId, teamId) => setBracketWinner(matchId, teamId)}
              disabled={!bracketReady}
            />
          </div>
        </div>
      )}
    </div>
  )
}
