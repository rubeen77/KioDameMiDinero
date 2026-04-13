const CACHE = 'kio-v2'
const PRECACHE = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const { request } = e
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Solo cachear recursos del mismo origen
  if (url.origin !== location.origin) return

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(request)

      const fetchPromise = fetch(request).then(response => {
        if (response && response.status === 200) {
          cache.put(request, response.clone())
        }
        return response
      }).catch(() => cached)

      // Assets con hash (JS/CSS de Vite) → cache first
      if (url.pathname.startsWith('/assets/')) {
        return cached || fetchPromise
      }

      // Todo lo demás → network first, cache fallback
      return fetchPromise
    })
  )
})
