const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001'

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

function formatErrorDetail(detail, fallback) {
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const field = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : ''
        return field ? `${field}: ${item.msg}` : item.msg
      })
      .filter(Boolean)
    if (messages.length > 0) return messages.join(', ')
  }

  if (typeof detail === 'string') return detail
  return fallback
}

function invalidateCache(match) {
  const matcher =
    typeof match === 'function'
      ? match
      : (key) => key === match || key.startsWith(match)

  for (const key of Array.from(memCache.keys())) {
    if (matcher(key)) {
      memCache.delete(key)
    }
  }

  try {
    for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
      const storageKey = sessionStorage.key(i)
      if (!storageKey || !storageKey.startsWith('api_cache:')) continue
      const cacheKey = storageKey.slice('api_cache:'.length)
      if (matcher(cacheKey)) {
        sessionStorage.removeItem(storageKey)
      }
    }
  } catch {}
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
    throw new Error(formatErrorDetail(body.detail, `Request failed (${res.status})`))
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
  invalidateCache,
}
