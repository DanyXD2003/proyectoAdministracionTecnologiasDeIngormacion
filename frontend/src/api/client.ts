import type { EvaluarResponse, FeedbackResponse, Regla, KpisResponse } from '../types'

const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Error desconocido')
  }
  return res.json()
}

export const api = {
  evaluar(body: { usuario_id: string; area: string; datos: Record<string, unknown> }) {
    return req<EvaluarResponse>('/sesiones/evaluar', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  feedback(body: {
    recomendacion_id: string
    sesion_id: string
    calificacion: number
    comentario: string
  }) {
    return req<FeedbackResponse>('/feedback', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  listarReglas(area?: string) {
    const qs = area ? `?area=${encodeURIComponent(area)}` : ''
    return req<Regla[]>(`/reglas${qs}`)
  },

  crearRegla(body: Omit<Regla, 'id' | 'version' | 'activa' | 'fecha_creacion'>) {
    return req<Regla>('/reglas', { method: 'POST', body: JSON.stringify(body) })
  },

  editarRegla(id: string, body: Partial<Omit<Regla, 'id' | 'version' | 'fecha_creacion'>>) {
    return req<Regla>(`/reglas/${id}`, { method: 'PUT', body: JSON.stringify(body) })
  },

  archivarRegla(id: string) {
    return req<Regla>(`/reglas/${id}`, { method: 'DELETE' })
  },

  kpis() {
    return req<KpisResponse>('/kpis')
  },
}
