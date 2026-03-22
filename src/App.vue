<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const hideHeader = () => route.name === 'Login' || route.name === 'Otp'
</script>

<template>
  <div id="app" class="app-shell">
    <header v-if="!hideHeader()" class="admin-header">
      <div class="header-left">
        <div class="logo-pill">UNIFRANZ</div>
        <div class="app-title">Control Docente</div>
      </div>
      <nav class="header-nav">
        <router-link to="/panel" class="nav-link" active-class="active" exact>Inicio</router-link>
        <router-link to="/historial" class="nav-link" active-class="active">Historial</router-link>
      </nav>
      <div class="header-right">
        <span class="hello">Hola, <b>Admin</b></span>
        <router-link to="/" class="exit-btn">Salir →</router-link>
      </div>
    </header>

    <main class="content-area">
      <div class="page-shell">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800;900&display=swap');
:root{
  --orange-500: #ff7a1a;
  --orange-600: #ff6a00;
  --muted: #f5f7fb;
  --text: #1f2937;
  --header-h: 64px;
}

html,body,#app{ height:100%; margin:0; }
.app-shell{ font-family: 'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:var(--text); background:var(--muted) }

/* Header */
.admin-header{
  position:sticky; top:0; height:var(--header-h); display:flex; align-items:center; justify-content:space-between; padding:10px 24px; background:linear-gradient(90deg,var(--orange-600),var(--orange-500)); color:#fff; box-shadow: 0 4px 14px rgba(0,0,0,0.06); z-index:5
}
.header-left{ display:flex; align-items:center; gap:14px }
.logo-pill{ background:#fff; color:var(--orange-600); font-weight:900; border-radius:999px; padding:10px 16px; line-height:1; box-shadow: 0 2px 6px rgba(0,0,0,0.08) }
.app-title{ font-weight:800; font-size:20px; letter-spacing:0.3px }
.header-nav{ display:flex; gap:14px; margin-left:auto; margin-right:24px }
.nav-link{ color:#ffe; text-decoration:none; font-weight:700; opacity:.9 }
.nav-link.active{ text-decoration:underline }
.header-right{ display:flex; align-items:center; gap:12px }
.hello{ color:#fff }
.exit-btn{ background:#fff; color:var(--orange-600); padding:8px 14px; border-radius:10px; font-weight:800; text-decoration:none }

/* Full-width content */
.content-area{ padding:0; }
.page-shell{ width:100%; max-width:none; margin:0; padding:0 }

@media(max-width:900px){
  .app-title{ display:none }
  .header-nav{ display:none }
}
</style>
