import { api } from './client'

export function getStores() {
  return api.get('/api/stores')
}

export function getStore(storeId) {
  return api.get(`/api/stores/${storeId}`)
}

export function createStore(data) {
  return api.post('/api/stores', data)
}

export function updateStore(storeId, data) {
  return api.put(`/api/stores/${storeId}`, data)
}
