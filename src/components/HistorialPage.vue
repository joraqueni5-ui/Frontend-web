<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAsistencias } from '../api/controlAsistencia'

defineOptions({ name: 'HistorialPage' })

const router = useRouter()
const query = ref('')
const filterFecha = ref('Todas las Fechas')
const filterBloque = ref('Todos los Bloques')
const filterDocente = ref('Todos los Docentes')
const history = ref([])
const loading = ref(false)

async function loadHistory() {
  loading.value = true
  try {
    const idHorario = Number(localStorage.getItem('idHorarioActual'))
    if (!idHorario) {
      history.value = []
      return
    }
    const res = await getAsistencias(idHorario)
    // Normalizar a una lista
    const detalles = res?.detalles || res?.items || res || []
    history.value = Array.isArray(detalles) ? detalles : []
  } catch (e) {
    console.error(e)
    history.value = []
  } finally {
    loading.value = false
  }
}

function filtered() {
  const q = query.value?.toLowerCase()?.trim()
  return history.value.filter(h => {
    if (filterBloque.value !== 'Todos los Bloques' && h.paralelo !== filterBloque.value) return false
    if (filterDocente.value !== 'Todos los Docentes' && (h.docenteNombre !== filterDocente.value && String(h.docenteId) !== filterDocente.value)) return false
    if (!q) return true
    return (h.observaciones || '').toLowerCase().includes(q) || (h.estado || '').toLowerCase().includes(q)
  })
}

function goBack() {
  router.push({ name: 'Registro' })
}

function statusClass(s) {
  if (!s) return 'badge muted'
  const t = s.toString().toLowerCase()
  if (t.includes('presen')) return 'badge success'
  if (t.includes('ausen') || t.includes('ausent')) return 'badge danger'
  if (t.includes('just') || t.includes('aut') || t.includes('licen')) return 'badge info'
  return 'badge muted'
}

const uniqueDocentes = computed(() => {
  const set = new Set()
  history.value.forEach(h => {
    const name = h.docenteNombre || (h.docenteId ? String(h.docenteId) : null)
    if (name) set.add(name)
  })
  return Array.from(set)
})

function formatDate(rec) {
  const f = rec.fecha || rec.createdAt || null
  const date = f ? new Date(f) : new Date()
  try { return date.toLocaleString() } catch (e) { return '' }
}

onMounted(loadHistory)
</script>

<template>
  <section class="history-wrap">
    <div class="top-bar">
      <h1 class="page-h1">Historial de Registros</h1>
      <button class="excel-btn">Exportar a Excel</button>
    </div>

    <!-- filtros -->
    <div class="filters-card">
      <div class="filters-grid">
        <div class="f-item">
          <label>Desde:</label>
          <input type="date" />
        </div>
        <div class="f-item">
          <label>Hasta:</label>
          <input type="date" />
        </div>
        <div class="f-item">
          <label>Docente:</label>
          <input v-model="query" placeholder="Nombre del docente..." />
        </div>
        <div class="f-item">
          <label>Bloque:</label>
          <select v-model="filterBloque">
            <option>Todos</option>
            <option>A</option>
            <option>B</option>
          </select>
        </div>
        <div class="f-actions">
          <button class="search-btn" @click="loadHistory">Buscar</button>
        </div>
      </div>
    </div>

    <!-- tabla -->
    <div class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Docente</th>
            <th>Materia</th>
            <th>Estado</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rec in filtered()" :key="rec.idAsistencia">
            <td>{{ formatDate(rec) }}</td>
            <td>{{ rec.docenteNombre || rec.docenteId || '-' }}</td>
            <td>{{ rec.materia || '-' }}</td>
            <td>
              <span :class="statusClass(rec.estado)" class="badge-pill">{{ rec.estado || '-' }}</span>
            </td>
            <td>{{ rec.observaciones || '-' }}</td>
          </tr>
          <tr v-if="!filtered().length">
            <td colspan="5" class="empty">No hay registros</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.history-wrap{ width:100%; padding:24px 22px 40px }
.top-bar{ display:flex; align-items:center; justify-content:space-between; gap:12px }
.page-h1{ color:#ff6a00; font-size:36px; font-weight:900; margin:0 }
.excel-btn{ background:#24c97a; color:#fff; border:none; padding:10px 16px; border-radius:10px; font-weight:800; cursor:pointer }

.filters-card{ background:#fff; border-radius:14px; padding:18px; box-shadow:0 8px 30px rgba(0,0,0,0.06); border:1px solid rgba(0,0,0,0.04); margin-top:18px }
.filters-grid{ display:grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap:18px; align-items:end }
.f-item{ display:flex; flex-direction:column; gap:8px }
.f-item label{ color:#6b7280; font-weight:800 }
.f-item input,.f-item select{ height:44px; border-radius:10px; border:1px solid #e5e7eb; padding:0 12px; font-weight:600; color:#111827; background:#fff }
.f-actions{ display:flex; align-items:center }
.search-btn{ background:#333; color:#fff; height:44px; padding:0 20px; border-radius:12px; font-weight:800; border:none; cursor:pointer }

.table-card{ background:#fff; border-radius:14px; padding:0; box-shadow:0 8px 30px rgba(0,0,0,0.06); border:1px solid rgba(0,0,0,0.04); margin-top:22px }
.table{ width:100%; border-collapse:separate; border-spacing:0 }
.table thead th{ background:#fff4ec; color:#ef6c00; text-align:left; padding:16px 18px; font-size:18px; font-weight:900; border-bottom:1px solid #fde6d8 }
.table tbody td{ background:#fff; padding:22px 18px; font-size:18px; color:#111827; border-bottom:1px solid #f3f4f6 }
.table tbody tr:last-child td{ border-bottom:0 }
.badge-pill{ display:inline-block; padding:8px 14px; border-radius:999px; font-weight:800; font-size:14px; background:#e6fff0; color:#0b8a3e }

.bottom-actions{ display:flex; justify-content:flex-end; margin-top:18px }
.back-link{ background:#9aa4b2; color:#fff; border:none; padding:10px 18px; border-radius:10px; font-weight:800; cursor:pointer }

@media (max-width: 1100px){ .filters-grid{ grid-template-columns: repeat(3, minmax(0,1fr)) } }
@media (max-width: 720px){ .filters-grid{ grid-template-columns: 1fr } }
</style>
