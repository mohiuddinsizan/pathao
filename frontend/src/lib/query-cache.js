const queryCache = new Map()

export function getQueryCache() {
  return queryCache
}

export function invalidateCachedQuery(match) {
  const matcher =
    typeof match === 'function'
      ? match
      : (key) => key === match || key.startsWith(match)

  for (const key of Array.from(queryCache.keys())) {
    if (matcher(key)) {
      queryCache.delete(key)
    }
  }
}