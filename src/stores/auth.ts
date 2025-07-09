import { defineStore } from 'pinia'
import api from '@/services/api'

interface User {
  email: string
  token: string
}

const LOCAL_STORAGE_KEY = 'user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
    error: null as string | null
  }),
  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = null
      try {
        const res = await api.post('/login', { email, password })
        this.user = { email, token: res.data.token }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.user))
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Erro ao fazer login'
      } finally {
        this.loading = false
      }
    },
    async register(email: string, password: string) {
      this.loading = true
      this.error = null
      try {
        const res = await api.post('/register', { email, password })
        this.user = { email, token: res.data.token }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.user))
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Erro ao cadastrar'
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.user = null
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    },
    loadUserFromStorage() {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (data) {
        this.user = JSON.parse(data)
      }
    }
  }
})