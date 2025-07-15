<template>
    <v-container>
        <h1 class="text-h5 font-weight-bold mb-6">Dashboard de Despesas</h1>

        <v-row dense justify="start" align="center" class="mb-6">
            <v-col cols="12" sm="4" md="3" lg="2">
                <v-sheet class="pa-6 text-center" elevation="2" rounded outlined>
                    <div class="text-subtitle-2 font-weight-medium mb-2 text-secondary">Total de Despesas</div>
                    <div class="text-h5 font-weight-bold">R$ {{ totalValor.toFixed(2).replace('.', ',') }}</div>
                </v-sheet>
            </v-col>

            <v-col cols="12" sm="4" md="3" lg="2">
                <v-sheet class="pa-6 text-center" elevation="2" rounded outlined>
                    <div class="text-subtitle-2 font-weight-medium mb-2 text-secondary">Tipos de Despesa</div>
                    <div class="text-h5 font-weight-bold">{{ tiposCount }}</div>
                </v-sheet>
            </v-col>

            <v-col cols="12" sm="4" md="3" lg="2">
                <v-sheet class="pa-6 text-center" elevation="2" rounded outlined>
                    <div class="text-subtitle-2 font-weight-medium mb-2 text-secondary">Contas Utilizadas</div>
                    <div class="text-h5 font-weight-bold">{{ contasCount }}</div>
                </v-sheet>
            </v-col>
        </v-row>


        <v-row align="center" no-gutters>
            <v-col cols="12" sm="6" md="4" lg="3">
                <v-select v-model="periodFilter" :items="periodOptions" label="Filtrar por período" dense outlined
                    clearable prepend-inner-icon="mdi-calendar-filter" item-title="label" item-value="value"
                    hide-details />
            </v-col>
        </v-row>


        <v-row dense>
            <v-col cols="12" sm="6">
                <v-card class="pa-6" elevation="2" rounded outlined>
                    <h2 class="text-subtitle-1 font-weight-medium mb-2">Despesas por Tipo</h2>
                    <div class="text-caption mb-4 text-secondary">Período: {{ periodLabel }}</div>
                    <BarChart v-if="chartDataTipo" :chart-data="chartDataTipo" />
                    <v-skeleton-loader v-else type="card" class="mx-auto" :loading="loading" style="height: 200px;" />
                </v-card>
            </v-col>

            <v-col cols="12" sm="6">
                <v-card class="pa-6" elevation="2" rounded outlined>
                    <h2 class="text-subtitle-1 font-weight-medium mb-2">Despesas por Conta</h2>
                    <div class="text-caption mb-4 text-secondary">Período: {{ periodLabel }}</div>
                    <PieChart v-if="chartDataConta" :chart-data="chartDataConta" />
                    <v-skeleton-loader v-else type="card" class="mx-auto" :loading="loading" style="height: 200px;" />
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDespesasStore } from '@/stores/despesas'

import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'

import {
    startOfYear,
    startOfMonth,
    startOfWeek,
    startOfDay,
    isAfter,
    parseISO,
} from 'date-fns'

const auth = useAuthStore()
const despesasStore = useDespesasStore()

const loading = ref(true)

const periodFilter = ref('anual')
const periodOptions = [
    { label: 'Anual', value: 'anual' },
    { label: 'Mensal', value: 'mensal' },
    { label: 'Semanal', value: 'semanal' },
    { label: 'Diário', value: 'diario' },
]

const periodLabel = computed(() => {
    const opt = periodOptions.find((o) => o.value === periodFilter.value)
    return opt ? opt.label : ''
})

onMounted(async () => {
    if (auth.user) {
        loading.value = true
        await despesasStore.fetchDespesas(auth.user.id)
        loading.value = false
    }
})

const despesasFiltradas = computed(() => {
    if (!despesasStore.despesas.length) return []

    const now = new Date()
    let periodStart = startOfYear(now)

    switch (periodFilter.value) {
        case 'anual':
            periodStart = startOfYear(now)
            break
        case 'mensal':
            periodStart = startOfMonth(now)
            break
        case 'semanal':
            periodStart = startOfWeek(now, { weekStartsOn: 1 })
            break
        case 'diario':
            periodStart = startOfDay(now)
            break
    }

    return despesasStore.despesas.filter((d) => {
        const dataDespesa = parseISO(d.data)
        return (
            isAfter(dataDespesa, periodStart) || dataDespesa.getTime() === periodStart.getTime()
        )
    })
})

const chartDataTipo = computed(() => {
    const grouped = despesasFiltradas.value.reduce((acc, item) => {
        acc[item.tipo] = (acc[item.tipo] || 0) + Number(item.valor)
        return acc
    }, {} as Record<string, number>)

    return {
        labels: Object.keys(grouped),
        datasets: [
            {
                label: 'Total por Tipo',
                data: Object.values(grouped),
                backgroundColor: ['#6f00ff', '#31007f', '#4a148c', '#00bcd4', '#8bc34a'],
            },
        ],
    }
})

const chartDataConta = computed(() => {
    const grouped = despesasFiltradas.value.reduce((acc, item) => {
        acc[item.conta] = (acc[item.conta] || 0) + Number(item.valor)
        return acc
    }, {} as Record<string, number>)

    return {
        labels: Object.keys(grouped),
        datasets: [
            {
                label: 'Total por Conta',
                data: Object.values(grouped),
                backgroundColor: ['#673ab7', '#2196f3', '#009688', '#ff9800'],
            },
        ],
    }
})

const totalValor = computed(() =>
    despesasFiltradas.value.reduce((acc, cur) => acc + Number(cur.valor), 0)
)

const tiposCount = computed(() => {
    const tipos = new Set(despesasFiltradas.value.map((d) => d.tipo))
    return tipos.size
})

const contasCount = computed(() => {
    const contas = new Set(despesasFiltradas.value.map((d) => d.conta))
    return contas.size
})
</script>

<style scoped>
.text-secondary {
    color: #555 !important;
}

.v-select {
    max-width: 320px;
}
</style>