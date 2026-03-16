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
  return api.get('/api/dashboard/stats')
}

export function getRecentOrders() {
  return api.get('/api/dashboard/recent-orders')
}

export function getRecentActivity() {
  return api.get('/api/dashboard/recent-activity')
}
