import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Archive, RefreshCw, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '../api/client'
import type { Regla, Condicion } from '../types'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'

const AREA_OPTIONS = [
  { value: '', label: 'Todas las áreas' },
  { value: 'ventas', label: 'Ventas' },
  { value: 'logistica', label: 'Logística' },
  { value: 'compras', label: 'Compras' },
]

const AREA_CREATE_OPTIONS = AREA_OPTIONS.filter((o) => o.value !== '')

const OPERADOR_OPTIONS = [
  { value: 'eq', label: '= igual' },
  { value: 'neq', label: '≠ diferente' },
  { value: 'gt', label: '> mayor que' },
  { value: 'gte', label: '≥ mayor o igual' },
  { value: 'lt', label: '< menor que' },
  { value: 'lte', label: '≤ menor o igual' },
  { value: 'contains', label: '∋ contiene' },
]

interface ReglaFormData {
  area: string
  accion: string
  justificacion: string
  confianza: string
  autor: string
  condiciones: { campo: string; operador: string; valor: string }[]
}

const EMPTY_FORM: ReglaFormData = {
  area: 'ventas',
  accion: '',
  justificacion: '',
  confianza: '0.80',
  autor: '',
  condiciones: [{ campo: '', operador: 'gte', valor: '' }],
}

function CondicionTag({ c }: { c: Condicion }) {
  const opLabel = OPERADOR_OPTIONS.find((o) => o.value === c.operador)?.label.split(' ')[0] ?? c.operador
  return (
    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-lg font-mono leading-none">
      {c.campo} <span className="text-blue-500 font-semibold">{opLabel}</span> {String(c.valor)}
    </span>
  )
}

function ReglaRow({ regla, onEdit, onArchive }: { regla: Regla; onEdit: () => void; onArchive: () => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={`bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-150 hover:border-slate-300 hover:shadow-md ${!regla.activa ? 'opacity-55' : ''}`}>
      {/* Row header */}
      <div className="px-5 py-4 flex items-start gap-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-0.5 p-1 text-slate-300 hover:text-slate-500 cursor-pointer transition-colors rounded-lg hover:bg-slate-50 shrink-0"
          aria-label={expanded ? 'Colapsar' : 'Expandir'}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{regla.id}</span>
            <Badge variant={regla.activa ? 'green' : 'slate'}>
              {regla.activa ? 'Activa' : 'Archivada'}
            </Badge>
            <Badge variant="blue">{regla.area}</Badge>
            <span className="text-xs text-slate-400">v{regla.version}</span>
          </div>

          {/* Action */}
          <p className="text-sm font-semibold text-slate-800 leading-snug">{regla.accion}</p>

          {/* Conditions */}
          <div className="flex flex-wrap gap-1.5">
            {regla.condiciones.map((c, i) => (
              <CondicionTag key={i} c={c} />
            ))}
          </div>
        </div>

        {/* Confidence + actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xl font-bold text-slate-800">{Math.round(regla.confianza * 100)}%</p>
            <p className="text-xs text-slate-400">confianza</p>
          </div>
          {regla.activa && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                aria-label="Editar regla"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={onArchive}
                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg cursor-pointer transition-colors"
                aria-label="Archivar regla"
              >
                <Archive size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Justificación</p>
            <p className="text-sm text-slate-700 leading-relaxed">{regla.justificacion}</p>
          </div>
          <div className="flex gap-6 text-xs text-slate-400 pt-1">
            <span>Autor: <span className="text-slate-600 font-medium">{regla.autor}</span></span>
            <span>Creada: <span className="text-slate-600">{new Date(regla.fecha_creacion).toLocaleDateString('es-MX')}</span></span>
          </div>
        </div>
      )}
    </div>
  )
}

function ReglaForm({
  initial,
  onSubmit,
  loading,
}: {
  initial: ReglaFormData
  onSubmit: (data: ReglaFormData) => void
  loading: boolean
}) {
  const [form, setForm] = useState<ReglaFormData>(initial)

  const set = (key: keyof ReglaFormData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  const updateCond = (i: number, key: string, val: string) =>
    setForm((f) => ({
      ...f,
      condiciones: f.condiciones.map((c, idx) => (idx === i ? { ...c, [key]: val } : c)),
    }))

  const addCond = () =>
    setForm((f) => ({ ...f, condiciones: [...f.condiciones, { campo: '', operador: 'gte', valor: '' }] }))

  const removeCond = (i: number) =>
    setForm((f) => ({ ...f, condiciones: f.condiciones.filter((_, idx) => idx !== i) }))

  return (
    <div className="space-y-6">
      {/* Identificación */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Identificación</p>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Área" value={form.area} onChange={(e) => set('area', e.target.value)} options={AREA_CREATE_OPTIONS} />
          <Input label="Autor" placeholder="Ana García" value={form.autor} onChange={(e) => set('autor', e.target.value)} />
        </div>
        <Input
          label="Confianza (0.0 – 1.0)"
          type="number"
          min="0"
          max="1"
          step="0.01"
          placeholder="0.87"
          value={form.confianza}
          onChange={(e) => set('confianza', e.target.value)}
        />
      </div>

      <div className="border-t border-slate-100" />

      {/* Acción y justificación */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recomendación</p>
        <Input label="Acción recomendada" placeholder="Ofrecer descuento escalonado del 5-10%" value={form.accion} onChange={(e) => set('accion', e.target.value)} />
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Justificación</label>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-300 transition-colors leading-relaxed"
            rows={3}
            placeholder="¿Por qué se recomienda esta acción?"
            value={form.justificacion}
            onChange={(e) => set('justificacion', e.target.value)}
          />
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Conditions */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Condiciones (AND lógico)</p>
        <div className="space-y-3">
          {form.condiciones.map((c, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  label={i === 0 ? 'Campo' : undefined}
                  placeholder="campo"
                  value={c.campo}
                  onChange={(e) => updateCond(i, 'campo', e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="w-40">
                <Select
                  label={i === 0 ? 'Operador' : undefined}
                  value={c.operador}
                  onChange={(e) => updateCond(i, 'operador', e.target.value)}
                  options={OPERADOR_OPTIONS}
                />
              </div>
              <div className="w-24">
                <Input
                  label={i === 0 ? 'Valor' : undefined}
                  placeholder="valor"
                  value={c.valor}
                  onChange={(e) => updateCond(i, 'valor', e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              {form.condiciones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCond(i)}
                  className="mb-0.5 p-2 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                  aria-label="Eliminar condición"
                >
                  <Archive size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addCond}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 cursor-pointer transition-colors font-medium"
        >
          <Plus size={14} />
          Agregar condición
        </button>
      </div>

      <Button onClick={() => onSubmit(form)} loading={loading} className="w-full" size="lg">
        Guardar regla
      </Button>
    </div>
  )
}

export function Reglas() {
  const [reglas, setReglas] = useState<Regla[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [filterArea, setFilterArea] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Regla | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoadingList(true)
    setError(null)
    try {
      const data = await api.listarReglas(filterArea || undefined)
      setReglas(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar reglas')
    } finally {
      setLoadingList(false)
    }
  }, [filterArea])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit = (r: Regla) => { setEditTarget(r); setModalOpen(true) }

  const handleSubmit = async (data: ReglaFormData) => {
    setSaving(true)
    try {
      const payload = {
        area: data.area,
        accion: data.accion,
        justificacion: data.justificacion,
        confianza: parseFloat(data.confianza),
        autor: data.autor,
        condiciones: data.condiciones.map((c) => ({
          campo: c.campo,
          operador: c.operador as Condicion['operador'],
          valor: isNaN(Number(c.valor)) ? c.valor : Number(c.valor),
        })),
      }
      if (editTarget) {
        await api.editarRegla(editTarget.id, payload)
      } else {
        await api.crearRegla(payload)
      }
      setModalOpen(false)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async (id: string) => {
    if (!confirm('¿Archivar esta regla? Dejará de participar en las evaluaciones.')) return
    try {
      await api.archivarRegla(id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al archivar')
    }
  }

  const filtered = reglas.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.accion.toLowerCase().includes(q) || r.autor.toLowerCase().includes(q) || r.area.toLowerCase().includes(q)
  })

  const activas = reglas.filter((r) => r.activa).length

  const initialForm: ReglaFormData = editTarget
    ? {
        area: editTarget.area,
        accion: editTarget.accion,
        justificacion: editTarget.justificacion,
        confianza: String(editTarget.confianza),
        autor: editTarget.autor,
        condiciones: editTarget.condiciones.map((c) => ({
          campo: c.campo,
          operador: c.operador,
          valor: String(c.valor),
        })),
      }
    : EMPTY_FORM

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-10">

      {/* Page title */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Base de conocimiento</h1>
          <p className="text-sm text-slate-500 mt-1.5">
            {reglas.length} regla{reglas.length !== 1 ? 's' : ''} en total
            {' · '}
            <span className="text-green-600 font-medium">{activas} activa{activas !== 1 ? 's' : ''}</span>
          </p>
        </div>
        <Button onClick={openCreate} size="md">
          <Plus size={15} />
          Nueva regla
        </Button>
      </div>

      {/* Search & filter bar */}
      <Card className="mb-6">
        <div className="px-5 py-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por acción, autor o área…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder-slate-400"
            />
          </div>
          <Select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            options={AREA_OPTIONS}
            className="sm:w-44"
          />
          <button
            type="button"
            onClick={load}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            aria-label="Recargar"
          >
            <RefreshCw size={15} className={loadingList ? 'animate-spin' : ''} />
          </button>
        </div>
      </Card>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-3.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* List */}
      {loadingList ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center bg-slate-50/50">
          <p className="text-sm text-slate-400 font-medium">
            No se encontraron reglas{search ? ` para "${search}"` : ''}
          </p>
          <p className="text-xs text-slate-300 mt-1">Intenta con otro término o crea una nueva regla.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <ReglaRow
              key={r.id}
              regla={r}
              onEdit={() => openEdit(r)}
              onArchive={() => handleArchive(r.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? `Editar regla · ${editTarget.id}` : 'Nueva regla'}
        maxWidth="max-w-2xl"
      >
        <ReglaForm key={editTarget?.id ?? 'new'} initial={initialForm} onSubmit={handleSubmit} loading={saving} />
      </Modal>
    </div>
  )
}
