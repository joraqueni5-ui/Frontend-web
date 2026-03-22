// Simple fetch-based API client for ControlAsistencia endpoints
const BASE_URL = 'https://localhost:7158/api/ControlAsistencia'

export async function getHorarioActual() {
  const res = await fetch(`${BASE_URL}/horario-actual`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    credentials: 'include'
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function registrarAsistencia({ idHorario, estado, observaciones }) {
  const res = await fetch(`${BASE_URL}/registrar-asistencia`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Accept': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idHorario, estado, observaciones })
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function getAsistencias(idHorario) {
  const res = await fetch(`${BASE_URL}/asistencias/${idHorario}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    credentials: 'include'
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}
