<template>
    <v-container>
        <h1 class="mb-6">Minhas Despesas</h1>

        <!-- Botão para abrir modal de cadastro -->
        <v-btn color="primary" class="mb-6" fab dark fixed top left @click="modalCadastrar = true"
            aria-label="Cadastrar Despesa">
            <span class="sr-only">Cadastrar Despesa</span>
            <v-icon>mdi-plus</v-icon>
        </v-btn>

        <!-- Modal Cadastro Despesa -->
        <v-dialog v-model="modalCadastrar" max-width="500px" persistent>
            <v-card>
                <v-card-title>
                    <span class="headline">Cadastrar Despesa</span>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="modalCadastrar = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <v-form ref="formRef" @submit.prevent="submit" lazy-validation>
                        <v-text-field v-model="valor" label="Valor" type="number" min="0" prefix="R$" required />
                        <v-select v-model="conta" :items="contas" label="Conta Bancária" required />
                        <v-select v-model="tipoDespesa" :items="tiposDespesa" label="Tipo de Despesa" required />
                        <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y
                            min-width="auto">
                            <template #activator="{ props }">
                                <v-text-field v-model="formattedDate" label="Data" readonly v-bind="props" required />
                            </template>
                            <v-date-picker v-model="date" @update:model-value="menu = false" :max="today" />
                        </v-menu>

                        <v-btn type="submit" color="primary" class="mt-4" :loading="despesasStore.loading" block>
                            Salvar
                        </v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Modal sucesso -->
        <v-dialog v-model="modalSuccess" max-width="400">
            <v-card>
                <v-card-title class="headline">Despesa cadastrada</v-card-title>
                <v-card-text>A despesa foi cadastrada com sucesso!</v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="primary" text @click="modalSuccess = false">Fechar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <v-data-table :items="despesasStore.despesas" :loading="despesasStore.loading" class="elevation-1" item-key="id"
            theme="light" disable-sort>

            <template #headers>
                <tr>
                    <th v-for="header in headers" :key="header.value">{{ header.text }}</th>
                </tr>
            </template>
            <template #item.valor="{ item }">
                R$ {{ item.valor.toFixed(2).replace('.', ',') }}
            </template>

            <template #item.data="{ item }">
                {{ formatDate(item.data) }}
            </template>

            <template #item.actions="{ item }">
                <v-btn @click="openEdit(item)">
                    <v-icon color="blue">mdi-pencil</v-icon>
                </v-btn>
                <v-btn @click="deleteDespesa(item.id)">
                    <v-icon color="red">mdi-delete</v-icon>
                </v-btn>
            </template>
        </v-data-table>

        <!-- Dialog Editar Despesa -->
        <v-dialog v-model="modalEdit" max-width="500">
            <v-card>
                <v-card-title>
                    <span class="headline">Editar Despesa</span>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="modalEdit = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-form ref="editFormRef" lazy-validation>
                        <v-text-field v-model="editValor" label="Valor" type="number" min="0" prefix="R$" required />
                        <v-select v-model="editConta" :items="contas" label="Conta Bancária" required />
                        <v-select v-model="editTipoDespesa" :items="tiposDespesa" label="Tipo de Despesa" required />
                        <v-menu v-model="menuEdit" :close-on-content-click="false" transition="scale-transition"
                            offset-y min-width="auto">
                            <template #activator="{ props }">
                                <v-text-field v-model="formattedEditDate" label="Data" readonly v-bind="props"
                                    required />
                            </template>
                            <v-date-picker v-model="editDate" @update:model-value="menuEdit = false" :max="today" />
                        </v-menu>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="modalEdit = false">Cancelar</v-btn>
                    <v-btn color="primary" text @click="submitEdit" :loading="despesasStore.loading">
                        Salvar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDespesasStore, Despesa } from '@/stores/despesas'

const auth = useAuthStore()
const despesasStore = useDespesasStore()


// Cadastro modal
const modalCadastrar = ref(false)

// Cadastro form fields
const valor = ref<number | null>(null)
const conta = ref<string | null>(null)
const tipoDespesa = ref<string | null>(null)
const date = ref<Date | null>(new Date())
const menu = ref(false)
const formRef = ref()

// Dados para selects
const contas = ['Itau', 'Bradesco', 'Banco do Brasil', 'Santander']
const tiposDespesa = ['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Outros']

const modalSuccess = ref(false)

// Tabela headers
const headers = ref([
    { text: 'Valor', key: 'valor' },
    { text: 'Conta Bancária', key: 'conta' },
    { text: 'Tipo', key: 'tipo' },
    { text: 'Data', key: 'data' },
    { text: 'Ações', key: 'actions' }
])

const formattedDate = computed(() =>
    date.value ? new Intl.DateTimeFormat('pt-BR').format(date.value) : ''
)

const today = new Date().toISOString().substr(0, 10)

// Edit modal
const modalEdit = ref(false)
const editFormRef = ref()
const editId = ref<string | null>(null)
const editValor = ref<number | null>(null)
const editConta = ref<string | null>(null)
const editTipoDespesa = ref<string | null>(null)
const editDate = ref<Date | null>(new Date())
const menuEdit = ref(false)
const formattedEditDate = computed(() =>
    editDate.value ? new Intl.DateTimeFormat('pt-BR').format(editDate.value) : ''
)

onMounted(() => {
    if (auth.user) {
        despesasStore.fetchDespesas(auth.user.id)
    }
})

async function submit() {
    if (!formRef.value?.validate() || !auth.user) return

    await despesasStore.addDespesa({
        user_id: auth.user.id,
        valor: valor.value!,
        conta: conta.value!,
        tipo: tipoDespesa.value!,
        data: date.value!.toISOString()
    })

    if (despesasStore.error) {
        // Pode mostrar uma snackbar ou alert
        console.error(despesasStore.error)
        return
    }

    modalSuccess.value = true
    modalCadastrar.value = false

    // Resetar campos
    valor.value = null
    conta.value = null
    tipoDespesa.value = null
    date.value = new Date()
}

function formatDate(dateString: string) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString))
}

async function deleteDespesa(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return
    await despesasStore.deleteDespesa(id)
}

function openEdit(despesa: Despesa) {
    editId.value = despesa.id
    editValor.value = despesa.valor
    editConta.value = despesa.conta
    editTipoDespesa.value = despesa.tipo
    editDate.value = new Date(despesa.data)
    modalEdit.value = true
}

async function submitEdit() {
    if (!editFormRef.value?.validate() || !editId.value) return

    await despesasStore.updateDespesa({
        id: editId.value,
        user_id: auth.user!.id,
        valor: editValor.value!,
        conta: editConta.value!,
        tipo: editTipoDespesa.value!,
        data: editDate.value!.toISOString()
    })

    if (despesasStore.error) {
        console.error(despesasStore.error)
        return
    }

    modalEdit.value = false
}
</script>

<style scoped>
h1 {
    font-weight: 600;
}

/* Ajuste para botão flutuante no topo direito */
.v-btn.fixed {
    z-index: 10;
}
</style>