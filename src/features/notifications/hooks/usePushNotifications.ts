import { useState, useEffect } from 'react'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/core/firebase/config'
import { useAuthStore } from '@/features/auth/store/authStore'

// VITE_FIREBASE_VAPID_KEY — gere em Firebase Console > Cloud Messaging > Web Push certificates
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined

export type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported'

export function usePushNotifications() {
  const { user } = useAuthStore()
  const [permission, setPermission] = useState<NotifPermission>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('Notification' in window)) { setPermission('unsupported'); return }
    setPermission(Notification.permission as NotifPermission)
  }, [])

  async function enable() {
    if (!user || !VAPID_KEY) return
    if (!('Notification' in window)) { setPermission('unsupported'); return }

    setLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result as NotifPermission)
      if (result !== 'granted') return

      const messaging = getMessaging()
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),
      })

      await setDoc(doc(db, 'fcmTokens', token), {
        userId: user.uid,
        token,
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('[FCM] erro ao ativar notificações:', err)
    } finally {
      setLoading(false)
    }
  }

  async function disable() {
    if (!user) return
    try {
      const messaging = getMessaging()
      const token = await getToken(messaging, { vapidKey: VAPID_KEY })
      if (token) await deleteDoc(doc(db, 'fcmTokens', token))
      setPermission('default')
    } catch (err) {
      console.error('[FCM] erro ao desativar:', err)
    }
  }

  // Mensagens recebidas com app aberto (foreground)
  useEffect(() => {
    if (permission !== 'granted') return
    try {
      const messaging = getMessaging()
      return onMessage(messaging, (payload) => {
        const { title, body } = payload.notification ?? {}
        if (title) new Notification(title, { body, icon: '/icon-192.png' })
      })
    } catch { /* FCM não disponível */ }
  }, [permission])

  return { permission, loading, enable, disable }
}
