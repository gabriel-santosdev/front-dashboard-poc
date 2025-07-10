import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import { authGuard } from './guards/authGuard'

const routes = [
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Aplica o guard global
router.beforeEach(authGuard)

export default router