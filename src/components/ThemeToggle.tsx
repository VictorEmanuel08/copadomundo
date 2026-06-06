import { useTheme } from '@/components/theme-provider'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="sm"
      className="relative h-9 w-9 p-0 rounded-xl border-border/80 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground active:scale-95 transition-all select-none"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      title="Alternar tema (Atalho: tecla 'D')"
    >
      {/* Sun icon for light mode */}
      <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
      
      {/* Moon icon for dark mode */}
      <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-400" />
      
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
