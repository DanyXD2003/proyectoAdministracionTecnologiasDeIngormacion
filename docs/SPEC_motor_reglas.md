# SPEC — Motor de Reglas KBDSS
## Nexus-Corp: Knowledge-Based Decision Support System
**Para:** Claude Code  
**Propósito:** Implementar el MVP del motor de reglas siguiendo Clean Architecture  
**Stack:** Python 3.11+ · FastAPI · SQLite · sin frameworks en capas internas

---

## Contexto del sistema

Nexus-Corp es una empresa de logística que necesita convertir el conocimiento tácito de sus expertos en reglas de decisión accesibles para sus gerentes. Este motor recibe datos de una situación comercial/logística, evalúa cuáles reglas de la base de conocimiento se activan, y devuelve una recomendación rankeada con justificación.

---

## Arquitectura requerida — Clean Architecture estricta

```
kbdss/
├── domain/                  # Capa 1 — Entidades (CERO imports externos)
│   ├── __init__.py
│   ├── entities.py          # Regla, Recomendacion, Usuario, Sesion, Retroalimentacion
│   └── base_conocimiento.py # BaseConocimiento con método evaluar()
│
├── use_cases/               # Capa 2 — Casos de uso (solo importa domain/)
│   ├── __init__.py
│   ├── gestionar_regla.py   # CRUD de reglas
│   ├── evaluar_situacion.py # Orquesta la evaluación
│   ├── generar_recomendacion.py
│   └── registrar_feedback.py
│
├── adapters/                # Capa 3 — Adaptadores (importa use_cases/ y domain/)
│   ├── __init__.py
│   ├── api/
│   │   ├── routes.py        # Endpoints FastAPI
│   │   └── schemas.py       # Pydantic schemas (request/response)
│   └── repositories/
│       ├── regla_repo.py    # Implementación SQLite de persistencia
│       └── sesion_repo.py
│
├── infrastructure/          # Capa 4 — Frameworks y drivers
│   ├── __init__.py
│   ├── database.py          # Configuración SQLite, tablas
│   └── main.py              # Entry point FastAPI
│
├── data/
│   └── reglas_seed.json     # Reglas iniciales de ventas (ver sección 5)
│
└── tests/
    ├── test_entities.py
    ├── test_motor.py        # Tests del evaluador — los más importantes
    └── test_api.py
```

**Regla de oro:** Si algún archivo dentro de `domain/` o `use_cases/` contiene `import fastapi`, `import sqlite3`, o cualquier import de infraestructura, la arquitectura está rota. Estos módulos deben ser Python puro.

---

## Capa 1 — Entidades (`domain/entities.py`)

### Clase `Regla`

```python
@dataclass
class Regla:
    id: str                    # UUID
    area: str                  # "ventas" | "logistica" | "compras"
    condiciones: list[dict]    # lista de condiciones evaluables (ver formato)
    accion: str                # texto de la acción recomendada
    justificacion: str         # explicación de por qué aplica esta regla
    confianza: float           # 0.0 a 1.0
    version: int               # empieza en 1, incrementa con cada edición
    autor: str                 # nombre del experto que la definió
    activa: bool               # False = archivada, no se evalúa
    fecha_creacion: str        # ISO 8601
```

### Formato de condiciones

Cada condición es un dict con esta estructura:
```python
{
    "campo": "consultas_precio",   # nombre del campo en los datos de entrada
    "operador": "gte",             # eq | neq | gt | gte | lt | lte | contains
    "valor": 3                     # valor de comparación
}
```

Operadores soportados:
- `eq` — igual
- `neq` — diferente
- `gt` / `gte` — mayor que / mayor o igual
- `lt` / `lte` — menor que / menor o igual
- `contains` — el campo (string) contiene el valor

Una regla se activa cuando **todas** sus condiciones son verdaderas (AND lógico).

### Clase `Recomendacion`

```python
@dataclass
class Recomendacion:
    id: str
    sesion_id: str
    reglas_activadas: list[str]    # lista de IDs de reglas que dispararon
    accion_sugerida: str           # acción de la regla con mayor confianza
    justificacion: str             # justificación de la regla principal
    puntaje: float                 # confianza de la regla principal (0.0-1.0)
    alternativas: list[dict]       # otras reglas activadas con menor puntaje
    timestamp: str
```

### Clase `Usuario`

```python
@dataclass
class Usuario:
    id: str
    nombre: str
    rol: str          # "ADMIN" | "DECISOR" | "ANALISTA"
    area: str
    activo: bool
```

### Clase `Sesion`

```python
@dataclass
class Sesion:
    id: str
    usuario_id: str
    area: str
    datos_entrada: dict    # datos crudos ingresados por el usuario
    timestamp: str
    estado: str            # "pendiente" | "evaluada" | "calificada"
```

### Clase `Retroalimentacion`

```python
@dataclass
class Retroalimentacion:
    id: str
    sesion_id: str
    recomendacion_id: str
    calificacion: int     # 1 a 5
    fue_util: bool        # True si calificacion >= 3
    comentario: str       # opcional
    timestamp: str
```

---

## Capa 1 — Base de conocimiento (`domain/base_conocimiento.py`)

### Clase `BaseConocimiento`

Este es el corazón del motor. Implementar con esta firma exacta:

```python
class BaseConocimiento:
    def __init__(self, reglas: list[Regla]):
        self.reglas = [r for r in reglas if r.activa]

    def evaluar(self, datos: dict, area: str) -> list[Regla]:
        """
        Evalúa todas las reglas activas del área indicada contra los datos.
        Retorna lista de reglas activadas, ordenadas por confianza DESC.
        """

    def _evaluar_regla(self, regla: Regla, datos: dict) -> bool:
        """
        Retorna True si TODAS las condiciones de la regla se cumplen.
        """

    def _evaluar_condicion(self, condicion: dict, datos: dict) -> bool:
        """
        Evalúa una condición individual contra los datos.
        Retorna True si el operador se cumple.
        Si el campo no existe en datos, retorna False (no lanza excepción).
        """
```

**Comportamiento esperado de `evaluar()`:**
1. Filtrar reglas por `area` y `activa == True`
2. Para cada regla, llamar `_evaluar_regla()`
3. Retornar solo las reglas donde el resultado fue `True`
4. Ordenar por `confianza` descendente

---

## Capa 2 — Casos de uso

### `evaluar_situacion.py`

```python
class EvaluarSituacion:
    def __init__(self, base: BaseConocimiento):
        self.base = base

    def ejecutar(self, sesion: Sesion) -> Recomendacion:
        """
        1. Llama base.evaluar(sesion.datos_entrada, sesion.area)
        2. Si no hay reglas activadas: retorna Recomendacion con
           accion_sugerida="Sin recomendación disponible", puntaje=0.0
        3. Si hay reglas activadas:
           - La principal es la de mayor confianza
           - Las alternativas son las demás (máximo 2)
        4. Construye y retorna el objeto Recomendacion
        """
```

### `registrar_feedback.py`

```python
class RegistrarFeedback:
    def ejecutar(self, recomendacion_id: str, calificacion: int,
                 comentario: str = "") -> Retroalimentacion:
        """
        1. Validar que calificacion esté entre 1 y 5
        2. fue_util = calificacion >= 3
        3. Persistir la retroalimentacion
        4. Retornar el objeto creado
        """
```

### `gestionar_regla.py`

Implementar estos métodos:
- `crear(datos: dict) -> Regla` — genera UUID, version=1, activa=True
- `editar(id: str, datos: dict) -> Regla` — incrementa version
- `archivar(id: str) -> Regla` — activa=False, no elimina
- `listar(area: str = None) -> list[Regla]` — filtro opcional por área

---

## Capa 3 — API REST (`adapters/api/routes.py`)

### Endpoints requeridos

```
POST   /sesiones/evaluar          # Evalúa una situación y retorna recomendación
POST   /feedback                  # Registra calificación de una recomendación
GET    /reglas                    # Lista reglas (query param: ?area=ventas)
POST   /reglas                    # Crea nueva regla
PUT    /reglas/{id}               # Edita regla existente
DELETE /reglas/{id}               # Archiva regla (soft delete)
GET    /kpis                      # Métricas agregadas del sistema
```

### Schema de request para `/sesiones/evaluar`

```json
{
  "usuario_id": "uuid",
  "area": "ventas",
  "datos": {
    "consultas_precio": 4,
    "volumen_potencial": 7500,
    "tipo_cliente": "corporativo",
    "dias_sin_compra": 45
  }
}
```

### Schema de response para `/sesiones/evaluar`

```json
{
  "sesion_id": "uuid",
  "recomendacion": {
    "accion_sugerida": "Ofrecer descuento escalonado del 8%",
    "justificacion": "Cliente corporativo con alta intención de compra...",
    "puntaje": 0.87,
    "alternativas": [
      {
        "accion": "Escalar a ejecutivo senior para cierre",
        "puntaje": 0.74
      }
    ]
  },
  "reglas_activadas": 2,
  "timestamp": "2026-06-02T15:30:00Z"
}
```

### Endpoint `/kpis`

Debe retornar:
```json
{
  "total_sesiones": 142,
  "total_recomendaciones": 142,
  "tasa_utilidad": 0.78,          // promedio de fue_util == True
  "calificacion_promedio": 3.9,
  "reglas_mas_activadas": [
    {"regla_id": "uuid", "accion": "...", "activaciones": 34}
  ],
  "sesiones_sin_recomendacion": 8
}
```

---

## Datos semilla (`data/reglas_seed.json`)

Cargar estas reglas al inicializar la base de datos:

```json
[
  {
    "id": "r001",
    "area": "ventas",
    "condiciones": [
      {"campo": "consultas_precio", "operador": "gte", "valor": 3},
      {"campo": "volumen_potencial", "operador": "gte", "valor": 5000}
    ],
    "accion": "Ofrecer descuento escalonado del 5-10%",
    "justificacion": "Cliente con alta intención de compra y volumen significativo. El descuento escalonado reduce fricción sin sacrificar margen.",
    "confianza": 0.87,
    "version": 1,
    "autor": "Ana García",
    "activa": true,
    "fecha_creacion": "2026-01-15T09:00:00Z"
  },
  {
    "id": "r002",
    "area": "ventas",
    "condiciones": [
      {"campo": "dias_sin_compra", "operador": "gte", "valor": 30},
      {"campo": "tipo_cliente", "operador": "eq", "valor": "corporativo"}
    ],
    "accion": "Iniciar contacto proactivo con propuesta personalizada",
    "justificacion": "Cliente corporativo inactivo por más de un mes. La reactivación proactiva tiene 3x más éxito que esperar contacto entrante.",
    "confianza": 0.81,
    "version": 1,
    "autor": "Carlos Mejía",
    "activa": true,
    "fecha_creacion": "2026-01-15T09:00:00Z"
  },
  {
    "id": "r003",
    "area": "ventas",
    "condiciones": [
      {"campo": "consultas_precio", "operador": "gte", "valor": 3},
      {"campo": "tipo_cliente", "operador": "eq", "valor": "corporativo"}
    ],
    "accion": "Escalar a ejecutivo senior para cierre",
    "justificacion": "Cliente corporativo con señales de compra activas. El cierre con ejecutivo senior aumenta la tasa de conversión en un 40%.",
    "confianza": 0.74,
    "version": 1,
    "autor": "Ana García",
    "activa": true,
    "fecha_creacion": "2026-01-15T09:00:00Z"
  },
  {
    "id": "r004",
    "area": "ventas",
    "condiciones": [
      {"campo": "volumen_potencial", "operador": "lt", "valor": 1000},
      {"campo": "consultas_precio", "operador": "lte", "valor": 1}
    ],
    "accion": "Enviar catálogo digital y agendar seguimiento en 7 días",
    "justificacion": "Cliente en etapa exploratoria con bajo volumen potencial. Inversión de tiempo alta vs. retorno esperado — seguimiento diferido es más eficiente.",
    "confianza": 0.69,
    "version": 1,
    "autor": "Carlos Mejía",
    "activa": true,
    "fecha_creacion": "2026-01-15T09:00:00Z"
  },
  {
    "id": "r005",
    "area": "ventas",
    "condiciones": [
      {"campo": "dias_sin_compra", "operador": "gte", "valor": 90}
    ],
    "accion": "Activar protocolo de recuperación: llamada directa + oferta especial",
    "justificacion": "Cliente inactivo por más de 3 meses. Sin intervención activa, la probabilidad de recuperación cae a menos del 20%.",
    "confianza": 0.91,
    "version": 1,
    "autor": "Roberto Paz",
    "activa": true,
    "fecha_creacion": "2026-01-15T09:00:00Z"
  }
]
```

---

## Tests requeridos (`tests/test_motor.py`)

Implementar estos casos de prueba como mínimo:

```python
def test_regla_se_activa_cuando_todas_condiciones_se_cumplen():
    # datos: consultas_precio=4, volumen_potencial=7500
    # debe activar r001

def test_regla_no_se_activa_si_una_condicion_falla():
    # datos: consultas_precio=4, volumen_potencial=2000
    # r001 NO debe activar (volumen < 5000)

def test_multiples_reglas_ordenadas_por_confianza():
    # datos: consultas_precio=4, tipo_cliente="corporativo", volumen_potencial=6000
    # debe activar r001 (0.87) y r003 (0.74)
    # r001 debe ser la recomendacion principal

def test_sin_reglas_activadas_retorna_recomendacion_vacia():
    # datos: consultas_precio=0, volumen_potencial=100
    # puntaje debe ser 0.0, accion_sugerida debe indicar sin recomendación

def test_campo_inexistente_no_lanza_excepcion():
    # datos: {} (vacío)
    # no debe lanzar KeyError, debe retornar sin recomendación

def test_operador_contains():
    # condicion: {"campo": "notas", "operador": "contains", "valor": "urgente"}
    # datos: {"notas": "pedido urgente confirmado"}
    # debe retornar True

def test_feedback_actualiza_estado_sesion():
    # calificacion=4, fue_util debe ser True

def test_feedback_invalido_lanza_error():
    # calificacion=6 debe lanzar ValueError
```

---

## Instrucciones de ejecución esperadas

Al terminar la implementación, estos comandos deben funcionar:

```bash
# Instalar dependencias
pip install fastapi uvicorn pydantic sqlite3

# Inicializar base de datos con reglas semilla
python -m kbdss.infrastructure.database

# Correr servidor
uvicorn kbdss.infrastructure.main:app --reload --port 8000

# Correr tests
pytest tests/ -v

# Ejemplo de llamada al motor
curl -X POST http://localhost:8000/sesiones/evaluar \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": "user-001",
    "area": "ventas",
    "datos": {
      "consultas_precio": 4,
      "volumen_potencial": 7500,
      "tipo_cliente": "corporativo",
      "dias_sin_compra": 10
    }
  }'
```

---

## Resultado esperado del ejemplo anterior

```json
{
  "sesion_id": "...",
  "recomendacion": {
    "accion_sugerida": "Ofrecer descuento escalonado del 5-10%",
    "justificacion": "Cliente con alta intención de compra y volumen significativo...",
    "puntaje": 0.87,
    "alternativas": [
      {
        "accion": "Escalar a ejecutivo senior para cierre",
        "puntaje": 0.74
      }
    ]
  },
  "reglas_activadas": 2,
  "timestamp": "..."
}
```

*Las reglas r001 y r003 deben activarse. r002 no activa porque dias_sin_compra=10 < 30. r004 no activa porque volumen_potencial=7500 >= 1000. r005 no activa porque dias_sin_compra=10 < 90.*
