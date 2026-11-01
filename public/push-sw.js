// Push-Benachrichtigungen (wird vom Service Worker der App geladen, siehe vite.config.ts)
self.addEventListener('push', (e) => {
  let d = {}
  try { d = e.data ? e.data.json() : {} } catch { d = { body: e.data && e.data.text() } }
  e.waitUntil((async () => {
    await self.registration.showNotification(d.title || 'BrainFit Kids', {
      body: d.body || '', tag: d.tag, renotify: true,
      icon: '/app/icon-192.png', badge: '/app/icon-192.png',
      vibrate: [80, 40, 80, 40, 220],
      data: { url: d.url || '/app/' },
    })
    // App ist offen? Dann gleich die Motivations-Melodie spielen
    const fenster = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const c of fenster) c.postMessage({ typ: 'push-ton' })
  })())
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = new URL((e.notification.data && e.notification.data.url) || '/app/', self.location.origin).href
  e.waitUntil((async () => {
    const fenster = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const c of fenster) {
      if (c.url.includes('/app/') && 'focus' in c) {
        await c.focus()
        if ('navigate' in c) await c.navigate(url).catch(() => {})
        return
      }
    }
    await self.clients.openWindow(url)
  })())
})
