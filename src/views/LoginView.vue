<template>
    <v-container class="fill-height d-flex align-center justify-center" fluid>
        <v-img class="mx-auto my-6" max-width="228"
            src="https://cdn.vuetifyjs.com/docs/images/logos/vuetify-logo-v3-slim-text-light.svg"
            alt="Logo Cofrynho"></v-img>

        <v-card class="mx-auto pa-10 pb-8" elevation="8" max-width="448" rounded="lg">
            <div class="text-subtitle-1 text-medium-emphasis mb-2">Email</div>
            <v-text-field v-model="email" density="compact" placeholder="Seu email"
                prepend-inner-icon="mdi-email-outline" variant="outlined" hide-details></v-text-field>

            <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between mt-4 mb-1">
                Senha
            </div>

            <v-text-field v-model="password" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="showPassword ? 'text' : 'password'" density="compact" placeholder="Sua senha"
                prepend-inner-icon="mdi-lock-outline" variant="outlined"
                @click:append-inner="showPassword = !showPassword" hide-details></v-text-field>

            <v-card v-if="auth.error" class="my-6" color="red-lighten-4" variant="tonal">
                <v-card-text class="text-error text-caption">
                    {{ auth.error }}
                </v-card-text>
            </v-card>

            <v-btn :loading="auth.loading" @click="submit" class="mb-6 mt-6" color="primary" size="large" variant="flat"
                block>
                Entrar
            </v-btn>

            <v-card-text class="text-center text-caption">
                Não tem uma conta?
                <router-link to="/register" class="text-primary text-decoration-none font-weight-medium">
                    Cadastre-se agora
                    <v-icon icon="mdi-chevron-right" size="small"></v-icon>
                </router-link>
            </v-card-text>
        </v-card>
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

watch(
    () => auth.user,
    (user) => {
        if (user) router.push('/dashboard')
    }
)
</script>

<style scoped>
.v-container {
    background: linear-gradient(to right, #f7f7fb, #ecebff);
}
</style>