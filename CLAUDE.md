# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Instalar dependencias
pip install -r requirements.txt

# Levantar servidor en desarrollo
uvicorn kbdss.infrastructure.main:app --reload --port 8000

# Inicializar DB manualmente (crea tablas + seed)
python -m kbdss.infrastructure.database

# Correr todos los tests
pytest tests/ -v

# Correr un solo archivo de tests
pytest tests/test_motor.py -v

# Correr un test específico
pytest tests/test_motor.py::test_regla_se_activa_cuando_todas_condiciones_se_cumplen -v
```

Los tests **no requieren base de datos** — usan repositorios en memoria definidos en cada archivo de test.

## Arquitectura

Clean Architecture estricta en 4 capas. La dependencia siempre fluye hacia adentro: `infrastructure → adapters → use_cases → domain`.

**Regla absoluta:** `domain/` y `use_cases/` son Python puro. Si algún archivo en esas capas importa `fastapi`, `psycopg2` o cualquier librería de terceros, la arquitectura está rota.

### Capa 1 — `kbdss/domain/`

Sin imports externos. Contiene:
- `entities.py` — dataclasses: `Regla`, `Recomendacion`, `Sesion`, `Retroalimentacion`, `Usuario`
- `base_conocimiento.py` — motor evaluador. `BaseConocimiento.evaluar(datos, area)` filtra reglas activas del área, evalúa condiciones con AND lógico, y retorna las activadas ordenadas por `confianza DESC`

### Capa 2 — `kbdss/use_cases/`

Solo importa `domain/`. Contiene:
- `ports.py` — interfaces `Protocol` de repositorios (`ReglaRepository`, `SesionRepository`, etc.). Los use cases dependen de estas interfaces, nunca de implementaciones concretas
- `evaluar_situacion.py` — orquesta: crea `Sesion`, llama `BaseConocimiento.evaluar()`, delega construcción de `Recomendacion` a `generar_recomendacion.py`, persiste ambos
- `generar_recomendacion.py` — función `generar()` que construye el objeto `Recomendacion` a partir de reglas activadas
- `gestionar_regla.py` — CRUD de reglas (crear con UUID, editar incrementando `version`, archivar con `activa=False`)
- `registrar_feedback.py` — valida calificación 1-5, calcula `fue_util = calificacion >= 3`

### Capa 3 — `kbdss/adapters/`

- `repositories/` — implementaciones PostgreSQL con psycopg2. Usan `RealDictCursor` para acceso por nombre de columna. Almacenan `condiciones`, `reglas_activadas` y `alternativas` como JSONB
- `api/deps.py` — factory functions como dependencias FastAPI (`get_regla_repo`, `get_sesion_repo`, etc.). Esto permite override limpio en tests sin monkey-patching
- `api/routes.py` — instancia repos y use cases por request usando las dependencias de `deps.py`

### Capa 4 — `kbdss/infrastructure/`

- `database.py` — pool `ThreadedConnectionPool` de psycopg2. `get_db()` es un generador FastAPI que hace commit al salir y rollback en excepción. `init_pool()` asigna a la variable de módulo `_pool`; siempre referenciar como `db._pool` (no importar `_pool` directamente, ya que es `None` al momento del import)
- `main.py` — importa `infrastructure.database as db` (no las funciones directamente) para evitar capturar `_pool = None`. El startup event crea tablas y hace seed con `ON CONFLICT DO NOTHING`

## Inyección de dependencias y tests

Las rutas reciben repos vía `Depends(get_regla_repo)` etc. Los tests en `test_api.py` crean una app FastAPI separada con `dependency_overrides` apuntando a repos en memoria:

```python
app.dependency_overrides[get_regla_repo] = lambda: _fake_regla_repo
```

Los tests de `test_motor.py` instancian `BaseConocimiento` y use cases directamente con fakes, sin pasar por FastAPI.

## Variables de entorno

`DATABASE_URL` — string de conexión PostgreSQL. Cargado con `python-dotenv` desde `.env` en desarrollo. En Render se configura como variable de entorno secreta en el dashboard (no en `render.yaml`).

## Base de datos

Tablas: `reglas`, `sesiones`, `recomendaciones`, `retroalimentacion`. Las columnas JSON (`condiciones`, `datos_entrada`, `reglas_activadas`, `alternativas`) son tipo `JSONB` en PostgreSQL. El endpoint `/kpis` usa `jsonb_array_elements_text()` para agregar activaciones por regla.
