# Entregable 3 — Prototipo Funcional
## Sistema KBDSS · Nexus-Corp: Arquitectura de Inteligencia Organizacional

**Curso:** Administración de Tecnologías de la Información  
**Versión del MVP:** 1.0  
**Fecha:** Junio 2026  

---

## Acceso al sistema

| Recurso | URL |
|---|---|
| 🌐 Backend (API REST) | `https://proyectoadministraciontecnologiasdeingor.onrender.com` |
| 📖 Documentación interactiva | `https://proyectoadministraciontecnologiasdeingor.onrender.com/docs` |
| 🖥️ Frontend (SPA) | `[INSERTAR URL DEL FRONTEND EN RENDER]` |
| 📦 Repositorio de código | `[INSERTAR URL DEL REPOSITORIO]` |

---

## Descripción del prototipo

El Entregable 3 corresponde al Producto Mínimo Viable (MVP) del motor de reglas del KBDSS, implementado siguiendo los principios de Clean Architecture descritos en el Documento de Arquitectura de Negocio (Entregable 1) y los requisitos formalizados en la Especificación IEEE 830 (Entregable 2).

El sistema implementa el ciclo completo de soporte a la decisión:

1. **Evaluación de situaciones** — el motor evalúa condiciones IF-THEN sobre datos de entrada y retorna recomendaciones ordenadas por nivel de confianza.
2. **Gestión del conocimiento** — interfaz para crear, editar y archivar reglas del área de Ventas.
3. **Retroalimentación** — el usuario califica cada recomendación (1–5) para medir efectividad.
4. **Dashboard de KPIs** — métricas de sesiones, efectividad y reglas más activadas, consumidas desde el endpoint `/kpis`.

### Roles del sistema

No existe autenticación formal: el rol activo se selecciona desde el encabezado de la aplicación y se persiste en `localStorage`. Cada rol determina la vista por defecto:

| Rol | Vista por defecto | Acceso |
|---|---|---|
| **Decisor** | `/evaluar` | Evalúa situaciones y califica recomendaciones |
| **Administrador** | `/reglas` | CRUD completo de reglas |
| **Analista** | `/dashboard` | KPIs de efectividad del sistema |

---

## Stack tecnológico implementado

### Backend

| Capa | Tecnología |
|---|---|
| Dominio y casos de uso | Python 3.11 — sin dependencias externas |
| API REST | FastAPI 0.115 + Pydantic v2 |
| Base de datos | PostgreSQL (psycopg2-binary) |
| Testing | pytest + httpx |
| Despliegue | Render (Web Service) |

**Endpoints disponibles:**

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/sesiones/evaluar` | Evalúa una situación y retorna recomendaciones |
| `POST` | `/feedback` | Registra calificación de una recomendación |
| `GET` | `/reglas` | Lista todas las reglas activas |
| `POST` | `/reglas` | Crea una nueva regla |
| `PUT` | `/reglas/{id}` | Edita una regla (incrementa versión) |
| `DELETE` | `/reglas/{id}` | Archiva una regla (`activa = false`) |
| `GET` | `/kpis` | Retorna métricas agregadas del sistema |

### Frontend

| Elemento | Tecnología |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Estilos | TailwindCSS v4 |
| Componentes UI | Radix UI (Dialog, Select, Label) |
| Routing | React Router v7 |
| Formularios | react-hook-form + Zod |
| Gráficas | Recharts |
| Despliegue | Render (Static Site) |

---

## Estructura del repositorio

```
kbdss/
├── domain/          # Capa 1 — Entidades y motor evaluador (Python puro)
├── use_cases/       # Capa 2 — Casos de uso e interfaces de repositorios
├── adapters/        # Capa 3 — Rutas FastAPI e implementaciones PostgreSQL
├── infrastructure/  # Capa 4 — Pool de conexiones, tablas, seed
└── data/            # Reglas semilla en JSON

frontend/
├── src/
│   ├── pages/       # Evaluar.tsx, Reglas.tsx, Dashboard.tsx
│   ├── components/  # Header y componentes reutilizables
│   ├── api/         # client.ts — funciones de fetch al backend
│   ├── hooks/       # Custom hooks
│   └── types/       # Tipos TypeScript compartidos
└── public/          # Assets estáticos
```

---

## Caso de prueba sugerido

Seleccionar el rol **Decisor** y evaluar la siguiente situación en el área de Ventas:

```
consultas_precio:    4
volumen_potencial:   7500
tipo_cliente:        corporativo
dias_sin_compra:     10
```

**Resultado esperado:** recomendación principal _"Ofrecer descuento escalonado del 5-10%"_ con confianza 0.87, y alternativa _"Escalar a ejecutivo senior para cierre"_ con confianza 0.74.

---

## Instrucciones de ejecución local

```bash
# Clonar el repositorio
git clone [INSERTAR URL DEL REPOSITORIO]

# --- Backend ---
pip install -r requirements.txt

# Crear archivo .env con la cadena de conexión
echo "DATABASE_URL=postgresql://usuario:password@host/db" > .env

# Inicializar base de datos con tablas y reglas semilla
python -m kbdss.infrastructure.database

# Levantar el servidor
uvicorn kbdss.infrastructure.main:app --reload --port 8000

# Correr tests (no requieren base de datos real)
pytest tests/ -v

# --- Frontend ---
cd frontend
npm install        # o: pnpm install

# Crear .env local apuntando al backend
echo "VITE_API_URL=http://localhost:8000" > .env

npm run dev        # Abre en http://localhost:5173
```

---

*Este prototipo corresponde al Entregable 3 del proyecto Nexus-Corp y debe leerse en conjunto con los Entregables 1, 2 y 4.*
