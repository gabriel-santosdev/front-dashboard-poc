<template>
    <v-container>
        <h1>Dashboard</h1>
        <p>Bem-vindo, {{ auth.user?.email }}</p>
        <v-btn color="error" @click="logout">Sair</v-btn>
    </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function logout() {
    auth.logout()
    router.push('/login')
}
</script>