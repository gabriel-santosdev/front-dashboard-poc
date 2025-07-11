<!-- src/layouts/MainLayout.vue -->
<template>
    <v-app>
        <v-navigation-drawer v-model="drawer" :rail="rail" permanent color="#f2f2f2" class="border-e"
            @click="rail = false">
            <!-- Usuário com botão de collapse -->
            <v-list>
                <v-list-item prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
                    :title="!rail ? 'Gabriel Santos' : ''">
                    <template #append>
                        <v-btn icon="mdi-chevron-left" variant="text" @click.stop="rail = !rail" />
                    </template>
                </v-list-item>
            </v-list>

            <v-divider />

            <!-- Menu de navegação -->
            <v-list density="compact" nav>
                <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" :to="{ name: 'dashboard' }" />
                <v-list-item prepend-icon="mdi-cash-plus" title="Despesas" :to="{ path: '/despesas/cadastrar' }" />
                <v-list-item prepend-icon="mdi-logout" title="Sair" @click="logout" />
            </v-list>
        </v-navigation-drawer>

        <v-main class="bg-grey-lighten-4">
            <v-container fluid class="py-6 px-4">
                <router-view />
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const drawer = ref(true)
const rail = ref(true)

const router = useRouter()
const auth = useAuthStore()

function logout() {
    auth.logout()
    router.push('/login')
}
</script>

<style scoped>
.v-list-item {
    font-weight: 500;
    color: #333;
}

.v-list-item--active {
    background-color: #e0e0e0 !important;
    border-radius: 8px;
}
</style>