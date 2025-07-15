import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface Orcamento {
  id: string
  user_id: string
  tipo: string
  valormaximo: number
  mesano: string // exemplo: '2025-07'
  created_at?: string
  updated_at?: string
}

export const useOrcamentosStore = defineStore('orcamentos', () => {
  const orcamentos = ref<Orcamento[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchOrcamentos(userId: string, mesano?: string) {
    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from('orcamentos')
        .select('*')
        .eq('user_id', userId)

      if (mesano) {
        query = query.eq('mesano', mesano)
      }

      const { data, error: err } = await query.order('mesano', { ascending: false })

      if (err) throw err
      orcamentos.value = data || []
    } catch (e: any) {
      error.value = e.message || 'Erro ao buscar orçamentos'
    } finally {
      loading.value = false
    }
  }

  async function addOrcamento(orcamento: Omit<Orcamento, 'id' | 'created_at' | 'updated_at'>) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('orcamentos')
        .upsert([orcamento], { onConflict: ['user_id', 'tipo', 'mesano'] })
        .select()
        .single()

      if (err) throw err
      orcamentos.value.unshift(data)
    } catch (e: any) {
      error.value = e.message || 'Erro ao adicionar orçamento'
    } finally {
      loading.value = false
    }
  }

  async function updateOrcamento(orcamento: Orcamento) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('orcamentos')
        .update({
          tipo: orcamento.tipo,
          valormaximo: orcamento.valormaximo,
          mesano: orcamento.mesano,
          updated_at: new Date().toISOString()
        })
        .eq('id', orcamento.id)
        .select()
        .single()

      if (err) throw err
      const index = orcamentos.value.findIndex(o => o.id === orcamento.id)
      if (index !== -1) {
        orcamentos.value[index] = data
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao atualizar orçamento'
    } finally {
      loading.value = false
    }
  }

  async function deleteOrcamento(id: string) {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', id)

      if (err) throw err
      orcamentos.value = orcamentos.value.filter(o => o.id !== id)
    } catch (e: any) {
      error.value = e.message || 'Erro ao deletar orçamento'
    } finally {
      loading.value = false
    }
  }

  return {
    orcamentos,
    loading,
    error,
    fetchOrcamentos,
    addOrcamento,
    updateOrcamento,
    deleteOrcamento,
  }
})