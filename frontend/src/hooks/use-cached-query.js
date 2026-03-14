import { useState, useEffect, useRef } from 'react'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes — same as api/client.js

// Global in-memory store so data survives component unmounts
const queryCache = new Map()

/**
 * Hook that returns cached data instantly on re-mount (no loading flash)
 * and fetches fresh data in the background when cache is stale.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useCachedQuery('dashboard-stats', getDashboardStats)
 *
 * @param {string} key  Unique cache key
 * @param {() => Promise<any>} fetcher  Async function that returns data
 * @param {object} [options]
 * @param {number} [options.ttl]  Cache TTL in ms (default 5 min)
 */
export function useCachedQuery(key, fetcher, options = {}) {
  const ttl = options.ttl ?? CACHE_TTL
  const cached = queryCache.get(key)
  const isFresh = cached && Date.now() - cached.ts < ttl

  const [data, setData] = useState(isFresh ? cached.data : null)
  const [loading, setLoading] = useState(!isFresh)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  const fetchData = () => {
    setLoading((prev) => data === null ? true : prev) // only show loading if no cached data
    setError(null)
    fetcher()
      .then((result) => {
        if (!mountedRef.current) return
        queryCache.set(key, { data: result, ts: Date.now() })
        setData(result)
      })
      .catch((err) => {
        if (!mountedRef.current) return
        setError(err)
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false)
      })
  }

  useEffect(() => {
    mountedRef.current = true
    if (!isFresh) fetchData()
    return () => { mountedRef.current = false }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: fetchData }
}
