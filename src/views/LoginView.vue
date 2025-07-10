<template>
    <v-container fluid class="fill-height pa-0">
        <v-row no-gutters>
            <!-- Imagem à esquerda -->
            <v-col cols="12" md="6" class="d-none d-md-flex align-center justify-center"
                style="background: linear-gradient(to right, #6f00ff, #31007f);">
                <v-img src="https://cdn.pixabay.com/photo/2021/08/06/13/12/login-6529324_960_720.png" max-width="70%"
                    class="elevation-4" />
            </v-col>

            <!-- Formulário à direita -->
            <v-col cols="12" md="6" class="d-flex align-center justify-center pa-10">
                <v-card elevation="4" class="pa-6" max-width="400" width="100%">
                    <h2 class="text-h5 mb-4 text-center">Entrar na sua conta</h2>
                    <v-form @submit.prevent="submit">
                        <v-text-field v-model="email" label="Email" type="email" required />
                        <v-text-field v-model="password" :type="showPassword ? 'text' : 'password'" label="Senha"
                            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                            @click:append-inner="showPassword = !showPassword" required />
                        <v-btn block type="submit" :loading="auth.loading" color="primary" class="mt-2">
                            Entrar
                        </v-btn>
                        <v-alert v-if="auth.error" type="error" class="mt-3" border="start" border-color="error">
                            {{ auth.error }}
                        </v-alert>
                    </v-form>
                    <div class="mt-4 text-center">
                        <span>Não tem conta?</span>
                        <router-link to="/register">Cadastre-se</router-link>
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

async function submit() {
    await auth.login(email.value, password.value)
    if (auth.user) router.push('/dashboard')
}

watch(() => auth.user, (user) => {
    if (user) router.push('/dashboard')
})
</script>