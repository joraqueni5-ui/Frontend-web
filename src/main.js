import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
// Silenciar advertencias de Vue en desarrollo para evitar ruido en consola
app.config.warnHandler = () => {}
app.config.errorHandler = (err, instance, info) => {
  // enviar errores a la consola pero evitar duplicados de advertencias
  console.error(err, info)
}

app.use(router).mount('#app')
