import { api } from './client'

export function getDashboardStats() {
  return api.cachedGet('/api/dashboard/stats')
}

export function getRecentOrders() {
  return api.cachedGet('/api/dashboard/recent-orders')
}
