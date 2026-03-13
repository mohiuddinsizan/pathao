import { api } from './client'

export function getDashboardStats() {
  return api.get('/api/dashboard/stats')
}

export function getRecentOrders() {
  return api.get('/api/dashboard/recent-orders')
}
