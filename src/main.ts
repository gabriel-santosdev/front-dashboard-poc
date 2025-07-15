// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { pt }from 'vuetify/locale'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// Estilos adicionais, se necessário
import 'unfonts.css'

const vuetify = createVuetify({
  locale:{
    locale: 'pt',
    messages: {pt}
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  },
  theme: {
    defaultTheme: 'dark'
  }
})

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(vuetify)

const auth = useAuthStore()
auth.fetchUser()

app.mount('#app')