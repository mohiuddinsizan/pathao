import { api } from './client'
import { invalidateDashboardCaches } from './dashboard'

export function getStores() {
  return api.get('/api/stores')
}

export function getStore(storeId) {
  return api.get(`/api/stores/${storeId}`)
}

export function createStore(data) {
  return api.post('/api/stores', data).then((res) => {
    invalidateDashboardCaches()
    return res
  })
}

export function updateStore(storeId, data) {
  return api.put(`/api/stores/${storeId}`, data).then((res) => {
    invalidateDashboardCaches()
    return res
  })
}

export function deleteStore(storeId) {
  return api.delete(`/api/stores/${storeId}`).then((res) => {
    invalidateDashboardCaches()
    return res
  })
}

export function reactivateStore(storeId) {
  return api.post(`/api/stores/${storeId}/reactivate`).then((res) => {
    invalidateDashboardCaches()
    return res
  })
}

export function permanentlyDeleteStore(storeId) {
  return api.delete(`/api/stores/${storeId}/permanent`).then((res) => {
    invalidateDashboardCaches()
    return res
  })
}
