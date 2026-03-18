import { api } from './client'
import { invalidateCachedQuery } from '@/lib/query-cache'

export function invalidateDashboardCaches() {
  api.invalidateCache('/api/dashboard/')
  invalidateCachedQuery(
    (key) =>
      key.startsWith('dashboard-') ||
      key.startsWith('deliveries-') ||
      key.startsWith('order-') ||
      key === 'analytics'
  )
}

export function getDashboardStats() {
  return api.cachedGet('/api/dashboard/stats')
}

export function getRecentOrders() {
  return api.cachedGet('/api/dashboard/recent-orders')
}

export function getRecentActivity({ limit = 10, offset = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  return api.get(`/api/dashboard/recent-activity?${params.toString()}`)
}
