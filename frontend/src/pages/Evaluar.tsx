import { useState } from 'react'
import { Plus, Trash2, Zap, CheckCircle, ChevronDown, ChevronUp, User, Layers } from 'lucide-react'
import { api } from '../api/client'
import type { EvaluarResponse } from '../types'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

interface DataField {
  campo: string
  valor: string
}

const AREA_OPTIONS = [
  { value: 'ventas', label: 'Ventas' },
  { value: 'logistica', label: 'Logística' },
  { value: 'compras', label: 'Compras' },
]

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-blue-500">{icon}</div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{children}</p>
    </div>
  )
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : 'bg-orange-400'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-bold text-slate-700 w-10 text-right">{pct}%</span>
    </div>
  )
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          className="cursor-pointer transition-transform duration-100 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-8 h-8 transition-colors duration-100 ${
              star <= (hovered || value)
                ? 'fill-orange-400 stroke-orange-400'
                : 'fill-slate-100 stroke-slate-300'
            }`}
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export function Evaluar() {
  const [area, setArea] = useState('ventas')
  const [usuarioId, setUsuarioId] = useState('gerente-001')
  const [fields, setFields] = useState<DataField[]>([{ campo: '', valor: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EvaluarResponse | null>(null)
  const [showAlternatives, setShowAlternatives] = useState(false)

  const [rating, setRating] = useState(0)
  const [comentario, setComentario] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const addField = () => setFields((f) => [...f, { campo: '', valor: '' }])
  const removeField = (i: number) => setFields((f) => f.filter((_, idx) => idx !== i))
  const updateField = (i: number, key: keyof DataField, val: string) =>
    setFields((f) => f.map((item, idx) => (idx === i ? { ...item, [key]: val } : item)))

  const handleEvaluar = async () => {
    setError(null)
    setResult(null)
    setFeedbackSent(false)
    setRating(0)
    setComentario('')

    const datos: Record<string, unknown> = {}
    for (const f of fields) {
      if (!f.campo.trim()) continue
      const num = Number(f.valor)
      datos[f.campo.trim()] = isNaN(num) || f.valor.trim() === '' ? f.valor.trim() : num
    }

    if (Object.keys(datos).length === 0) {
      setError('Agrega al menos un campo de datos.')
      return
    }

    setLoading(true)
    try {
      const res = await api.evaluar({ usuario_id: usuarioId, area, datos })
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al evaluar')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async () => {
    if (!result || rating === 0) return
    setFeedbackLoading(true)
    try {
      await api.feedback({
        recomendacion_id: result.sesion_id,
        sesion_id: result.sesion_id,
        calificacion: rating,
        comentario,
      })
      setFeedbackSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al enviar feedback')
    } finally {
      setFeedbackLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-10">

      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Evaluar situación</h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Ingresa los datos del caso y el motor de reglas generará una recomendación basada en la base de conocimiento.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left: Form ── */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-700">Datos de entrada</h2>
          </CardHeader>

          {/* Section 1: Identificación */}
          <div className="px-6 py-5 border-b border-slate-100">
            <SectionLabel icon={<User size={14} />}>Identificación</SectionLabel>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ID Usuario"
                value={usuarioId}
                onChange={(e) => setUsuarioId(e.target.value)}
                placeholder="gerente-001"
              />
              <Select
                label="Área"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                options={AREA_OPTIONS}
              />
            </div>
          </div>

          {/* Section 2: Campos */}
          <div className="px-6 py-5 border-b border-slate-100">
            <SectionLabel icon={<Layers size={14} />}>Campos de situación</SectionLabel>

            <div className="space-y-3">
              {fields.map((f, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      label={i === 0 ? 'Campo' : undefined}
                      placeholder="ej. consultas_precio"
                      value={f.campo}
                      onChange={(e) => updateField(i, 'campo', e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="w-28">
                    <Input
                      label={i === 0 ? 'Valor' : undefined}
                      placeholder="ej. 4"
                      value={f.valor}
                      onChange={(e) => updateField(i, 'valor', e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(i)}
                      className="mb-0.5 p-2 text-slate-300 hover:text-red-500 cursor-pointer rounded-lg hover:bg-red-50 transition-colors"
                      aria-label="Eliminar campo"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addField}
              className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 cursor-pointer transition-colors font-medium"
            >
              <Plus size={14} />
              Agregar campo
            </button>

            <details className="mt-4">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 transition-colors select-none">
                Ver ejemplo de campos (área ventas)
              </summary>
              <div className="mt-3 font-mono text-xs bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1.5 text-slate-500 leading-relaxed">
                <div className="flex justify-between"><span>consultas_precio</span><span className="text-blue-600">4</span></div>
                <div className="flex justify-between"><span>volumen_potencial</span><span className="text-blue-600">7500</span></div>
                <div className="flex justify-between"><span>tipo_cliente</span><span className="text-blue-600">corporativo</span></div>
                <div className="flex justify-between"><span>dias_sin_compra</span><span className="text-blue-600">10</span></div>
              </div>
            </details>
          </div>

          {/* Section 3: CTA */}
          <div className="px-6 py-5">
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button onClick={handleEvaluar} loading={loading} size="lg" className="w-full">
              <Zap size={16} />
              Evaluar con motor de reglas
            </Button>
          </div>
        </Card>

        {/* ── Right: Result ── */}
        <div className="space-y-5">
          {!result ? (
            <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-300 bg-slate-50/50">
              <Zap size={36} strokeWidth={1.5} />
              <p className="text-sm font-medium">La recomendación aparecerá aquí</p>
            </div>
          ) : (
            <>
              {/* Recommendation card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-700">Recomendación</h2>
                    <Badge variant="blue">
                      {result.reglas_activadas} regla{result.reglas_activadas !== 1 ? 's' : ''} activada{result.reglas_activadas !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Main action */}
                  <div className="rounded-xl bg-blue-50 border border-blue-100 px-5 py-4">
                    <p className="text-sm font-semibold text-blue-900 leading-snug">
                      {result.recomendacion.accion_sugerida}
                    </p>
                  </div>

                  {/* Justification */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Justificación</p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {result.recomendacion.justificacion}
                    </p>
                  </div>

                  {/* Confidence */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Nivel de confianza</p>
                    <ConfidenceBar value={result.recomendacion.puntaje} />
                  </div>

                  {/* Alternatives */}
                  {result.recomendacion.alternativas.length > 0 && (
                    <div className="border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAlternatives((v) => !v)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
                      >
                        {showAlternatives ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {result.recomendacion.alternativas.length} alternativa{result.recomendacion.alternativas.length > 1 ? 's' : ''}
                      </button>

                      {showAlternatives && (
                        <div className="mt-3 space-y-3">
                          {result.recomendacion.alternativas.map((alt, i) => (
                            <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 space-y-2">
                              <p className="text-xs font-medium text-slate-700">{alt.accion}</p>
                              <ConfidenceBar value={alt.puntaje} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-400 pt-1 border-t border-slate-100">
                    Sesión <span className="font-mono">{result.sesion_id.slice(0, 8)}…</span>
                    {' · '}{new Date(result.timestamp).toLocaleString('es-MX')}
                  </p>
                </CardContent>
              </Card>

              {/* Feedback card */}
              {!feedbackSent ? (
                <Card>
                  <CardHeader>
                    <h2 className="text-sm font-semibold text-slate-700">¿Fue útil esta recomendación?</h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <StarRating value={rating} onChange={setRating} />
                    <Input
                      label="Comentario (opcional)"
                      placeholder="¿Qué resultó de aplicar esta recomendación?"
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                    />
                    <Button
                      onClick={handleFeedback}
                      loading={feedbackLoading}
                      disabled={rating === 0}
                      variant="secondary"
                      className="w-full"
                    >
                      Enviar calificación
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-2xl bg-green-50 border border-green-200 px-5 py-4 flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Calificación enviada</p>
                    <p className="text-xs text-green-600 mt-0.5">Gracias por tu retroalimentación.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
