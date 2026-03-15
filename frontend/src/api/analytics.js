import { api } from './client'

/**
 * Fetch all analytics data for the logged-in merchant.
 */
export function getAnalytics() {
  return api.get('/api/analytics')
}
