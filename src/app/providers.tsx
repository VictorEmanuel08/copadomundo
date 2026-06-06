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
        position="top-right"
        richColors
        closeButton
        gap={8}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'inherit',
            borderRadius: '14px',
            fontSize: '13px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
          },
          classNames: {
            toast: 'font-sans',
            title: 'font-bold text-[13px]',
            description: 'text-[11px] opacity-80',
          },
        }}
      />
    </ThemeProvider>
  )
}
