import { api } from './client'

/**
 * Fetch analytics data for the logged-in merchant.
 * @param {{ date_from?: string, date_to?: string }} [params]
 */
export function getAnalytics(params = {}) {
  const searchParams = new URLSearchParams()
  if (params.date_from) searchParams.set('date_from', params.date_from)
  if (params.date_to) searchParams.set('date_to', params.date_to)
  if (params.store_id) searchParams.set('store_id', params.store_id)
  const qs = searchParams.toString()
  return api.get(`/api/analytics${qs ? '?' + qs : ''}`)
}
