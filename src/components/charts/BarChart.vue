<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

defineProps<{ chartData: any }>()
</script>

<template>
    <Bar :data="chartData" :options="{ responsive: true, plugins: { legend: { position: 'top' } } }" />
</template>