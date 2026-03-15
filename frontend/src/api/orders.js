import { api } from './client'

const unwrap = (res) => (res && res.data !== undefined ? res.data : res)

export function getOrders({ page = 1, limit = 20, status, store_id } = {}) {
  const params = new URLSearchParams({ page, limit })
  if (status) params.append('order_status', status)
  if (store_id) params.append('store_id', store_id)
  return api.get(`/api/orders?${params}`).then(unwrap)
}

export function getOrder(orderId) {
  return api.get(`/api/orders/${orderId}`).then(unwrap)
}

export function createOrder(data) {
  return api.post('/api/orders', data).then(unwrap)
}

export function updateOrderStatus(orderId, status, note) {
  return api.patch(`/api/orders/${orderId}/status`, { status, note }).then(unwrap)
}

export function updateOrder(orderId, data) {
  return api.put(`/api/orders/${orderId}`, data).then(unwrap)
}

