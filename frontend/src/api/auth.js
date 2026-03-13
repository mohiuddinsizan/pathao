import { api } from './client'

export async function loginAPI(email, password) {
  const data = await api.post('/api/auth/login', { email, password })
  localStorage.setItem('auth_token', data.access_token)
  return data
}

export async function getMeAPI() {
  return api.get('/api/auth/me')
}
