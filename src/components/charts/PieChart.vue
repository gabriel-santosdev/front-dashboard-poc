<script setup lang="ts">
import { Pie } from 'vue-chartjs'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

defineProps<{ chartData: any }>()
</script>

<template>
    <Pie :data="chartData" :options="{ responsive: true, plugins: { legend: { position: 'right' } } }" />
</template>