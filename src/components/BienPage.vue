<template>
  <div class="bien-page">
    <!-- FILTROS -->
    <div class="filter-card">
      <div class="grid">
        <div class="field">
          <label>Bloque:</label>
          <select v-model="filters.bloque">
            <option value="A">Bloque A</option>
            <option value="B">Bloque B</option>
          </select>
        </div>
        <div class="field">
          <label>Piso (Solo Aulas):</label>
          <select disabled>
            <option>-- Todas --</option>
          </select>
        </div>
        <div class="field">
          <label>Aula:</label>
          <select v-model="filters.aula">
            <option value="">-- Todas --</option>
            <option v-for="a in aulasDisponibles" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
        <div class="field">
          <label>Fecha (Auto):</label>
          <input type="date" v-model="filters.fecha" />
        </div>
        <div class="field">
          <label>Hora (Auto):</label>
          <input type="time" v-model="filters.hora" />
        </div>
        <div class="actions">
          <button class="btn-primary" :disabled="loading" @click="consultarHorario">
            {{ loading ? 'Actualizando…' : 'Actualizar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- RESULTADOS -->
    <h2 class="section-title">Resultados del Horario</h2>
    <div class="table-card">
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Aula</th>
              <th>Materia</th>
              <th>Docente</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Registrar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="horarioActual" :key="horarioActual.idHorario">
              <td>{{ horarioActual.aulaNombre }}</td>
              <td>{{ horarioActual.materia }}</td>
              <td>{{ horarioActual.docenteNombre }}</td>
              <td>{{ horarioActual.horaInicio ?? '-' }}</td>
              <td>{{ horarioActual.horaFin ?? '-' }}</td>
              <td class="reg-cell">
                <button class="dots" @click="openRegistrar(horarioActual)">•••</button>
              </td>
            </tr>
            <tr v-else>
              <td colspan="6" class="empty">No hay materia activa ahora mismo.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- FOOTER ACTIONS -->
    <div class="footer-actions">
      <button class="btn-save">Guardar</button>
    </div>

    <!-- MODAL: Registrar Asistencia -->
    <div class="modal-backdrop" v-if="modal.open">
      <div class="modal">
        <h3>Registrar asistencia - {{ modal.item.materia }}</h3>
        <p><strong>Docente:</strong> {{ modal.item.docenteNombre }} | <strong>Aula:</strong> {{ modal.item.aulaNombre }}</p>

        <label>Tipo</label>
        <select v-model="modal.form.asistencia">
          <option value="Presente">Presente</option>
          <option value="Atrasado">Atrasado</option>
          <option value="Ausente">Ausente</option>
          <option value="Licencia">Licencia</option>
          <option value="Reemplazo">Reemplazo</option>
        </select>

        <label>Observación (opcional)</label>
        <textarea v-model="modal.form.observacion" rows="3"></textarea>

        <div class="modal-actions">
          <button class="btn-primary" @click="submitAsistencia" :disabled="modal.loading">
            {{ modal.loading ? 'Guardando…' : 'Guardar' }}
          </button>
          <button class="btn-ghost" @click="closeModal">Cancelar</button>
        </div>

        <p v-if="modal.error" class="error">{{ modal.error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getHorarioActual, registrarAsistencia } from '../api/controlAsistencia'

const loading = ref(false)
const filters = reactive({
  bloque: 'A',
  aula: '',
  fecha: new Date().toISOString().slice(0, 10),
  hora: new Date().toTimeString().slice(0,5)
})
const aulasDisponibles = ref(['A-101','A-102','B-201','B-202'])

const horarioActual = ref(null)

const modal = reactive({
  open: false,
  item: {},
  form: { asistencia: 'Presente', observacion: '' },
  loading: false,
  error: ''
})

function autoNow() {
  filters.fecha = new Date().toISOString().slice(0,10)
  filters.hora = new Date().toTimeString().slice(0,5)
}

async function consultarHorario() {
  loading.value = true
  try {
    const data = await getHorarioActual()
    horarioActual.value = data
    if (data?.idHorario) localStorage.setItem('idHorarioActual', String(data.idHorario))
  } catch (e) {
    horarioActual.value = null
  } finally {
    loading.value = false
  }
}

onMounted(consultarHorario)

function openRegistrar(item) {
  modal.item = item
  modal.form.asistencia = 'Presente'
  modal.form.observacion = ''
  modal.error = ''
  modal.open = true
}
function closeModal() { modal.open = false; modal.loading = false; modal.error = '' }

async function submitAsistencia() {
  modal.error = ''
  modal.loading = true
  try {
    const idHorario = Number(localStorage.getItem('idHorarioActual'))
    if (!idHorario) throw new Error('No hay idHorario disponible')
    const res = await registrarAsistencia({ idHorario, estado: modal.form.asistencia, observaciones: modal.form.observacion })
    alert(res?.mensaje || 'Asistencia registrada')
    closeModal()
  } catch (err) {
    modal.error = 'Error al guardar. ' + (err.message || '')
  } finally {
    modal.loading = false
  }
}
</script>

<style scoped>
.bien-page {
  display: block;
  padding: 20px 0 40px;
}

/* FILTROS */
.filter-card{
  background:#fff;
  border-radius:0;
  padding:22px;
  box-shadow:0 8px 30px rgba(0,0,0,0.06);
  border-top:1px solid rgba(0,0,0,0.04);
  border-bottom:1px solid rgba(0,0,0,0.04);
  width:100%;
  max-width:none;
  margin:0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0,1fr));
  gap: 18px;
  align-items: end;
}

.field { display: flex; flex-direction: column; gap: 8px }
.field label { color: #6b7280; font-weight: 700 }
.field select, .field input { height: 44px; border-radius: 10px; border: 1px solid #e5e7eb; padding: 0 12px; font-weight: 600; color: #111827; background: #fff }

.actions { display: flex; align-items: center; justify-content: flex-start }
.btn-primary { background: #ff6a00; color: #fff; border: none; height: 46px; padding: 0 20px; border-radius: 12px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 24px rgba(255,106,0,.2) }
.btn-ghost { background: transparent; color: #374151; border: 1px solid #e5e7eb; height: 44px; padding: 0 16px; border-radius: 10px; font-weight: 600; cursor: pointer }

/* TÍTULO */
.section-title { margin: 18px 0 12px; padding: 0 22px; color: #ff6a00; font-size: 26px; font-weight: 900; width: 100% }

/* TABLA */
.table-card { background: #fff; border-radius: 0; padding: 0; box-shadow: 0 8px 30px rgba(0,0,0,0.06); border-top: 1px solid rgba(0,0,0,0.04); border-bottom: 1px solid rgba(0,0,0,0.04); width: 100%; margin: 0 }
.table-wrapper { width: 100%; overflow-x: auto }
.table { width: 100%; border-collapse: separate; border-spacing: 0 }
.table thead th { background: #fff4ec; color: #ef6c00; text-align: left; padding: 16px 18px; font-size: 18px; font-weight: 900; border-bottom: 1px solid #fde6d8 }
.table tbody td { background: #fff; padding: 22px 18px; font-size: 18px; color: #111827; border-bottom: 1px solid #f3f4f6 }
.table tbody tr:last-child td { border-bottom: 0 }
.reg-cell { text-align: center }
.dots { background: transparent; border: none; font-size: 24px; line-height: 1; cursor: pointer; color: #9ca3af }

/* MODAL */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 20 }
.modal { width: 520px; max-width: 95vw; background: #fff; border-radius: 14px; padding: 20px; box-shadow: 0 18px 50px rgba(0,0,0,.3) }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end }
.error { color: #b91c1c }

/* FOOTER ACTIONS */
.footer-actions{ display:flex; justify-content:flex-end; padding:18px 22px }
.btn-save{ background: linear-gradient(90deg,#ff6a00,#ff7a1a); color:#000; font-weight:800; border:none; padding:10px 18px; border-radius:12px; box-shadow:0 8px 24px rgba(255,106,0,.2); cursor:pointer }

/* RESPONSIVE */
@media (max-width: 1200px) { .grid { grid-template-columns: repeat(3, minmax(0,1fr)) } }
@media (max-width: 720px) { .grid { grid-template-columns: 1fr } .actions { justify-content: stretch } .btn-primary { width: 100% } .section-title{ padding: 0 14px } }
</style>
