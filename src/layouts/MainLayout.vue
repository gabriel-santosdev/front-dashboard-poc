<!-- src/layouts/MainLayout.vue -->
<template>
    <v-app>
        <v-navigation-drawer app v-model="drawer" permanent>
            <v-list>
                <v-list-item link :to="{ name: 'dashboard' }">
                    <v-list-item-icon><v-icon>mdi-view-dashboard</v-icon></v-list-item-icon>
                    <v-list-item-content><v-list-item-title>Dashboard</v-list-item-title></v-list-item-content>
                </v-list-item>
                <v-list-item link :to="{ name: 'despesas' }">
                    <v-list-item-icon><v-icon>mdi-cash-minus</v-icon></v-list-item-icon>
                    <v-list-item-content><v-list-item-title>Cadastrar Despesa</v-list-item-title></v-list-item-content>
                </v-list-item>
                <v-list-item link @click="logout">
                    <v-list-item-icon><v-icon>mdi-logout</v-icon></v-list-item-icon>
                    <v-list-item-content><v-list-item-title>Sair</v-list-item-title></v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-app-bar app color="secondary" dark>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        </v-app-bar>

        <v-main>
            <router-view />
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const drawer = ref(true)
const router = useRouter()
const auth = useAuthStore()

function logout() {
    auth.logout()
    router.push('/login')
}
</script>