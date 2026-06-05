import { NavLink } from 'react-router-dom'
import { Brain, BarChart3, BookOpen, FlaskConical } from 'lucide-react'
import { clsx } from 'clsx'
import type { Role } from '../types'

interface HeaderProps {
  role: Role
  onRoleChange: (r: Role) => void
}

const ROLES: { value: Role; label: string }[] = [
  { value: 'decisor', label: 'Decisor' },
  { value: 'administrador', label: 'Administrador' },
  { value: 'analista', label: 'Analista' },
]

const NAV_LINKS: Record<Role, { to: string; label: string; icon: React.ReactNode }[]> = {
  decisor: [
    { to: '/evaluar', label: 'Evaluar situación', icon: <FlaskConical size={15} /> },
  ],
  administrador: [
    { to: '/reglas', label: 'Base de conocimiento', icon: <BookOpen size={15} /> },
  ],
  analista: [
    { to: '/dashboard', label: 'Dashboard KPIs', icon: <BarChart3 size={15} /> },
  ],
}

export function Header({ role, onRoleChange }: HeaderProps) {
  const links = NAV_LINKS[role]

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <Brain size={18} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>KBDSS</p>
            <p className="text-xs text-slate-400">Nexus-Corp</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 shrink-0" />

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                )
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Role selector */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs text-slate-400 hidden sm:block">Rol</span>
          <select
            value={role}
            onChange={(e) => onRoleChange(e.target.value as Role)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors font-medium"
            aria-label="Seleccionar rol"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}
