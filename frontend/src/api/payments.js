import { api } from './client'

export function getPayments({ page = 1, limit = 20, status, store_id, payment_method } = {}) {
  const params = new URLSearchParams({ page, limit })
  if (status) params.append('order_status', status)
  if (store_id) params.append('store_id', store_id)
  if (payment_method) params.append('payment_method', payment_method)
  return api.get(`/api/payments?${params}`)
}
