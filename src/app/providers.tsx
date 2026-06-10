import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthState } from '@/features/auth/hooks/useAuthState'
import { ThemeProvider } from '@/components/theme-provider'
import { DialogProvider } from '@/shared/components/ConfirmDialog'
import { Toaster } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function AuthInitializer({ children }: { children: ReactNode }) {
  useAuthState()
  return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <QueryClientProvider client={queryClient}>
        <DialogProvider>
          <AuthInitializer>{children}</AuthInitializer>
        </DialogProvider>
      </QueryClientProvider>
      <Toaster
        position="bottom-center"
        theme="dark"
        gap={8}
        closeButton
        toastOptions={{
          duration: 3500,
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
            borderRadius: '16px',
            fontSize: '13px',
            padding: '14px 16px',
            boxShadow: '0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)',
            fontFamily: 'inherit',
          },
          classNames: {
            title: 'font-bold text-[13px]',
            description: 'text-[11px] opacity-75 mt-0.5',
            success: '!border-emerald-500/30',
            error: '!border-red-500/30',
            warning: '!border-amber-500/30',
            info: '!border-blue-500/30',
          },
        }}
      />
    </ThemeProvider>
  )
}
