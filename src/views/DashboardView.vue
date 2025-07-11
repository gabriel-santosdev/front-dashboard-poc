<template>
    <v-container>
        <h1 class="text-h5 mb-4">Dashboard de Despesas</h1>

        <v-row>
            <v-col cols="12" md="6">
                <v-card class="pa-4">
                    <h2 class="text-subtitle-1 mb-2">Despesas por Tipo</h2>
                    <BarChart v-if="chartDataTipo" :chart-data="chartDataTipo" />
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card class="pa-4">
                    <h2 class="text-subtitle-1 mb-2">Despesas por Conta</h2>
                    <PieChart v-if="chartDataConta" :chart-data="chartDataConta" />
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDespesasStore } from '@/stores/despesas'

import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'

const auth = useAuthStore()
const despesasStore = useDespesasStore()

onMounted(() => {
    if (auth.user) {
        despesasStore.fetchDespesas(auth.user.id)
    }
})

// Agrupar despesas por tipo
const chartDataTipo = computed(() => {
    const grouped = despesasStore.despesas.reduce((acc, item) => {
        acc[item.tipo] = (acc[item.tipo] || 0) + Number(item.valor)
        return acc
    }, {} as Record<string, number>)

    return {
        labels: Object.keys(grouped),
        datasets: [{
            label: 'Total por Tipo',
            data: Object.values(grouped),
            backgroundColor: ['#6f00ff', '#31007f', '#4a148c', '#00bcd4', '#8bc34a']
        }]
    }
})

// Agrupar despesas por conta
const chartDataConta = computed(() => {
    const grouped = despesasStore.despesas.reduce((acc, item) => {
        acc[item.conta] = (acc[item.conta] || 0) + Number(item.valor)
        return acc
    }, {} as Record<string, number>)

    return {
        labels: Object.keys(grouped),
        datasets: [{
            label: 'Total por Conta',
            data: Object.values(grouped),
            backgroundColor: ['#673ab7', '#2196f3', '#009688', '#ff9800']
        }]
    }
})
</script>