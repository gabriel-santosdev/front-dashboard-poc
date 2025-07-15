<template>
    <v-container>
        <h1 class="mb-6">Minhas Despesas</h1>

        <!-- Botão para active de cadastro de despesa-->
        <v-btn color="primary" class="mb-6" fab dark fixed top left @click="modalCadastrar = true"
            aria-label="Cadastrar Despesa">
            <span class="sr-only">Cadastrar Despesa</span>
            <v-icon>mdi-plus</v-icon>
        </v-btn>

        <!-- Modal Cadastro Despesa -->
        <v-dialog v-model="modalCadastrar" max-width="500px" persistent theme="light">
            <v-card>
                <v-card-title class="d-flex align-center justify-space-between">
                    <span class="headline">Cadastrar Despesa</span>
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
        <v-dialog v-model="modalSuccess" max-width="400" theme="light">
            <v-card>
                <v-card-title class="headline">Despesa cadastrada</v-card-title>
                <v-card-text>A despesa foi cadastrada com sucesso!</v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="primary" text @click="modalSuccess = false">Fechar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Tabela de Despesas -->
        <v-data-table :items="despesasStore.despesas" :loading="despesasStore.loading" item-key="id"
            class="elevation-1 custom-table" theme="light" disable-sort :items-per-page="5">

            <template #headers>
                <tr>
                    <th>Valor</th>
                    <th>Conta Bancária</th>
                    <th>Tipo</th>
                    <th>Data</th>
                    <th>Ações</th>
                </tr>
            </template>
            <template #item="{ item }">
                <tr>
                    <td>R$ {{ item.valor.toFixed(2).replace('.', ',') }}</td>
                    <td>{{ item.conta }}</td>
                    <td>{{ item.tipo }}</td>
                    <td>{{ formatDate(item.data) }}</td>
                    <td class="d-flex ga-1 text-center align-center">
                        <v-btn size="small" @click="openEdit(item)">
                            <v-icon color="blue">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn size="small" @click="deleteDespesa(item.id)">
                            <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                    </td>
                </tr>
            </template>
        </v-data-table>

        <!-- Dialog Editar Despesa -->
        <v-dialog v-model="modalEdit" max-width="500" theme="light">
            <v-card>
                <v-card-title class="d-flex align-center justify-space-between">
                    <span class="headline">Editar Despesa</span>
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
        console.error(despesasStore.error)
        return
    }

    modalSuccess.value = true
    modalCadastrar.value = false

    // Reset dos campos
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

.v-btn.fixed {
    z-index: 10;
}

.custom-table {
    --v-theme-background: #fff;
    border-radius: 12px
}

.custom-table th {
    background-color: #f5f5f5;
    font-weight: 600;
    font-size: 14px;
    padding: 16px 12px;
    color: #333;
    border-bottom: 1px solid #e0e0e0;
}

.custom-table td {
    font-size: 14px;
    padding: 14px 12px;
    color: #444;
    border-bottom: 1px solid #f0f0f0;
}

.custom-table tr:hover td {
    background-color: #f9f9f9;
}
</style>