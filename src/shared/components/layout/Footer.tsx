import { ExternalLink } from 'lucide-react'
import victorImg from '@/assets/victor.png'

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/VictorEmanuel08',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/victorsantosdev00/',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
]

const FEATURES = [
  'Placares ao vivo', 'Bolão privado', 'Palpite no campeão',
  'Seleção virtual', 'Ranking', 'Notificações push',
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-auto border-t border-white/10 bg-[#080e1c] pb-20 md:pb-0">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-12">

          <div className="flex flex-col items-center gap-4 md:items-start shrink-0">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-2 border-blue-500/40 bg-linear-to-br from-blue-600/30 to-blue-900/20 flex items-center justify-center shadow-lg shadow-blue-500/10 overflow-hidden">
                <img src={victorImg} alt="Victor Moura" className="h-full w-full object-cover" />
              </div>
              <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-[#080e1c] bg-emerald-400 shadow shadow-emerald-400/50" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-base font-black tracking-[0.2em] text-white uppercase">VM CODES</p>
              <p className="mt-0.5 text-xs text-slate-400 font-medium">Victor Moura · Front End Developer</p>
            </div>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map(({ label, href, svg }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400 hover:scale-105">
                  {svg}
                </a>
              ))}
            </div>
          </div>

          <div className="hidden md:block w-px self-stretch bg-white/8" />

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <p className="text-sm font-black text-white">🏆 Copa do Mundo 2026</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400 max-w-xs mx-auto md:mx-0">
                Acompanhe a Copa com placares ao vivo, chaveamento interativo e bolão privado com seus amigos.
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
              {FEATURES.map((f) => (
                <span key={f} className="rounded-full border border-blue-500/20 bg-blue-500/8 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300">
                  {f}
                </span>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-6 flex flex-col items-center gap-1.5 border-t border-white/8 pt-5 md:flex-row md:justify-between">
          <p className="text-xs text-slate-500">
            © {year} <span className="font-bold text-slate-400">VM CODES</span> · Todos os direitos reservados
          </p>
          <a href="https://github.com/VictorEmanuel08/copadomundo" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300">
            Código aberto no GitHub <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </footer>
  )
}
