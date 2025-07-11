import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface Despesa {
  id: string
  user_id: string
  valor: number
  conta: string
  tipo: string
  data: string
}

export const useDespesasStore = defineStore('despesas', () => {
  const despesas = ref<Despesa[]>([])
  const error = ref<string | null>(null)
  const loading = ref(false)

  async function fetchDespesas(userId: string) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('despesas')
        .select('valor, conta, tipo, data')
        .eq('user_id', userId)
        .order('data', { ascending: false })

      if (err) throw err
      despesas.value = data || []
    } catch (e: any) {
      error.value = e.message || 'Erro ao carregar despesas'
    } finally {
      loading.value = false
    }
  }

  async function addDespesa(despesa: Omit<Despesa, 'id'>) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('despesas')
        .insert([despesa])
        .select()
        .single()

      if (err) throw err
      despesas.value.unshift(data)
    } catch (e: any) {
      error.value = e.message || 'Erro ao adicionar despesa'
    } finally {
      loading.value = false
    }
  }

  async function updateDespesa(despesa: Despesa) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('despesas')
        .update({
          valor: despesa.valor,
          conta: despesa.conta,
          tipo: despesa.tipo,
          data: despesa.data
        })
        .eq('id', despesa.id)
        .select()
        .single()

      if (err) throw err

      const index = despesas.value.findIndex(d => d.id === despesa.id)
      if (index !== -1) {
        despesas.value[index] = data
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao atualizar despesa'
    } finally {
      loading.value = false
    }
  }

  async function deleteDespesa(id: string) {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id)

      if (err) throw err

      despesas.value = despesas.value.filter(d => d.id !== id)
    } catch (e: any) {
      error.value = e.message || 'Erro ao deletar despesa'
    } finally {
      loading.value = false
    }
  }

  return {
    despesas,
    error,
    loading,
    fetchDespesas,
    addDespesa,
    updateDespesa,
    deleteDespesa
  }
})