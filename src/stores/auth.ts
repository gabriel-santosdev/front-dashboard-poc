// src/stores/auth.ts
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        this.error = error.message
      } else {
        this.user = data.user
      }
      this.loading = false
    },
    async register(email: string, password: string) {
      this.loading = true
      this.error = null
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        this.error = error.message
      } else {
        this.user = data.user
      }
      this.loading = false
    },
    async logout() {
      await supabase.auth.signOut()
      this.user = null
    },
    async fetchUser() {
      const { data } = await supabase.auth.getUser()
      this.user = data.user
    }
  }
})