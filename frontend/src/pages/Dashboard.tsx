import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { RefreshCw, TrendingUp, MessageSquare, Target, AlertTriangle } from 'lucide-react'
import { api } from '../api/client'
import type { KpisResponse } from '../types'
import { Card, CardHeader, CardContent } from '../components/ui/Card'

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  iconBg: string
  valueColor?: string
}

function KpiCard({ label, value, sub, icon, iconBg, valueColor = 'text-slate-900' }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            {icon}
          </div>
        </div>
        <p className={`text-2xl font-bold ${valueColor} leading-none mb-1.5`}>{value}</p>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1 leading-snug">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function UtilityGauge({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const isGood = pct >= 75
  const isMed = pct >= 50
  const color = isGood ? '#16a34a' : isMed ? '#2563eb' : '#ea580c'
  const trackLength = 125.7
  const filled = (pct / 100) * trackLength

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 100 60" className="w-44">
        <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M 10 55 A 40 40 0 0 1 90 55"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${trackLength}`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="50" y="50" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0f172a">{pct}%</text>
      </svg>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <p className="text-xs text-slate-500">
          {isGood ? 'Por encima de la meta' : isMed ? 'Cerca de la meta' : 'Por debajo de la meta'}
        </p>
      </div>
    </div>
  )
}

const BAR_COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE']

export function Dashboard() {
  const [kpis, setKpis] = useState<KpisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setKpis(await api.kpis())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar KPIs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading && !kpis) {
    return (
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
        <div className="h-80 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-8">

      {/* Page title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard KPIs</h1>
          <p className="text-sm text-slate-500 mt-1.5">Métricas de impacto del sistema de decisiones</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 px-3.5 py-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors font-medium"
          aria-label="Actualizar"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-3.5 text-sm text-red-700">{error}</div>
      )}

      {kpis && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard
              label="Sesiones totales"
              value={kpis.total_sesiones.toLocaleString('es-MX')}
              icon={<TrendingUp size={18} className="text-blue-600" />}
              iconBg="bg-blue-50"
            />
            <KpiCard
              label="Recomendaciones"
              value={kpis.total_recomendaciones.toLocaleString('es-MX')}
              icon={<Target size={18} className="text-violet-600" />}
              iconBg="bg-violet-50"
            />
            <KpiCard
              label="Calificación promedio"
              value={kpis.calificacion_promedio > 0 ? `${kpis.calificacion_promedio.toFixed(1)} / 5` : '—'}
              sub={
                kpis.calificacion_promedio >= 3.5
                  ? 'Meta alcanzada (≥ 3.5)'
                  : kpis.calificacion_promedio > 0
                    ? 'Por debajo de la meta'
                    : 'Sin calificaciones aún'
              }
              valueColor={kpis.calificacion_promedio >= 3.5 ? 'text-green-700' : 'text-slate-900'}
              icon={<MessageSquare size={18} className="text-orange-500" />}
              iconBg="bg-orange-50"
            />
            <KpiCard
              label="Sin recomendación"
              value={kpis.sesiones_sin_recomendacion.toLocaleString('es-MX')}
              sub="Brechas de conocimiento"
              valueColor={kpis.sesiones_sin_recomendacion > 0 ? 'text-red-600' : 'text-slate-900'}
              icon={<AlertTriangle size={18} className="text-red-500" />}
              iconBg="bg-red-50"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Bar chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-700">Reglas más activadas</h2>
                <p className="text-xs text-slate-400 mt-0.5">Top 5 por número de activaciones</p>
              </CardHeader>
              <CardContent>
                {kpis.reglas_mas_activadas.length === 0 ? (
                  <div className="h-52 flex flex-col items-center justify-center gap-2 text-slate-300">
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>
                    </svg>
                    <p className="text-sm">Sin datos de activaciones todavía</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={kpis.reglas_mas_activadas}
                      layout="vertical"
                      margin={{ top: 4, right: 20, bottom: 4, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="regla_id"
                        tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                        axisLine={false}
                        tickLine={false}
                        width={48}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        }}
                        formatter={(value, _name, entry) => [
                          `${value} activaciones`,
                          (entry as { payload: { accion: string } }).payload.accion,
                        ]}
                        labelFormatter={() => ''}
                      />
                      <Bar dataKey="activaciones" radius={[0, 8, 8, 0]}>
                        {kpis.reglas_mas_activadas.map((_entry, index) => (
                          <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Utility gauge */}
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-700">Tasa de utilidad</h2>
                <p className="text-xs text-slate-400 mt-0.5">Recomendaciones calificadas como útiles</p>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6 py-6">
                <UtilityGauge value={kpis.tasa_utilidad} />

                <div className="w-full space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Cobertura del motor</span>
                      <span className="font-semibold text-slate-700">
                        {kpis.total_sesiones > 0
                          ? Math.round(((kpis.total_sesiones - kpis.sesiones_sin_recomendacion) / kpis.total_sesiones) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-700"
                        style={{
                          width: kpis.total_sesiones > 0
                            ? `${((kpis.total_sesiones - kpis.sesiones_sin_recomendacion) / kpis.total_sesiones) * 100}%`
                            : '0%',
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">Meta: &gt; 85%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detail table */}
          {kpis.reglas_mas_activadas.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-slate-700">Detalle de activaciones</h2>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-widest">ID Regla</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-widest">Acción</th>
                      <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-widest">Activaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.reglas_mas_activadas.map((r, i) => (
                      <tr key={r.regla_id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-slate-400 bg-slate-50/30">{r.regla_id}</td>
                        <td className="px-6 py-4 text-slate-700 leading-snug">{r.accion}</td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white"
                            style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
                          >
                            {r.activaciones}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
