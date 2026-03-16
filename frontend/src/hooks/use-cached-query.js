import { useState, useEffect, useRef } from 'react'
import { getQueryCache } from '@/lib/query-cache'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes — same as api/client.js

const queryCache = getQueryCache()

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
  const hasCached = Boolean(cached)
  const isFresh = hasCached && Date.now() - cached.ts < ttl

  const [data, setData] = useState(hasCached ? cached.data : null)
  const [loading, setLoading] = useState(!hasCached)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  const fetchData = ({ preserveData = true } = {}) => {
    if (!preserveData) {
      setData(null)
      setLoading(true)
    } else {
      setLoading((prev) => (data === null ? true : prev)) // only show loading if no cached data
    }
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
    const nextCached = queryCache.get(key)
    const hasNextCached = Boolean(nextCached)
    const nextIsFresh = Boolean(nextCached && Date.now() - nextCached.ts < ttl)

    setData(hasNextCached ? nextCached.data : null)
    setLoading(!hasNextCached)
    setError(null)

    if (!nextIsFresh) fetchData({ preserveData: hasNextCached })
    return () => { mountedRef.current = false }
  }, [key, ttl]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: fetchData }
}
