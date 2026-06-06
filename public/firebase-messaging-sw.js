importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: self.__FIREBASE_CONFIG?.apiKey,
  authDomain: self.__FIREBASE_CONFIG?.authDomain,
  projectId: self.__FIREBASE_CONFIG?.projectId,
  storageBucket: self.__FIREBASE_CONFIG?.storageBucket,
  messagingSenderId: self.__FIREBASE_CONFIG?.messagingSenderId,
  appId: self.__FIREBASE_CONFIG?.appId,
})

const messaging = firebase.messaging()

// Notificações recebidas em background (app fechado ou em outra aba)
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification ?? {}
  self.registration.showNotification(title ?? 'Copa 2026', {
    body: body ?? '',
    icon: icon ?? '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.matchId ?? 'match',
    renotify: true,
    data: payload.data,
  })
})

// Clique na notificação abre o app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow(url)
    }),
  )
})
