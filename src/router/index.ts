import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards/authGuard'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import CadastrarDespesasView from '@/views/CadastrarDespesasView.vue'

const routes = [
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'dashboard', component: DashboardView },
      {
        path: '/despesas/cadastrar',
        component: CadastrarDespesasView,
        meta: { requiresAuth: true }
      }
    ]
  },
  { path: '/dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true } },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Aplica o guard global
router.beforeEach(authGuard)

export default router