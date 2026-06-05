# KBDSS — Motor de Reglas Nexus-Corp

**Knowledge-Based Decision Support System**  
Sistema de soporte a la toma de decisiones basado en reglas para la empresa de logística Nexus-Corp.

---

## ¿Qué hace este sistema?

Nexus-Corp necesita convertir el conocimiento tácito de sus expertos en reglas de decisión accesibles para sus gerentes. Este motor recibe datos de una situación comercial o logística, evalúa qué reglas de la base de conocimiento se activan, y devuelve una **recomendación rankeada con justificación**.

Por ejemplo: si un cliente corporativo lleva 45 días sin comprar y ha hecho 4 consultas de precio, el sistema recomienda automáticamente *"Iniciar contacto proactivo con propuesta personalizada"* con una confianza del 81%.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| API | FastAPI 0.115 |
| Base de datos | PostgreSQL (Neon) |
| ORM / Driver | psycopg2 |
| Validación | Pydantic v2 |
| Servidor | Uvicorn |
| Deploy | Render |
| Tests | Pytest + httpx |

---

## Arquitectura — Clean Architecture

```
kbdss/
├── domain/                  # Capa 1 — Entidades puras (sin dependencias externas)
│   ├── entities.py          # Regla, Recomendacion, Sesion, Retroalimentacion
│   └── base_conocimiento.py # Motor evaluador de reglas
│
├── use_cases/               # Capa 2 — Lógica de negocio (solo importa domain/)
│   ├── evaluar_situacion.py
│   ├── generar_recomendacion.py
│   ├── gestionar_regla.py
│   ├── registrar_feedback.py
│   └── ports.py             # Interfaces (Protocol) de repositorios
│
├── adapters/                # Capa 3 — Conexión con el mundo exterior
│   ├── api/
│   │   ├── routes.py        # Endpoints FastAPI
│   │   ├── schemas.py       # Schemas Pydantic (request/response)
│   │   └── deps.py          # Inyección de dependencias
│   └── repositories/
│       ├── regla_repo.py
│       ├── sesion_repo.py
│       ├── recomendacion_repo.py
│       └── feedback_repo.py
│
├── infrastructure/          # Capa 4 — Frameworks y drivers
│   ├── database.py          # Pool de conexiones, creación de tablas, seed
│   └── main.py              # Entry point FastAPI
│
└── data/
    └── reglas_seed.json     # 5 reglas iniciales de ventas
```

**Regla de oro:** `domain/` y `use_cases/` son Python puro — ninguno importa FastAPI, psycopg2 ni ninguna librería de infraestructura.

---

## Instalación local

### Requisitos

- Python 3.11+
- Acceso a una base de datos PostgreSQL (Neon, Render, local, etc.)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/DanyXD2003/proyectoAdministracionTecnologiasDeIngormacion
cd proyectoAdministracionTecnologiasDeIngormacion

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env y agregar tu DATABASE_URL
```

`.env`:
```
DATABASE_URL=postgresql://usuario:password@host:5432/nombre_db?sslmode=require
```

```bash
# 4. Inicializar la base de datos (crea tablas + carga reglas semilla)
python -m kbdss.infrastructure.database

# 5. Levantar el servidor
uvicorn kbdss.infrastructure.main:app --reload --port 8000
```

La API queda disponible en `http://localhost:8000`  
Documentación interactiva en `http://localhost:8000/docs`

---

## API — Endpoints

### `POST /sesiones/evaluar`

Evalúa una situación y retorna una recomendación rankeada.

**Request:**
```json
{
  "usuario_id": "user-001",
  "area": "ventas",
  "datos": {
    "consultas_precio": 4,
    "volumen_potencial": 7500,
    "tipo_cliente": "corporativo",
    "dias_sin_compra": 10
  }
}
```

**Response:**
```json
{
  "sesion_id": "3fa85f64-...",
  "recomendacion": {
    "accion_sugerida": "Ofrecer descuento escalonado del 5-10%",
    "justificacion": "Cliente con alta intención de compra y volumen significativo...",
    "puntaje": 0.87,
    "alternativas": [
      { "accion": "Escalar a ejecutivo senior para cierre", "puntaje": 0.74 }
    ]
  },
  "reglas_activadas": 2,
  "timestamp": "2026-06-02T15:30:00Z"
}
```

---

### `POST /feedback`

Registra la calificación de una recomendación (1 a 5).

**Request:**
```json
{
  "recomendacion_id": "uuid",
  "sesion_id": "uuid",
  "calificacion": 4,
  "comentario": "Muy útil, aplicamos el descuento y cerramos la venta."
}
```

---

### `GET /reglas`

Lista todas las reglas. Acepta query param `?area=ventas`.

### `POST /reglas`

Crea una nueva regla de decisión.

**Request:**
```json
{
  "area": "ventas",
  "condiciones": [
    { "campo": "dias_sin_compra", "operador": "gte", "valor": 90 }
  ],
  "accion": "Activar protocolo de recuperación",
  "justificacion": "Cliente inactivo por más de 3 meses.",
  "confianza": 0.91,
  "autor": "Roberto Paz"
}
```

### `PUT /reglas/{id}`

Edita una regla existente (incrementa su versión automáticamente).

### `DELETE /reglas/{id}`

Archiva una regla (soft delete — no se elimina de la BD).

---

### `GET /kpis`

Métricas agregadas del sistema.

**Response:**
```json
{
  "total_sesiones": 142,
  "total_recomendaciones": 142,
  "tasa_utilidad": 0.78,
  "calificacion_promedio": 3.9,
  "reglas_mas_activadas": [
    { "regla_id": "r001", "accion": "Ofrecer descuento escalonado...", "activaciones": 34 }
  ],
  "sesiones_sin_recomendacion": 8
}
```

---

## Formato de condiciones

Cada regla contiene una lista de condiciones evaluadas con **AND lógico** (todas deben cumplirse):

```json
{ "campo": "consultas_precio", "operador": "gte", "valor": 3 }
```

| Operador | Significado |
|----------|-------------|
| `eq` | igual a |
| `neq` | diferente de |
| `gt` | mayor que |
| `gte` | mayor o igual que |
| `lt` | menor que |
| `lte` | menor o igual que |
| `contains` | el campo (string) contiene el valor |

---

## Reglas semilla

El sistema incluye 5 reglas del área de **ventas** preconfiguradas:

| ID | Condiciones | Acción | Confianza |
|----|-------------|--------|-----------|
| r001 | consultas_precio ≥ 3 AND volumen_potencial ≥ 5000 | Ofrecer descuento escalonado del 5-10% | 0.87 |
| r002 | dias_sin_compra ≥ 30 AND tipo_cliente = "corporativo" | Iniciar contacto proactivo | 0.81 |
| r003 | consultas_precio ≥ 3 AND tipo_cliente = "corporativo" | Escalar a ejecutivo senior | 0.74 |
| r004 | volumen_potencial < 1000 AND consultas_precio ≤ 1 | Enviar catálogo + seguimiento en 7 días | 0.69 |
| r005 | dias_sin_compra ≥ 90 | Activar protocolo de recuperación | 0.91 |

---

## Tests

```bash
# Correr todos los tests (no requieren base de datos)
pytest tests/ -v
```

**21 tests** distribuidos en tres archivos:

| Archivo | Qué prueba |
|---------|-----------|
| `test_entities.py` | Creación y validación de entidades del dominio |
| `test_motor.py` | Motor evaluador, operadores, casos de uso |
| `test_api.py` | Endpoints REST con repositorios en memoria |

---

## Deploy

El sistema está desplegado en **Render** conectado a **Neon PostgreSQL**.

Al iniciar, el servidor crea las tablas automáticamente y carga las reglas semilla si aún no existen.

Para re-desplegar, basta con hacer push a la rama `main`.

---

## Materia

Administración de Tecnologías de Información — Semestre 9
