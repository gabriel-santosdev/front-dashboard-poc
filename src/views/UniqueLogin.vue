<template>
    <v-container class="fill-height d-flex align-center justify-center" fluid>
        <v-img class="mx-auto my-6" max-width="228"
            src="https://cdn.vuetifyjs.com/docs/images/logos/vuetify-logo-v3-slim-text-light.svg"
            alt="Logo Cofrynho"></v-img>

        <v-card class="mx-auto pa-10 pb-8" elevation="8" max-width="448" min-height="560" rounded="lg">
            <h2 class="text-h6 font-weight-medium text-center mb-6">
                {{ isLogin ? 'Entrar na sua conta' : 'Criar nova conta' }}
            </h2>

            <!-- Email -->
            <div class="text-subtitle-1 text-medium-emphasis mb-1">Email</div>
            <v-text-field v-model="email" density="compact" placeholder="Seu email"
                prepend-inner-icon="mdi-email-outline" variant="outlined" hide-details></v-text-field>

            <!-- Senha -->
            <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between mt-4 mb-1">
                Senha
            </div>
            <v-text-field v-model="password" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="showPassword ? 'text' : 'password'" density="compact" placeholder="Sua senha"
                prepend-inner-icon="mdi-lock-outline" variant="outlined"
                @click:append-inner="showPassword = !showPassword" hide-details></v-text-field>

            <!-- Alerta de erro -->
            <v-card v-if="auth.error" class="my-6" color="red-lighten-4" variant="tonal">
                <v-card-text class="text-error text-caption">
                    {{ auth.error }}
                </v-card-text>
            </v-card>

            <!-- Botão -->
            <v-btn :loading="auth.loading" @click="submit" class="mb-6" color="primary" size="large" variant="flat"
                block>
                {{ isLogin ? 'Entrar' : 'Cadastrar' }}
            </v-btn>

            <!-- Rodapé -->
            <v-card-text class="text-center text-caption">
                <span>{{ isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?' }}</span>
                <router-link :to="isLogin ? '/register' : '/login'"
                    class="text-primary text-decoration-none font-weight-medium">
                    {{ isLogin ? 'Cadastre-se agora' : 'Entrar' }}
                    <v-icon icon="mdi-chevron-right" size="small" />
                </router-link>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const isLogin = route.path === '/login'

async function submit() {
    if (isLogin) {
        await auth.login(email.value, password.value)
    } else {
        await auth.register(email.value, password.value)
    }

    if (auth.user && !auth.error) {
        router.push('/dashboard')
    }
}
</script>

<style scoped>
.v-container {
    background: linear-gradient(to right, #f7f7fb, #ecebff);
}
</style>
