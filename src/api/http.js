import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Agrega el token automáticamente a cada request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Agrega device token si existe (dispositivo de confianza)
  const deviceToken = localStorage.getItem("device_token");
  if (deviceToken) {
    config.headers["X-Device-Token"] = deviceToken;
  }
  return config;
});

// Maneja error 401 globalmente
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("device_token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default http;
