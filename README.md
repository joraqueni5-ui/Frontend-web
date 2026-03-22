# Frontend Web - Vue.js 2FA

Interfaz de usuario para la API REST Laravel 2FA. Permite autenticación con doble factor (OTP) y gestión de servicios.

## Tecnologías

- Vue.js 3
- Vue Router 4
- Axios
- Tailwind CSS
- Vite

## Requisitos previos

- Node.js
- npm

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/joraqueni5-ui/Frontend-web.git
cd Frontend-web
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

La app estará disponible en: `http://localhost:5173`

## Conexión con el Backend

Asegúrate de tener el Backend corriendo en:
`http://127.0.0.1:8000`

## Flujo de uso

1. Ingresa tu email y contraseña en el login
2. Revisa tu correo y copia el código OTP
3. Ingresa el código OTP para verificar tu identidad
4. Accede al panel y visualiza los servicios

## Repositorio Backend

https://github.com/joraqueni5-ui/api-2fa
