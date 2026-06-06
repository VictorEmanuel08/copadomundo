import { useState, useEffect } from 'react'
import { Loader2, Save, Star, Shield, Shirt, Info, LogIn, Swords } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KitPreview, type KitPattern, type CollarType } from '../components/KitPreview'
import { CrestPreview, type CrestShape, type CrestPattern } from '../components/CrestPreview'
import { ColorPicker } from '../components/ColorPicker'
import { useAuthStore } from '@/features/auth/store/authStore'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/core/firebase/config'
import { signInWithGoogle } from '@/core/firebase/auth'
import { TeamSelector } from '@/features/favorites/components/TeamSelector'
import { cn } from '@/lib/utils'

// ── Color presets ───────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { label: 'Brasil',     primary: '#009c3b', secondary: '#FFDF00', tertiary: '#002776' },
  { label: 'Argentina',  primary: '#74ACDF', secondary: '#FFFFFF', tertiary: '#74ACDF' },
  { label: 'Espanha',    primary: '#AA151B', secondary: '#F1BF00', tertiary: '#AA151B' },
  { label: 'Alemanha',   primary: '#FFFFFF', secondary: '#000000', tertiary: '#DD0000' },
  { label: 'França',     primary: '#002395', secondary: '#FFFFFF', tertiary: '#ED2939' },
  { label: 'Portugal',   primary: '#006600', secondary: '#FF0000', tertiary: '#FFFFFF' },
  { label: 'Inglaterra', primary: '#FFFFFF', secondary: '#CF081F', tertiary: '#012169' },
  { label: 'Itália',     primary: '#0066CC', secondary: '#FFFFFF', tertiary: '#0066CC' },
  { label: 'Países Bx',  primary: '#FF6600', secondary: '#FFFFFF', tertiary: '#FF6600' },
  { label: 'Japão',      primary: '#FFFFFF', secondary: '#BC002D', tertiary: '#BC002D' },
  { label: 'México',     primary: '#006847', secondary: '#FFFFFF', tertiary: '#CE1126' },
  { label: 'EUA',        primary: '#B22234', secondary: '#FFFFFF', tertiary: '#3C3B6E' },
  { label: 'Marrocos',   primary: '#C1272D', secondary: '#006233', tertiary: '#FFFFFF' },
  { label: 'Noruega',    primary: '#EF2B2D', secondary: '#FFFFFF', tertiary: '#002868' },
] as const

// ── Custom tab bar (bypasses Shadcn TabsList height constraints) ────────
type TabId = 'identity' | 'crest' | 'kit' | 'tactics' | 'favorites'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'identity',  label: 'Identidade', icon: <Info size={15} /> },
  { id: 'crest',     label: 'Escudo',     icon: <Shield size={15} /> },
  { id: 'kit',       label: 'Uniforme',   icon: <Shirt size={15} /> },
  { id: 'tactics',   label: 'Tático',     icon: <Swords size={15} /> },
  { id: 'favorites', label: 'Favoritas',  icon: <Star size={15} /> },
]

function TabBar({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <div className="flex w-full bg-muted/50 border border-border/40 p-1 rounded-2xl gap-1">
      {TABS.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all duration-150 min-w-0 cursor-pointer',
            active === id
              ? 'bg-card shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40',
          )}
        >
          <span className={cn('shrink-0 transition-colors', active === id ? 'text-primary' : '')}>{icon}</span>
          <span className="text-[10px] font-bold leading-none text-center truncate w-full px-0.5">{label}</span>
        </button>
      ))}
    </div>
  )
}

// ── OptionGroup ─────────────────────────────────────────────────────────
function OptionGroup<T extends string | number>({ label, options, value, onChange }: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button key={String(o.value)} onClick={() => onChange(o.value)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer',
              value === o.value
                ? 'gradient-primary border-transparent text-white shadow-sm font-bold'
                : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground',
            )}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Formation Diagram (horizontal left→right, GK near goal) ────────────
export function FormationDiagram({ formation, primary, secondary }: {
  formation: string; primary: string; secondary: string
}) {
  const W = 360, H = 210, PAD = 22
  const outfieldCols = formation.split('-').map(Number)

  const GK_X = PAD + 18
  const playAreaLeft  = PAD + 52
  const playAreaRight = W - PAD - 16
  const colSpacing = outfieldCols.length > 1
    ? (playAreaRight - playAreaLeft) / (outfieldCols.length - 1)
    : 0

  const dots: { x: number; y: number; isGK: boolean }[] = [
    { x: GK_X, y: H / 2, isGK: true },
  ]

  outfieldCols.forEach((count, ci) => {
    const x = outfieldCols.length === 1
      ? (playAreaLeft + playAreaRight) / 2
      : playAreaLeft + ci * colSpacing
    const rowH = H - PAD * 2
    for (let i = 0; i < count; i++) {
      dots.push({ x, y: PAD + (rowH / (count + 1)) * (i + 1), isGK: false })
    }
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl"
      style={{ background: 'linear-gradient(90deg,rgba(0,60,20,.75)0%,rgba(0,90,35,.55)50%,rgba(0,60,20,.75)100%)' }}>
      <rect x={PAD} y={PAD/2} width={W-PAD*2} height={H-PAD} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1" rx="4" />
      <line x1={W/2} y1={PAD/2} x2={W/2} y2={H-PAD/2} stroke="rgba(255,255,255,.1)" strokeWidth="1" />
      <ellipse cx={W/2} cy={H/2} rx="26" ry="30" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1" />
      <circle cx={W/2} cy={H/2} r="2.5" fill="rgba(255,255,255,.15)" />
      <rect x={PAD} y={H/2-22} width="12" height="44" rx="1" fill="rgba(0,0,0,.15)" stroke="rgba(255,255,255,.22)" strokeWidth="1.5" />
      <rect x={PAD} y={H/2-40} width="32" height="80" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" />
      <rect x={W-PAD-12} y={H/2-22} width="12" height="44" rx="1" fill="rgba(0,0,0,.15)" stroke="rgba(255,255,255,.22)" strokeWidth="1.5" />
      <rect x={W-PAD-32} y={H/2-40} width="32" height="80" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" />
      <text x={W-PAD-6} y={H/2+4} fontSize="9" fill="rgba(255,255,255,.25)" textAnchor="middle">▶</text>
      {dots.map((d, i) => (
        <g key={i}>
          <circle cx={d.x} cy={d.y} r={9} fill={d.isGK ? secondary : primary} stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
          <circle cx={d.x} cy={d.y} r={4} fill="rgba(255,255,255,.22)" />
        </g>
      ))}
    </svg>
  )
}

// ── Main page ───────────────────────────────────────────────────────────
export default function CustomTeamPage() {
  const { user } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('identity')

  // Identity
  const [name, setName] = useState('')
  const [acronym, setAcronym] = useState('')
  const [country, setCountry] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [playerNumber, setPlayerNumber] = useState('')
  const [showOnJersey, setShowOnJersey] = useState(false)
  const [playerNameColor, setPlayerNameColor] = useState('#ffffff')
  const [formation, setFormation] = useState('4-3-3')

  // Crest
  const [crestShape, setCrestShape] = useState<CrestShape>('classic')
  const [crestPattern, setCrestPattern] = useState<CrestPattern>('solid')
  const [crestPrimary, setCrestPrimary] = useState('#1e3a8a')
  const [crestSecondary, setCrestSecondary] = useState('#f59e0b')
  const [stars, setStars] = useState(0)

  // Kit
  const [kitPrimary, setKitPrimary] = useState('#1e3a8a')
  const [kitSecondary, setKitSecondary] = useState('#ffffff')
  const [kitTertiary, setKitTertiary] = useState('#f59e0b')
  const [pattern, setPattern] = useState<KitPattern>('solid')
  const [collar] = useState<CollarType>('round') // kept for data compat
  const [numberColor, setNumberColor] = useState('#ffffff')

  // Load from Firestore
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'customTeams', user.uid)).then((snap) => {
      if (!snap.exists()) return
      const d = snap.data()
      if (d.name) setName(d.name)
      if (d.acronym) setAcronym(d.acronym)
      if (d.country) setCountry(d.country)
      if (d.playerName !== undefined) setPlayerName(d.playerName)
      if (d.playerNumber !== undefined) setPlayerNumber(d.playerNumber)
      if (d.showOnJersey !== undefined) setShowOnJersey(d.showOnJersey)
      if (d.playerNameColor) setPlayerNameColor(d.playerNameColor)
      if (d.formation) setFormation(d.formation)
      if (d.crest) {
        if (d.crest.shape) setCrestShape(d.crest.shape)
        if (d.crest.pattern) setCrestPattern(d.crest.pattern)
        if (d.crest.primaryColor) setCrestPrimary(d.crest.primaryColor)
        if (d.crest.secondaryColor) setCrestSecondary(d.crest.secondaryColor)
        if (d.crest.stars !== undefined) setStars(d.crest.stars)
      }
      if (d.kit) {
        if (d.kit.primaryColor) setKitPrimary(d.kit.primaryColor)
        if (d.kit.secondaryColor) setKitSecondary(d.kit.secondaryColor)
        if (d.kit.tertiaryColor) setKitTertiary(d.kit.tertiaryColor)
        if (d.kit.pattern) setPattern(d.kit.pattern)
        if (d.kit.numberColor) setNumberColor(d.kit.numberColor)
      }
    }).catch(console.error)
  }, [user])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'customTeams', user.uid), {
        ownerId: user.uid, name,
        acronym: acronym.slice(0, 3).toUpperCase(), country,
        playerName, playerNumber, showOnJersey, playerNameColor, formation,
        crest: { shape: crestShape, pattern: crestPattern, primaryColor: crestPrimary, secondaryColor: crestSecondary, stars },
        kit: { primaryColor: kitPrimary, secondaryColor: kitSecondary, tertiaryColor: kitTertiary, collar, pattern, numberColor },
        updatedAt: serverTimestamp(),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  function applyPreset(p: typeof COLOR_PRESETS[number]) {
    setKitPrimary(p.primary); setKitSecondary(p.secondary); setKitTertiary(p.tertiary)
    setCrestPrimary(p.primary); setCrestSecondary(p.secondary)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Minha Seleção</h1>
        <p className="text-sm text-muted-foreground">Personalize sua equipe para a Copa do Mundo 2026</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">

        {/* ─── Preview card ─── */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 p-6 text-white shadow-2xl flex flex-col items-center justify-between min-h-[440px] lg:sticky lg:top-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

          <div className="absolute top-4 right-4 bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <CrestPreview primaryColor={crestPrimary} secondaryColor={crestSecondary}
              acronym={acronym || 'AAA'} shape={crestShape} pattern={crestPattern} stars={stars} size="md" />
          </div>

          <div className="absolute top-4 left-4 bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Vestiário Oficial
          </div>
          <div className="absolute top-14 left-4 bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {formation}
          </div>

          <div className="relative mt-14 flex flex-col items-center justify-center w-full hover:scale-[1.03] transition-all duration-300">
            <div className="w-16 h-7 border border-slate-500/40 rounded-t-full -mb-1 opacity-60 relative">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-px bg-slate-500/40" />
            </div>
            <KitPreview
              primaryColor={kitPrimary} secondaryColor={kitSecondary} tertiaryColor={kitTertiary}
              pattern={pattern} collar={collar} numberColor={numberColor}
              number={showOnJersey ? (playerNumber || '10') : undefined}
              playerName={showOnJersey ? (playerName || undefined) : undefined}
              playerNameColor={playerNameColor} size="lg"
            />
          </div>

          <div className="w-full text-center mt-4 z-10 bg-slate-900/70 backdrop-blur-sm p-4 rounded-2xl border border-white/5 shadow-inner">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Escalação Autorizada</p>
            <h2 className="text-xl font-black mt-0.5 text-white uppercase tracking-tight truncate">
              {name || 'Nome da Seleção'}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1 text-xs text-white/70">
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded uppercase font-extrabold text-[10px] tracking-wider">
                {acronym ? acronym.slice(0, 3).toUpperCase() : 'AAA'}
              </span>
              {country && <><span className="opacity-40">•</span><span className="font-semibold truncate max-w-[140px]">{country}</span></>}
            </div>
          </div>
        </div>

        {/* ─── Options ─── */}
        <div className="lg:col-span-7 space-y-4">
          <TabBar active={activeTab} onChange={setActiveTab} />

          {/* ── Identidade ── */}
          {activeTab === 'identity' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
                <h3 className="font-black text-sm uppercase tracking-wide text-foreground/80">Informações Básicas</h3>
                {[
                  { id: 'name', label: 'Nome da seleção', value: name, onChange: setName, placeholder: 'Ex: Estrelas do Sul', max: 30 },
                  { id: 'acronym', label: 'Sigla (3 letras)', value: acronym, onChange: (v: string) => setAcronym(v.toUpperCase().slice(0,3)), placeholder: 'Ex: EST', max: 3 },
                  { id: 'country', label: 'País / Região de Origem', value: country, onChange: setCountry, placeholder: 'Ex: Rio Grande do Sul', max: 40 },
                ].map(({ id, label, value, onChange, placeholder, max }) => (
                  <div key={id} className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">{label}</label>
                    <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
                      placeholder={placeholder} maxLength={max}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wide text-foreground/80">Jogador na Camisa</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Nome e número impressos no uniforme</p>
                  </div>
                  <div onClick={() => setShowOnJersey(v => !v)}
                    className={cn('relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer',
                      showOnJersey ? 'bg-primary' : 'bg-muted-foreground/30')}>
                    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                      showOnJersey ? 'translate-x-4' : 'translate-x-0.5')} />
                  </div>
                </div>
                <div className={cn('space-y-4 transition-all', !showOnJersey && 'opacity-40 pointer-events-none')}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Nome</label>
                      <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Ex: SILVA" maxLength={10} disabled={!showOnJersey}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Número</label>
                      <input type="number" value={playerNumber} min={1} max={99}
                        onChange={(e) => setPlayerNumber(e.target.value)}
                        placeholder="10" disabled={!showOnJersey}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-black text-center focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                  <ColorPicker label="Cor do nome e número" value={playerNameColor} onChange={setPlayerNameColor} />
                </div>
              </div>
            </div>
          )}

          {/* ── Escudo ── */}
          {activeTab === 'crest' && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-sm">
              <h3 className="font-black text-sm uppercase tracking-wide text-foreground/80">Estilo do Escudo</h3>
              <OptionGroup label="Formato"
                options={[
                  { value: 'classic', label: 'Clássico' }, { value: 'shield', label: 'Escudo Real' },
                  { value: 'round', label: 'Redondo' }, { value: 'diamond', label: 'Losango' },
                  { value: 'pentagon', label: 'Pentágono' }, { value: 'star', label: 'Estrela' },
                ]}
                value={crestShape} onChange={setCrestShape}
              />
              <OptionGroup label="Estampa Interna"
                options={[
                  { value: 'solid', label: 'Liso' }, { value: 'halves', label: 'Meio a Meio' },
                  { value: 'stripes', label: 'Listras' }, { value: 'diagonal', label: 'Faixa' },
                  { value: 'cross', label: 'Cruz' }, { value: 'checkered', label: 'Xadrez' },
                  { value: 'rings', label: 'Círculos' }, { value: 'chevron', label: 'Chevron' },
                ]}
                value={crestPattern} onChange={setCrestPattern}
              />
              <div className="space-y-3">
                <ColorPicker label="Cor Principal" value={crestPrimary} onChange={setCrestPrimary} />
                <ColorPicker label="Cor Secundária" value={crestSecondary} onChange={setCrestSecondary} />
              </div>
              <OptionGroup label="Estrelas de Título"
                options={[0,1,2,3,4,5].map((n) => ({ value: n, label: n === 0 ? 'Nenhuma' : '★'.repeat(n) }))}
                value={stars} onChange={setStars}
              />
            </div>
          )}

          {/* ── Uniforme ── */}
          {activeTab === 'kit' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
                <h3 className="font-black text-sm uppercase tracking-wide text-foreground/80">Inspiração de Cores</h3>
                <p className="text-xs text-muted-foreground">Clique para aplicar as cores de uma seleção real.</p>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PRESETS.map((p) => (
                    <button key={p.label} onClick={() => applyPreset(p)}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-[11px] font-bold hover:border-primary/40 hover:bg-muted transition-all cursor-pointer">
                      <span className="h-3 w-3 rounded-full border border-border/50" style={{ background: p.primary }} />
                      <span className="h-3 w-3 rounded-full border border-border/50" style={{ background: p.secondary }} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-sm">
                <h3 className="font-black text-sm uppercase tracking-wide text-foreground/80">Cores do Uniforme</h3>
                <ColorPicker label="Cor Principal" value={kitPrimary} onChange={setKitPrimary} />
                <ColorPicker label="Cor Secundária" value={kitSecondary} onChange={setKitSecondary} />
                <ColorPicker label="Detalhes / Mangas" value={kitTertiary} onChange={setKitTertiary} />
                <ColorPicker label="Cor do Número" value={numberColor} onChange={setNumberColor} />
                <OptionGroup label="Estampa"
                  options={[
                    { value: 'solid', label: 'Sólida' }, { value: 'stripes', label: 'Listras Vert.' },
                    { value: 'thin-stripes', label: 'Listras Finas' }, { value: 'hoops', label: 'Listras Horiz.' },
                    { value: 'sash', label: 'Faixa Diagonal' }, { value: 'halves', label: 'Meio a Meio' },
                    { value: 'quarters', label: 'Quadrantes' }, { value: 'checkered', label: 'Xadrez' },
                    { value: 'chevron', label: 'Chevron' }, { value: 'sleeves', label: 'Mangas' },
                    { value: 'panel', label: 'Painel' }, { value: 'gradient-v', label: 'Degradê' },
                  ]}
                  value={pattern} onChange={setPattern}
                />
              </div>
            </div>
          )}

          {/* ── Tático ── */}
          {activeTab === 'tactics' && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-sm">
              <h3 className="font-black text-sm uppercase tracking-wide text-foreground/80">Preferência Tática</h3>
              <OptionGroup label="Formação"
                options={[
                  { value: '4-3-3', label: '4-3-3' }, { value: '4-4-2', label: '4-4-2' },
                  { value: '4-2-3-1', label: '4-2-3-1' }, { value: '3-5-2', label: '3-5-2' },
                  { value: '3-4-3', label: '3-4-3' }, { value: '5-3-2', label: '5-3-2' },
                  { value: '4-5-1', label: '4-5-1' }, { value: '4-1-4-1', label: '4-1-4-1' },
                ]}
                value={formation} onChange={setFormation}
              />
              <div className="rounded-2xl bg-emerald-950/60 border border-emerald-800/30 p-4 space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">{formation} · esq → dir</p>
                  <div className="flex items-center gap-3 text-[9px] text-white/40">
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: kitSecondary }} /> GK</span>
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: kitPrimary }} /> Linha</span>
                  </div>
                </div>
                <FormationDiagram formation={formation} primary={kitPrimary} secondary={kitSecondary} />
              </div>
            </div>
          )}

          {/* ── Favoritas ── */}
          {activeTab === 'favorites' && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide mb-1 text-foreground/80 flex items-center gap-1.5">
                  <Star size={16} className="text-amber-500 fill-amber-500" /> Seleções Favoritas
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Marque as seleções para acompanhar. Aparecem na aba Favoritos do Calendário.
                </p>
              </div>
              <TeamSelector />
            </div>
          )}

          {/* Save */}
          <div className="mt-2">
            {user ? (
              <Button onClick={handleSave} disabled={saving} className="gap-2 w-full font-bold shadow-lg shadow-primary/20">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saved ? '✓ Configurações Salvas!' : 'Salvar Seleção'}
              </Button>
            ) : (
              <div className="border-2 border-dashed border-border/80 bg-muted/40 p-5 rounded-2xl flex flex-col items-center text-center gap-3.5 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Info size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Quer salvar permanentemente?</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[380px] leading-relaxed">
                    Faça login para salvar na nuvem e sincronizar em todos os dispositivos.
                  </p>
                </div>
                <Button onClick={signInWithGoogle} className="gap-2 w-full sm:w-auto font-bold gradient-primary text-white border-none">
                  <LogIn size={14} /> Entrar com Google
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
