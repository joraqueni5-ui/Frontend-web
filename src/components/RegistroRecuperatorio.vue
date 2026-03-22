<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHorarioActual, registrarAsistencia, getAsistencias } from '../api/controlAsistencia'

const router = useRouter()

// helper: default local datetime for input type=datetime-local
const defaultLocalDatetime = () => {
  const dt = new Date()
  const pad = (n) => (n < 10 ? '0' + n : '' + n)
  return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()) + 'T' + pad(dt.getHours()) + ':' + pad(dt.getMinutes())
}

// Campos (v-model)
const estado = ref('Retraso')
const observaciones = ref('')
const fechaHora = ref(defaultLocalDatetime())

// Info horario actual
const horarioActual = ref(null)
const asistencias = ref([])
const loading = ref(false)

onMounted(async () => {
  await cargarHorarioYAsistencias()
})

async function cargarHorarioYAsistencias() {
  loading.value = true
  try {
    let idHorario = Number(localStorage.getItem('idHorarioActual'))
    if (!idHorario) {
      const data = await getHorarioActual()
      horarioActual.value = data
      idHorario = data?.idHorario ? Number(data.idHorario) : 0
      if (idHorario) localStorage.setItem('idHorarioActual', String(idHorario))
    } else {
      const data = await getHorarioActual()
      horarioActual.value = data
    }
    if (idHorario) {
      const res = await getAsistencias(idHorario)
      const detalles = res?.detalles || res?.items || res || []
      asistencias.value = Array.isArray(detalles) ? detalles : []
    }
  } catch (e) {
    console.warn('No se pudo cargar datos', e)
  } finally {
    loading.value = false
  }
}

async function registrar() {
  loading.value = true
  try {
    const idHorario = Number(localStorage.getItem('idHorarioActual'))
    if (!idHorario) throw new Error('No hay idHorario disponible')
    const res = await registrarAsistencia({ idHorario, estado: estado.value, observaciones: observaciones.value })
    alert(res?.mensaje || 'Asistencia registrada')
    await cargarHorarioYAsistencias()
  } catch (e) {
    alert(e.message || 'Error al registrar')
  } finally {
    loading.value = false
  }
}

function getDocenteName(rec) {
  return rec?.docenteNombre || rec?.docenteId || 'Docente'
}
function getMateriaName(rec) {
  return rec?.materia || rec?.materiaId || 'Materia'
}
function formatDate(rec) {
  const f = rec?.fecha || rec?.createdAt
  const date = f ? new Date(f) : new Date()
  try { return date.toLocaleString() } catch { return '' }
}
</script>

<template>
  <div class="control-page">
    <header class="topbar">
      <div class="brand-area">
        <div class="brand-logo">UNIFRANZ</div>
        <div class="brand-title">Registro Recuperatorio</div>
      </div>
      <div class="top-actions">
        <button class="btn historial-btn" @click="() => router.push({ name: 'Historial' })">Historial</button>
      </div>
    </header>

    <main class="container">
      <div class="card control-card">
        <div class="card-head">
          <h2>Clase activa</h2>
          <p class="muted" v-if="horarioActual">{{ horarioActual.materia }} - {{ horarioActual.docenteNombre }} - {{ horarioActual.aulaNombre }}</p>
          <p class="muted" v-else>No hay clase activa</p>
        </div>

        <div class="filters">
          <div class="filter">
            <label>Fecha</label>
            <input type="datetime-local" v-model="fechaHora" readonly class="filter-input" />
          </div>
          <div class="filter">
            <label>Estado</label>
            <select v-model="estado" class="filter-input">
              <option>Presente</option>
              <option>Retraso</option>
              <option>Ausente</option>
              <option>Licencia</option>
            </select>
          </div>
          <div class="filter">
            <label>Observaciones</label>
            <input v-model="observaciones" class="filter-input" placeholder="Opcional" />
          </div>
          <div class="filter action-filter">
            <label>&nbsp;</label>
            <button class="btn primary" :disabled="loading" @click.prevent="registrar">Registrar asistencia</button>
          </div>
        </div>

        <section class="table-section">
          <table class="main-table">
            <thead>
              <tr>
                <th>DOCENTE</th>
                <th>MATERIA</th>
                <th>ESTADO</th>
                <th>FECHA</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!asistencias.length">
                <td colspan="4" class="empty">No hay registros para este horario</td>
              </tr>
              <tr v-for="rec in asistencias" :key="rec.idAsistencia" class="row-item">
                <td>{{ getDocenteName(rec) }}</td>
                <td>{{ getMateriaName(rec) }}</td>
                <td>{{ rec.estado }}</td>
                <td>{{ formatDate(rec) }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </main>
  </div>
</template>

<style>
:root { --naranja: #ff6a00; --naranja-dark: #f26522; --muted: #f8f6f4 }
*{box-sizing:border-box}
body{font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:var(--naranja);color:#fff}
.brand-area{display:flex;flex-direction:column}
.brand-logo{font-weight:900}
.brand-title{font-size:14px}
.container{padding:18px}
.control-card{background:#fff;border-radius:8px;padding:18px;box-shadow:0 8px 30px rgba(0,0,0,0.06)}
.card-head h2{margin:0;font-size:22px}
.card-head .muted{color:#666;margin-top:6px}
.filters{display:flex;gap:12px;margin:14px 0;align-items:end}
.filter{display:flex;flex-direction:column}
.filter label{font-weight:800;color:#333;font-size:13px;margin-bottom:6px}
.filter-input{padding:10px;border-radius:8px;border:1px solid rgba(0,0,0,0.08)}
.action-filter .btn{height:42px}
.totals-row{display:flex;gap:12px;margin:12px 0}
.total{background:linear-gradient(90deg, #fff, #fff);border-radius:8px;padding:12px 16px;flex:1;border:1px solid rgba(0,0,0,0.04);font-weight:800}
.total span{display:block;font-size:20px;margin-top:6px;color:var(--naranja)}
.content-area{display:flex;gap:18px;align-items:flex-start}
.form-section{width:320px}
.mini-form{display:flex;flex-direction:column;gap:8px}
.mini-input{padding:10px;border-radius:8px;border:1px solid rgba(0,0,0,0.06)}
.mini-actions{display:flex;gap:8px;margin-top:10px}
.table-section{flex:1}
.main-table{width:100%;border-collapse:collapse;background:#fff}
.main-table thead th{background:#fbf7f6;padding:12px;text-align:left;border-bottom:1px solid rgba(0,0,0,0.06);font-weight:800}
.main-table tbody td{padding:12px;border-bottom:1px solid rgba(0,0,0,0.04)}
.empty{text-align:center;padding:20px;color:#777}
.side-actions{display:flex;flex-direction:column;gap:12px;width:160px}
.btn{border:none;padding:10px 14px;border-radius:8px;cursor:pointer;font-weight:800}
.btn.primary{background:linear-gradient(90deg,var(--naranja-dark),var(--naranja));color:#000}
.btn.danger{background:#fff1f0;color:#a61b1b;border:1px solid rgba(166,27,27,0.08)}
.btn.side{background:#fff;border:1px solid rgba(0,0,0,0.06);height:48px}
.historial-btn{background:linear-gradient(90deg,var(--naranja-dark),var(--naranja));color:#fff;border:none;padding:8px 14px;border-radius:20px;font-weight:800;cursor:pointer}
@media (max-width:900px){.content-area{flex-direction:column}.form-section{width:100%}.side-actions{flex-direction:row;width:100%;justify-content:space-around}}
</style>
