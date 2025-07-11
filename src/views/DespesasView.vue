<template>
    <v-container>
        <h1>Cadastrar Despesa</h1>
        <v-form @submit.prevent="submit" ref="formRef" lazy-validation>
            <v-text-field label="Valor" v-model="valor" type="number" min="0" required prefix="R$" />

            <v-select label="Conta Bancária" v-model="conta" :items="contas" required />

            <v-select label="Tipo de Despesa" v-model="tipoDespesa" :items="tiposDespesa" required />

            <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y
                min-width="auto">
                <template #activator="{ props }">
                    <v-text-field v-model="formattedDate" label="Data" readonly v-bind="props" required />
                </template>
                <v-date-picker v-model="date" @update:model-value="menu = false" />
            </v-menu>

            <v-btn type="submit" color="primary" class="mt-4">Salvar</v-btn>
        </v-form>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDespesasStore } from '@/stores/despesas'

const auth = useAuthStore()
const despesasStore = useDespesasStore()


// -----------------------
// Campos do formulário
// -----------------------
const valor = ref<number | null>(null)
const conta = ref<string | null>(null)
const tipoDespesa = ref<string | null>(null)
const date = ref<Date | null>(new Date())

// -----------------------
// Menu de data
// -----------------------
const menu = ref(false)
const formRef = ref()

const formattedDate = computed(() =>
    date.value
        ? new Intl.DateTimeFormat('pt-BR').format(date.value)
        : ''
)

// -----------------------
// Listas
// -----------------------
const contas = ['Itau', 'Bradesco', 'Banco do Brasil', 'Santander']
const tiposDespesa = ['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Outros']

// -----------------------
// Submissão
// -----------------------
async function submit() {
    if (!formRef.value?.validate() || !auth.user) return

    const novaDespesa = {
        user_id: auth.user.id,
        valor: valor.value!,
        conta: conta.value!,
        tipo: tipoDespesa.value!,
        data: date.value!.toISOString()
    }

    await despesasStore.addDespesa(novaDespesa)

    if (despesasStore.error) {
        alert(`Erro ao salvar: ${despesasStore.error}`)
    } else {
        alert('Despesa cadastrada com sucesso!')
        valor.value = null
        conta.value = null
        tipoDespesa.value = null
        date.value = new Date()
    }
}
</script>