import { useState } from 'react'
import { LogIn, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signInWithGoogle, signOut } from '@/core/firebase/auth'
import { useAuthStore } from '../store/authStore'

export function AuthButton() {
  const { user, loading } = useAuthStore()
  const [busy, setBusy] = useState(false)

  async function handleSignIn() {
    setBusy(true)
    try {
      await signInWithGoogle()
    } finally {
      setBusy(false)
    }
  }

  async function handleSignOut() {
    await signOut()
  }

  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 size={16} className="animate-spin" />
      </Button>
    )
  }

  if (!user) {
    return (
      <Button size="sm" onClick={handleSignIn} disabled={busy}>
        {busy ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <LogIn size={14} className="mr-1.5" />}
        Entrar
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full outline-none ring-ring focus-visible:ring-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL ?? undefined} alt={user.name ?? ''} />
            <AvatarFallback>{user.name?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium">{user.name}</div>
        <div className="truncate px-2 pb-1.5 text-xs text-muted-foreground">{user.email}</div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut size={14} className="mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
