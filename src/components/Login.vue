<template>
  <div class="login-wrap">
    <div class="card">
      <div class="brand-pill">UNIFRANZ</div>
      <h1 class="title">Bienvenido</h1>

      <label>Usuario</label>
      <input
        v-model="email"
        type="email"
        placeholder="ejemplo@unifranz.edu.bo"
      />

      <label>Contrase&ntilde;a</label>

      <input v-model="password" type="password" placeholder="********" />

      <button class="primary" :disabled="loading" @click="requestOtp">
        {{ loading ? "Enviando�" : "INGRESAR" }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
      <p
        v-if="horarioActual"
        style="margin-top: 12px; text-align: center; font-weight: 700"
      >
        Clase activa: {{ horarioActual?.materia }} | Aula:
        {{ horarioActual?.aulaNombre }} | Docente:
        {{ horarioActual?.docenteNombre }} | Bloque: {{ horarioActual?.bloque }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getHorarioActual } from "../api/controlAsistencia";
import http from "../api/http";

const router = useRouter();
const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const horarioActual = ref(null);

onMounted(async () => {
  try {
    const data = await getHorarioActual();
    horarioActual.value = data;
    if (data?.idHorario) {
      localStorage.setItem("idHorarioActual", String(data.idHorario));
    }
  } catch (e) {
    console.warn("No se pudo obtener el horario actual", e);
  }
});

async function requestOtp() {
  error.value = "";

  if (!email.value) {
    error.value = "Ingresa tu correo institucional.";
    return;
  }
  if (!password.value) {
    error.value = "Ingresa tu contraseña.";
    return;
  }

  loading.value = true;

  try {
    // Llamada real a la API Laravel
    const response = await http.post("/auth/login", {
      email: email.value,
      password: password.value,
    });

    if (response.data.requires_otp) {
      // Guardar email para usarlo en OtpVerify
      localStorage.setItem("auth_email", email.value);
      // Ir a pantalla OTP
      router.push({ name: "Otp", query: { email: email.value } });
    } else {
      // Dispositivo de confianza: token directo
      localStorage.setItem("token", response.data.token);
      router.push({ name: "Bien" });
    }
  } catch (e) {
    error.value = e.response?.data?.message || "Credenciales incorrectas.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Estructura general centrada */
.login-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 24px;
  background-color: #f4f6f9; /* Color de fondo suave */
}

/* Tarjeta del login */
.card {
  width: 380px;
  max-width: 95vw;
  background: #fff;
  border-radius: 14px;
  padding: 22px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
  border-top: 6px solid #ff6a00; /* Borde naranja arriba */
}

/* Pill de la marca */
.brand-pill {
  background: #fff4ec;
  color: #ff6a00;
  font-weight: 900;
  border-radius: 999px;
  padding: 10px 16px;
  display: inline-block;
  margin-bottom: 8px;
  font-family: "Poppins", system-ui, sans-serif;
}

/* T�tulo */
.title {
  text-align: center;
  margin: 10px 0 16px;
  color: #1f2937;
  font-family: "Poppins", system-ui, sans-serif;
  font-weight: 900;
}

/* Etiquetas */
label {
  display: block; /* Asegura que la etiqueta ocupe su propia l�nea */
  font-weight: 800;
  color: #374151;
  margin-top: 15px;
  font-family: "Poppins", system-ui, sans-serif;
}

/* Campos de texto */
input {
  width: 100%; /* Asegura que ocupe todo el ancho */
  box-sizing: border-box; /* Evita que el padding rompa el ancho */
  height: 44px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 0 12px;
  font-weight: 600;
  margin-top: 6px;
  font-family: "Poppins", system-ui, sans-serif;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #ff6a00;
}

/* Bot�n principal */
.primary {
  margin-top: 25px;
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, #ff6a00, #ff7a1a);
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
  font-family: "Poppins", system-ui, sans-serif;
  transition: opacity 0.2s;
}

.primary:hover {
  opacity: 0.9;
}

.primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Mensaje de error */
.error {
  color: #b91c1c;
  margin-top: 15px;
  font-family: "Poppins", system-ui, sans-serif;
  text-align: center;
  font-size: 0.9em;
}
</style>
