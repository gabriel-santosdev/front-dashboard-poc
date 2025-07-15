<template>
    <v-container>
        <h1 class="text-h5 mb-6">Orçamento Mensal</h1>

        <!-- Seletor de mês/ano -->
        <v-row class="mb-6" justify="center">
            <v-col cols="12" sm="6" md="4" lg="3">
                <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y
                    min-width="auto">
                    <template #activator="{ props }">
                        <v-text-field v-model="mesAnoFormatado" label="Selecionar Mês/Ano"
                            prepend-inner-icon="mdi-calendar-month" readonly v-bind="props" dense outlined />
                    </template>
                    <v-date-picker v-model="mesAnoPicker" type="month" @update:model-value="onMesAnoChange" :max="hoje"
                        locale="pt-BR" />
                </v-menu>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12" md="4" v-for="tipo in tiposDespesa" :key="tipo">
                <v-card class="pa-4 mb-4" elevation="3" rounded>
                    <div class="d-flex justify-space-between align-center mb-4">
                        <h3 class="text-subtitle-1 font-weight-medium">{{ tipo }}</h3>

                        <v-text-field v-model="orcamentosMapStr[tipo]" label="Valor Máximo (R$)" type="text" dense
                            hide-details class="input-money" @blur="onSaveOrcamento(tipo)" />
                    </div>

                    <v-progress-linear :value="getProgress(tipo)" :color="progressColor(tipo)" height="14" rounded
                        striped animate background-color="#eee"></v-progress-linear>

                    <div class="mt-3 d-flex justify-space-between text-body-2">
                        <div>Gasto: <strong>{{ formatCurrency(gastosMap[tipo] || 0) }}</strong></div>
                        <div>Orçamento: <strong>{{ formatCurrency(parseCurrencyInput(orcamentosMapStr[tipo]) || 0)
                        }}</strong>
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <v-alert v-if="alertMessage" type="warning" border="left" prominent class="mb-6" elevation="2" rounded>
            {{ alertMessage }}
        </v-alert>
    </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDespesasStore } from '@/stores/despesas'
import { useOrcamentosStore } from '@/stores/orcamentos'

const auth = useAuthStore()
const despesasStore = useDespesasStore()
const orcamentosStore = useOrcamentosStore()

const tiposDespesa = ['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Outros']

const mesAnoPicker = ref(new Date().toISOString().slice(0, 7)) // YYYY-MM
const mesAno = ref(mesAnoPicker.value)
const menu = ref(false)

const orcamentosMapStr = reactive<Record<string, string>>({})
const gastosMap = ref<Record<string, number>>({})

const alertMessage = ref('')

const hoje = new Date().toISOString().slice(0, 10)

const mesAnoFormatado = computed(() => {
    const [year, month] = mesAno.value.split('-')
    const date = new Date(+year, +month - 1)
    return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
})

function onMesAnoChange(value: string) {
    mesAno.value = value
    menu.value = false
}

function carregarOrcamentos() {
    orcamentosStore.fetchOrcamentos(auth.user!.id, mesAno.value).then(() => {
        // Limpa o mapa de strings
        Object.keys(orcamentosMapStr).forEach(k => delete orcamentosMapStr[k])
        orcamentosStore.orcamentos.forEach(o => {
            orcamentosMapStr[o.tipo] = formatCurrencyInput(o.valorMaximo)
        })
    })
}

function calcularGastos() {
    gastosMap.value = {}
    despesasStore.despesas.forEach(d => {
        if (d.data.startsWith(mesAno.value)) {
            gastosMap.value[d.tipo] = (gastosMap.value[d.tipo] || 0) + d.valor
        }
    })
}

function getProgress(tipo: string) {
    const orcamento = parseCurrencyInput(orcamentosMapStr[tipo])
    if (!orcamento) return 0
    const gasto = gastosMap.value[tipo] || 0
    return Math.min((gasto / orcamento) * 100, 100)
}

function progressColor(tipo: string) {
    const orcamento = parseCurrencyInput(orcamentosMapStr[tipo])
    if (!orcamento) return 'grey'
    const progress = getProgress(tipo)
    if (progress > 100) return 'red darken-1'
    if (progress > 80) return 'orange darken-1'
    return '#388E3C' // verde forte
}

async function onSaveOrcamento(tipo: string) {
    const valor = parseCurrencyInput(orcamentosMapStr[tipo])
    if (valor <= 0) return

    try {
        await orcamentosStore.addOrcamento({
            user_id: auth.user!.id,
            tipo,
            valormaximo: valor,
            mesano: mesAno.value,
        })
        carregarOrcamentos() // Atualiza inputs com dados do backend
    } catch (error) {
        console.error('Erro ao salvar orçamento:', error)
        alertMessage.value = 'Erro ao salvar orçamento, tente novamente.'
    }
}

function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Converte número para string formatada "1.234,56"
function formatCurrencyInput(value: number) {
    if (!value && value !== 0) return ''
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

// Converte string "1.234,56" para número 1234.56
function parseCurrencyInput(value: string) {
    if (!value) return 0
    let cleaned = value.replace(/[^\d,]/g, '') // remove tudo que não seja dígito ou vírgula
    cleaned = cleaned.replace(',', '.') // troca vírgula por ponto
    return parseFloat(cleaned) || 0
}

watch(
    () => mesAno.value,
    () => {
        carregarOrcamentos()
        calcularGastos()
    }
)

watch(
    () => despesasStore.despesas,
    () => {
        calcularGastos()
    },
    { deep: true }
)

onMounted(() => {
    if (auth.user) {
        despesasStore.fetchDespesas(auth.user.id).then(() => {
            carregarOrcamentos()
            calcularGastos()
        })
    }
})
</script>

<style scoped>
.input-money input {
    text-align: right;
    font-weight: 600;
    font-size: 16px;
}

.v-progress-linear {
    transition: background-color 0.3s ease;
}

.v-alert {
    font-weight: 600;
}
</style>