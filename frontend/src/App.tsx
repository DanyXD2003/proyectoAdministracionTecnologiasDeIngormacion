import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { Role } from './types'
import { Header } from './components/Header'
import { Evaluar } from './pages/Evaluar'
import { Reglas } from './pages/Reglas'
import { Dashboard } from './pages/Dashboard'

const ROLE_DEFAULT_ROUTE: Record<Role, string> = {
  decisor: '/evaluar',
  administrador: '/reglas',
  analista: '/dashboard',
}

function useRole() {
  const [role, setRole] = useState<Role>(() => {
    const saved = localStorage.getItem('kbdss-role')
    return (saved as Role) ?? 'decisor'
  })

  const changeRole = (r: Role) => {
    setRole(r)
    localStorage.setItem('kbdss-role', r)
  }

  return { role, changeRole }
}

export default function App() {
  const { role, changeRole } = useRole()
  const [redirectTo, setRedirectTo] = useState<string | null>(null)

  useEffect(() => {
    setRedirectTo(ROLE_DEFAULT_ROUTE[role])
    const t = setTimeout(() => setRedirectTo(null), 50)
    return () => clearTimeout(t)
  }, [role])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Header role={role} onRoleChange={changeRole} />
        {redirectTo && <Navigate to={redirectTo} replace />}
        <main>
          <Routes>
            <Route path="/evaluar" element={<Evaluar />} />
            <Route path="/reglas" element={<Reglas />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to={ROLE_DEFAULT_ROUTE[role]} replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
