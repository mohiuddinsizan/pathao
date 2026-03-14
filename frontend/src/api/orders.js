import { api } from './client'

export function getOrders({ page = 1, limit = 20, status, store_id } = {}) {
  const params = new URLSearchParams({ page, limit })
  if (status) params.append('order_status', status)
  if (store_id) params.append('store_id', store_id)
  return api.get(`/api/orders?${params}`)
}

export function getOrder(orderId) {
  return api.get(`/api/orders/${orderId}`)
}

export function createOrder(data) {
  return api.post('/api/orders', data)
}
