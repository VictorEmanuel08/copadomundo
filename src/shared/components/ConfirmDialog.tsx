import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// ── Types ────────────────────────────────────────────────────────────────

interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
}

interface AlertOptions {
  title: string
  description?: string
  label?: string
}

interface DialogContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>
  alert: (opts: AlertOptions) => Promise<void>
}

// ── Context ──────────────────────────────────────────────────────────────

const DialogContext = createContext<DialogContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────

export function DialogProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<{
    opts: ConfirmOptions; resolve: (v: boolean) => void
  } | null>(null)

  const [alertState, setAlertState] = useState<{
    opts: AlertOptions; resolve: () => void
  } | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) =>
    new Promise<boolean>((resolve) => setConfirmState({ opts, resolve })),
  [])

  const alert = useCallback((opts: AlertOptions) =>
    new Promise<void>((resolve) => setAlertState({ opts, resolve })),
  [])

  function handleConfirm(value: boolean) {
    confirmState?.resolve(value)
    setConfirmState(null)
  }

  function handleAlert() {
    alertState?.resolve()
    setAlertState(null)
  }

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}

      {/* Confirm dialog */}
      <AlertDialog open={!!confirmState} onOpenChange={(open) => !open && handleConfirm(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmState?.opts.title}</AlertDialogTitle>
            {confirmState?.opts.description && (
              <AlertDialogDescription>{confirmState.opts.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleConfirm(false)}>
              {confirmState?.opts.cancelLabel ?? 'Cancelar'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirm(true)}
              className={confirmState?.opts.variant === 'destructive'
                ? 'bg-destructive hover:bg-destructive/90 text-white'
                : ''}
            >
              {confirmState?.opts.confirmLabel ?? 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert dialog */}
      <AlertDialog open={!!alertState} onOpenChange={(open) => !open && handleAlert()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertState?.opts.title}</AlertDialogTitle>
            {alertState?.opts.description && (
              <AlertDialogDescription>{alertState.opts.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleAlert}>
              {alertState?.opts.label ?? 'OK'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialog must be used within DialogProvider')
  return ctx
}
