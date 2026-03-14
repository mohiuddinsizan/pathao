const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Simple cache: in-memory + sessionStorage fallback
const memCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCached(key) {
  // Check in-memory first
  const mem = memCache.get(key)
  if (mem && Date.now() - mem.ts < CACHE_TTL) return mem.data

  // Fall back to sessionStorage
  try {
    const raw = sessionStorage.getItem(`api_cache:${key}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Date.now() - parsed.ts < CACHE_TTL) {
        memCache.set(key, parsed)
        return parsed.data
      }
      sessionStorage.removeItem(`api_cache:${key}`)
    }
  } catch {}
  return null
}

function setCache(key, data) {
  const entry = { data, ts: Date.now() }
  memCache.set(key, entry)
  try { sessionStorage.setItem(`api_cache:${key}`, JSON.stringify(entry)) } catch {}
}

async function request(path, options = {}) {
  const token = localStorage.getItem('auth_token')

  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed (${res.status})`)
  }

  return res.json()
}

export const api = {
  get: (path) => request(path),
  cachedGet: async (path) => {
    const cached = getCached(path)
    if (cached) return cached
    const data = await request(path)
    setCache(path, data)
    return data
  },
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
