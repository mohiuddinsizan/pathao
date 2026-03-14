import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock localStorage
const store = {}
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, val) => { store[key] = val }),
  removeItem: vi.fn((key) => { delete store[key] }),
})

// Mock sessionStorage
vi.stubGlobal('sessionStorage', {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
})

// Import after mocks
const { api } = await import('@/api/client')

beforeEach(() => {
  vi.clearAllMocks()
  Object.keys(store).forEach((k) => delete store[k])
})

describe('api.get()', () => {
  it('calls fetch with correct URL and auth header', async () => {
    store['auth_token'] = 'my-jwt'
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test' }),
    })

    const result = await api.get('/api/orders')

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toContain('/api/orders')
    expect(options.headers['Authorization']).toBe('Bearer my-jwt')
    expect(result).toEqual({ data: 'test' })
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: 'Bad request' }),
    })

    await expect(api.get('/api/bad')).rejects.toThrow('Bad request')
  })
})

describe('api.post()', () => {
  it('sends JSON body with POST method', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 1 }),
    })

    await api.post('/api/orders', { recipient_name: 'Test' })

    const [, options] = mockFetch.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ recipient_name: 'Test' })
  })
})
