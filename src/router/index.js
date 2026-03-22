import { createRouter, createWebHistory } from 'vue-router'
import RegistroRecuperatorio from '../components/RegistroRecuperatorio.vue'
import HistorialPage from '../components/HistorialPage.vue'
import BienPage from '../components/BienPage.vue'
import Login from '../components/Login.vue'
import OtpVerify from '../components/OtpVerify.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/otp', name: 'Otp', component: OtpVerify },
  { path: '/panel', name: 'Bien', component: BienPage },
  { path: '/registro', name: 'Registro', component: RegistroRecuperatorio },
  { path: '/historial', name: 'Historial', component: HistorialPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
