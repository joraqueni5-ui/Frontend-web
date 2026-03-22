<template>
  <div class="otp-wrap">
    <div class="card">
      <div class="icon-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ff6a00"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>

      <h1 class="title">Verificación de Seguridad</h1>
      <p class="desc">
        Hemos enviado un código de 6 dígitos a su correo electrónico.
      </p>

      <div class="otp-box">
        <input
          v-for="i in 6"
          :key="i"
          maxlength="1"
          class="otp-input"
          v-model="otp[i - 1]"
          @input="focusNext(i - 1, $event)"
        />
      </div>

      <button class="primary" :disabled="loading" @click="verify">
        {{ loading ? "Verificando..." : "Verificar Identidad" }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="horarioActual" style="margin-top: 18px">
        <p style="font-weight: 700">Clase activa</p>
        <p>
          Materia: {{ horarioActual?.materia }} | Aula:
          {{ horarioActual?.aulaNombre }} | Docente:
          {{ horarioActual?.docenteNombre }} | Bloque:
          {{ horarioActual?.bloque }}
        </p>

        <div style="margin-top: 12px; display: flex; gap: 8px">
          <select v-model="estado">
            <option value="Presente">Presente</option>
            <option value="Atrasado">Atrasado</option>
            <option value="Ausente">Ausente</option>
          </select>
          <input
            v-model="observaciones"
            placeholder="Observaciones opcionales"
          />
          <button class="primary" :disabled="asistLoading" @click="registrar">
            {{ asistLoading ? "Registrando..." : "Registrar asistencia" }}
          </button>
        </div>

        <div style="margin-top: 12px">
          <button class="primary" @click="consultarAsistencias">
            Consultar asistencias
          </button>
        </div>

        <div v-if="asistencias" style="margin-top: 12px">
          <p>
            Total:
            {{
              asistencias?.total ||
              asistencias?.count ||
              asistencias?.length ||
              0
            }}
          </p>
          <ul>
            <li
              v-for="a in asistencias?.detalles ||
              asistencias?.items ||
              asistencias ||
              []"
              :key="a.idAsistencia"
            >
              #{{ a.idAsistencia }} - {{ a.estado }} - {{ a.observaciones }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getHorarioActual,
  registrarAsistencia,
  getAsistencias,
} from "../api/controlAsistencia";
import http from "../api/http";

const route = useRoute();
const router = useRouter();
const email = route.query.email || localStorage.getItem("auth_email") || "";
const otp = ref(Array(6).fill(""));
const loading = ref(false);
const error = ref("");

const horarioActual = ref(null);
const estado = ref("Presente");
const observaciones = ref("");
const asistLoading = ref(false);
const asistencias = ref(null);

function focusNext(idx, e) {
  const v = e.target.value.replace(/\D/g, "");
  otp.value[idx] = v;
  const next = e.target.nextElementSibling;
  if (v && next) next.focus();
}

onMounted(async () => {
  try {
    const storedId = localStorage.getItem("idHorarioActual");
    if (!storedId) {
      const data = await getHorarioActual();
      horarioActual.value = data;
      if (data?.idHorario)
        localStorage.setItem("idHorarioActual", String(data.idHorario));
    } else {
      const data = await getHorarioActual();
      horarioActual.value = data;
    }
  } catch (e) {
    console.warn("No se pudo cargar horario actual", e);
  }
});

// ✅ FUNCIÓN VERIFY CONECTADA A LA API LARAVEL
async function verify() {
  error.value = "";
  const code = otp.value.join("");

  if (code.length !== 6) {
    error.value = "Ingrese el código de 6 dígitos.";
    return;
  }

  loading.value = true;

  try {
    const emailGuardado = localStorage.getItem("auth_email") || email;

    // Llamada real a Laravel API
    const response = await http.post("/auth/verify-otp", {
      email: emailGuardado,
      otp: code,
      remember_device: true,
      device_name: "FrontendWeb",
    });

    // Guardar token de acceso
    localStorage.setItem("token", response.data.token);

    // Si el dispositivo fue recordado, guardar device_token
    if (response.data.device_token) {
      localStorage.setItem("device_token", response.data.device_token);
    }

    // Ir al panel principal
    router.push({ name: "control" });
  } catch (e) {
    error.value = e.response?.data?.message || "Código OTP incorrecto.";
  } finally {
    loading.value = false;
  }
}

async function registrar() {
  asistLoading.value = true;
  try {
    const idHorario = Number(localStorage.getItem("idHorarioActual"));
    if (!idHorario) throw new Error("No hay idHorario disponible");
    const res = await registrarAsistencia({
      idHorario,
      estado: estado.value,
      observaciones: observaciones.value,
    });
    alert(res?.mensaje || "Asistencia registrada");
    await consultarAsistencias();
  } catch (e) {
    alert(e.message || "Error al registrar asistencia");
  } finally {
    asistLoading.value = false;
  }
}

async function consultarAsistencias() {
  try {
    const idHorario = Number(localStorage.getItem("idHorarioActual"));
    if (!idHorario) throw new Error("No hay idHorario disponible");
    asistencias.value = await getAsistencias(idHorario);
  } catch (e) {
    alert(e.message || "Error al consultar asistencias");
  }
}
</script>

<style scoped>
.otp-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 24px;
  background-color: #f4f6f9;
}

.card {
  width: 360px;
  max-width: 95vw;
  background: #fff;
  border-radius: 14px;
  padding: 30px 22px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
  border-top: 6px solid #ff6a00;
}

.icon-container {
  text-align: center;
  margin-bottom: 10px;
}

.title {
  text-align: center;
  margin: 10px 0 12px;
  color: #1f2937;
  font-weight: 900;
  font-family: "Poppins", system-ui;
  font-size: 1.5rem;
}

.desc {
  text-align: center;
  color: #6b7280;
  margin-bottom: 20px;
  font-family: "Poppins", system-ui;
  font-size: 0.9rem;
  line-height: 1.5;
}

.otp-box {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 20px 0;
}

.otp-input {
  width: 45px;
  height: 55px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  border-radius: 8px;
  border: 2px solid #333;
  font-family: "Poppins", system-ui;
  background-color: #fff;
  transition: all 0.2s;
}

.otp-input:focus {
  border-color: #ff6a00;
  outline: none;
  transform: translateY(-2px);
}

.primary {
  margin-top: 15px;
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, #ff6a00, #ff7a1a);
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
  font-family: "Poppins", system-ui;
  transition: opacity 0.2s;
}

.primary:hover {
  opacity: 0.9;
}
.primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: #b91c1c;
  margin-top: 15px;
  text-align: center;
  font-family: "Poppins", system-ui;
  font-weight: 600;
}
</style>
