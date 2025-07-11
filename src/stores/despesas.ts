import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export interface Despesa {
  id?: string
  user_id: string
  valor: number
  conta: string
  tipo: string
  data: string // ISO string
}

export const useDespesasStore = defineStore('despesas', {
  state: () => ({
    despesas: [] as Despesa[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchDespesas(userId: string) {
      this.loading = true
      this.error = null
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })

      if (error) {
        this.error = error.message
      } else {
        this.despesas = data as Despesa[]
      }
      this.loading = false
    },

    async addDespesa(despesa: Despesa) {
      this.loading = true
      this.error = null
      const { data, error } = await supabase
        .from('despesas')
        .insert([despesa])
        .select()

      if (error) {
        this.error = error.message
      } else if (data?.[0]) {
        this.despesas.unshift(data[0])
      }

      this.loading = false
    }
  }
})