import { api } from './client'

/**
 * Fetch all analytics data for the logged-in merchant.
 *
 * @param {string|null} dateFrom  – YYYY-MM-DD start date (optional)
 * @param {string|null} dateTo    – YYYY-MM-DD end date   (optional, inclusive)
 */
export function getAnalyticsSummary(dateFrom = null, dateTo = null) {
  const params = new URLSearchParams()
  if (dateFrom) params.set('date_from', dateFrom)
  if (dateTo)   params.set('date_to',   dateTo)

  const qs = params.toString()
  return api.get(`/api/analytics/summary${qs ? `?${qs}` : ''}`)
}
