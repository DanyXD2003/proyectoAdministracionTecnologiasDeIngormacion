export type Role = 'decisor' | 'administrador' | 'analista'

export interface Alternativa {
  accion: string
  puntaje: number
}

export interface Recomendacion {
  accion_sugerida: string
  justificacion: string
  puntaje: number
  alternativas: Alternativa[]
}

export interface EvaluarResponse {
  sesion_id: string
  recomendacion: Recomendacion
  reglas_activadas: number
  timestamp: string
}

export interface FeedbackResponse {
  id: string
  fue_util: boolean
  calificacion: number
  timestamp: string
}

export interface Condicion {
  campo: string
  operador: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains'
  valor: string | number
}

export interface Regla {
  id: string
  area: string
  condiciones: Condicion[]
  accion: string
  justificacion: string
  confianza: number
  version: number
  autor: string
  activa: boolean
  fecha_creacion: string
}

export interface ReglaActivada {
  regla_id: string
  accion: string
  activaciones: number
}

export interface KpisResponse {
  total_sesiones: number
  total_recomendaciones: number
  tasa_utilidad: number
  calificacion_promedio: number
  reglas_mas_activadas: ReglaActivada[]
  sesiones_sin_recomendacion: number
}
