# Especificación de Requisitos de Software
## Sistema de Gestión de Decisiones Basado en Conocimiento (KBDSS)
### Nexus-Corp — Arquitectura de Inteligencia Organizacional

**Versión:** 1.0  
**Fecha:** Junio 2026  
**Estándar:** IEEE Std 830-1998  
**Estado:** Borrador para revisión  

---

## Historial de revisiones

| Versión | Fecha | Descripción | Autor |
|---|---|---|---|
| 0.1 | Jun 2026 | Borrador inicial | Equipo de proyecto |
| 1.0 | Jun 2026 | Primera versión completa | Equipo de proyecto |

---

## 1. Introducción

### 1.1 Propósito

Este documento especifica los requisitos de software del Sistema de Gestión de Decisiones Basado en Conocimiento (KBDSS) para Nexus-Corp. Está dirigido a los desarrolladores responsables de la implementación, al equipo de aseguramiento de calidad, y a los stakeholders organizacionales que validarán que el sistema cumple con las necesidades del negocio.

El propósito del sistema es capturar el conocimiento tácito de los expertos de Nexus-Corp, convertirlo en reglas de decisión formalizadas, y ponerlo a disposición de los gerentes a través de una interfaz que reduzca la incertidumbre en la toma de decisiones comerciales y logísticas.

### 1.2 Alcance

El KBDSS cubre los siguientes procesos de negocio:

- Captura y gestión de reglas de conocimiento en el área de Ventas/Comercial
- Evaluación automatizada de situaciones ingresadas por gerentes
- Generación de recomendaciones rankeadas con justificación
- Análisis de escenarios hipotéticos (What-if)
- Medición del impacto de las decisiones a través de KPIs
- Retroalimentación del usuario para el aprendizaje organizacional continuo

Quedan fuera del alcance de esta versión (v1.0):

- Integración con sistemas ERP o CRM existentes
- Módulo de aprendizaje automático (ML) para generación automática de reglas
- Soporte para idiomas distintos al español
- Aplicación móvil nativa (solo PWA)

### 1.3 Definiciones, acrónimos y abreviaturas

| Término | Definición |
|---|---|
| KBDSS | Knowledge-Based Decision Support System — Sistema de Soporte a la Toma de Decisiones Basado en Conocimiento |
| Regla IF-THEN | Estructura lógica que define una condición observable y la acción recomendada cuando se cumple |
| Conocimiento tácito | Conocimiento implícito que reside en la experiencia de las personas y no está documentado formalmente |
| Conocimiento explícito | Conocimiento formalizado y documentado, accesible a cualquier miembro de la organización |
| Nivel de confianza | Valor entre 0.0 y 1.0 que indica la fiabilidad de una regla basado en validación de expertos y desempeño histórico |
| Sesión | Instancia de consulta al sistema por parte de un usuario |
| MVP | Minimum Viable Product — versión mínima funcional del sistema |
| SRS | Software Requirements Specification — este documento |
| RF | Requisito Funcional |
| RNF | Requisito No Funcional |
| IEEE 830 | Estándar del Institute of Electrical and Electronics Engineers para especificación de requisitos de software |

### 1.4 Referencias

- IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications
- Nonaka, I. & Takeuchi, H. (1995). *The Knowledge-Creating Company*. Oxford University Press
- Martin, R.C. (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall
- Documento de Arquitectura de Negocio Nexus-Corp v1.0 (Entregable 1 de este proyecto)
- SPEC_motor_reglas.md — Especificación técnica de implementación para Claude Code

### 1.5 Visión general del documento

La sección 2 describe el producto en su contexto organizacional y tecnológico. La sección 3 detalla los requisitos funcionales por módulo. La sección 4 especifica los requisitos no funcionales. La sección 5 describe las restricciones de diseño e implementación.

---

## 2. Descripción General

### 2.1 Perspectiva del producto

El KBDSS es un sistema nuevo que no reemplaza ningún sistema existente en Nexus-Corp, sino que complementa los procesos de toma de decisiones actuales. Opera como una capa de inteligencia organizacional accesible vía navegador web (PWA), con un backend en Python/FastAPI y almacenamiento en SQLite para el MVP.

El sistema interactúa con tres tipos de usuarios humanos (roles definidos en la sección 2.3) y no tiene integraciones automáticas con sistemas externos en esta versión.

```
[Administrador] ──► [KBDSS Web App] ◄── [Decisor/Gerente]
                           │
                    [Motor de Reglas]
                           │
                   [Base de Conocimiento]
                           │
                    [Dashboard KPIs] ◄── [Analista]
```

### 2.2 Funciones del producto

A alto nivel, el KBDSS provee las siguientes funciones:

1. **Gestión de base de conocimiento:** crear, editar, versionar y archivar reglas IF-THEN con niveles de confianza asignados por expertos.
2. **Evaluación de situaciones:** procesar datos de entrada ingresados por el gerente y determinar qué reglas aplican.
3. **Generación de recomendaciones:** presentar la acción sugerida con justificación y alternativas ordenadas por confianza.
4. **Análisis What-if:** permitir la evaluación de escenarios hipotéticos modificando variables de entrada sin comprometer datos reales.
5. **Dashboard de KPIs:** mostrar métricas de efectividad del sistema y del conocimiento capturado.
6. **Retroalimentación:** registrar calificaciones de los usuarios para el ajuste dinámico de niveles de confianza.

### 2.3 Características de los usuarios

| Rol | Perfil técnico | Frecuencia de uso | Funciones principales |
|---|---|---|---|
| Administrador de Conocimiento | Medio-alto. Conoce el dominio de negocio y maneja herramientas digitales con fluidez. | Semanal (mantenimiento de reglas) | Crear, editar, validar y archivar reglas |
| Decisor / Gerente | Básico-medio. Usuario de negocio sin formación técnica en sistemas. | Diaria (por cada decisión relevante) | Ingresar situaciones, recibir y calificar recomendaciones |
| Analista | Alto. Formación en análisis de datos e interpretación de métricas. | Semanal (revisión de KPIs) | Consultar dashboard, generar reportes |

### 2.4 Restricciones generales

- El sistema debe operar en navegadores modernos (Chrome 110+, Firefox 110+, Safari 16+) sin instalación adicional.
- El backend debe correr en Python 3.11 o superior.
- La base de datos del MVP será SQLite; la arquitectura debe permitir migración a PostgreSQL sin cambios en las capas de dominio.
- Todos los textos de la interfaz deben estar en español.
- El sistema no debe almacenar información personal sensible de clientes finales de Nexus-Corp.

### 2.5 Suposiciones y dependencias

- Los expertos de las áreas de negocio participarán activamente en el proceso de validación de reglas.
- Nexus-Corp dispondrá de al menos un Administrador de Conocimiento capacitado para el mantenimiento del sistema.
- El entorno de despliegue inicial (Render.com o equivalente) soporta Python y SQLite.
- Los gerentes tienen acceso a dispositivos con navegador web durante su jornada laboral.

---

## 3. Requisitos Funcionales

### Módulo 1: Gestión de Base de Conocimiento

**RF-001 — Crear regla**
- El sistema debe permitir al Administrador crear una nueva regla especificando: área, lista de condiciones (campo, operador, valor), acción recomendada, justificación, y nivel de confianza inicial.
- El sistema debe asignar automáticamente un identificador único, versión inicial (1) y fecha de creación.
- El sistema debe validar que el nivel de confianza esté entre 0.01 y 1.00.
- El sistema debe validar que al menos una condición esté definida antes de guardar.

**RF-002 — Editar regla**
- El sistema debe permitir al Administrador modificar cualquier campo de una regla existente.
- Al guardar, el sistema debe incrementar automáticamente el número de versión.
- El sistema debe conservar el historial de versiones anteriores (solo lectura).

**RF-003 — Archivar regla**
- El sistema debe permitir al Administrador archivar una regla (desactivarla) sin eliminarla permanentemente.
- Las reglas archivadas no deben participar en evaluaciones futuras.
- El sistema debe mostrar las reglas archivadas en una vista separada con opción de reactivarlas.

**RF-004 — Listar y filtrar reglas**
- El sistema debe mostrar todas las reglas activas ordenadas por nivel de confianza descendente.
- El Administrador debe poder filtrar por área (ventas, logística, compras) y por estado (activa/archivada).
- Cada regla en el listado debe mostrar: área, acción, confianza, versión, autor y número de activaciones históricas.

**RF-005 — Cargar reglas semilla**
- El sistema debe cargar automáticamente el conjunto de reglas semilla definidas en `data/reglas_seed.json` al inicializar la base de datos por primera vez.

---

### Módulo 2: Evaluación de Situaciones

**RF-006 — Ingresar datos de situación**
- El Decisor debe poder ingresar un conjunto de datos clave-valor que describan la situación actual.
- El sistema debe indicar qué campos son relevantes para el área seleccionada.
- El sistema debe aceptar los tipos de dato: numérico entero, numérico decimal, texto, booleano.

**RF-007 — Evaluar situación**
- Al enviar los datos, el sistema debe evaluar todas las reglas activas del área correspondiente.
- El sistema debe aplicar lógica AND entre las condiciones de cada regla (todas deben cumplirse para activar la regla).
- El sistema debe soportar los operadores: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `contains`.
- Si un campo requerido por una condición no está presente en los datos de entrada, esa condición se evalúa como falsa sin lanzar error.

**RF-008 — Generar recomendación**
- El sistema debe retornar la recomendación dentro de los 2 segundos posteriores al envío de datos.
- La recomendación principal debe corresponder a la regla activada con mayor nivel de confianza.
- El sistema debe incluir hasta 2 recomendaciones alternativas (otras reglas activadas, ordenadas por confianza).
- Cada recomendación debe incluir: acción sugerida, justificación, nivel de confianza y área.
- Si ninguna regla se activa, el sistema debe comunicarlo claramente e invitar al administrador a revisar la base de conocimiento.

**RF-009 — Registrar sesión**
- El sistema debe persistir automáticamente cada sesión con: usuario, área, datos de entrada, timestamp, y resultado de la evaluación.
- Las sesiones deben ser consultables por el Analista desde el dashboard.

---

### Módulo 3: Análisis What-if

**RF-010 — Modo What-if**
- El sistema debe ofrecer un modo de análisis What-if accesible desde la pantalla de evaluación.
- En modo What-if, el usuario debe poder modificar los valores de cualquier campo antes de re-evaluar.
- Las sesiones en modo What-if deben quedar marcadas como hipotéticas y no deben afectar las métricas de KPIs del dashboard de producción.

**RF-011 — Comparación de escenarios**
- El sistema debe permitir al usuario comparar los resultados de hasta 3 escenarios What-if simultáneamente en una vista de tabla.

---

### Módulo 4: Dashboard de KPIs

**RF-012 — Métricas globales**
- El Analista debe poder visualizar en tiempo real: total de sesiones, total de recomendaciones generadas, tasa de utilidad, calificación promedio, y porcentaje de sesiones sin recomendación.

**RF-013 — Rendimiento por regla**
- El dashboard debe mostrar para cada regla activa: número de activaciones, calificación promedio recibida, y tendencia (mejorando/estable/deteriorando).

**RF-014 — Filtros temporales**
- El Analista debe poder filtrar todas las métricas por período: últimos 7 días, último mes, últimos 3 meses, todo el historial.

**RF-015 — Identificación de brechas**
- El sistema debe listar los patrones de campos ingresados en sesiones sin recomendación, agrupados por frecuencia, para identificar áreas de conocimiento no cubiertas.

---

### Módulo 5: Retroalimentación

**RF-016 — Calificar recomendación**
- El Decisor debe poder calificar cada recomendación recibida en una escala del 1 al 5.
- La calificación debe ser opcional pero el sistema debe recordar al usuario que puede hacerlo al finalizar una sesión.
- El usuario puede añadir un comentario de texto libre (máximo 500 caracteres).

**RF-017 — Ajuste dinámico de confianza**
- Cuando una regla acumule 10 o más calificaciones, el sistema debe recalcular su nivel de confianza como promedio ponderado entre la confianza original del experto (peso: 0.4) y el desempeño observado normalizado (peso: 0.6).
- El Administrador debe recibir una notificación cuando el nivel de confianza de una regla cambie más de 0.15 puntos respecto a su valor anterior.

**RF-018 — Historial de feedback**
- El sistema debe permitir al Analista consultar el historial completo de retroalimentación filtrando por regla, usuario, período y calificación.

---

## 4. Requisitos No Funcionales

### 4.1 Rendimiento

**RNF-001 — Tiempo de respuesta del motor**
El sistema debe generar una recomendación en menos de 2 segundos para una base de conocimiento de hasta 500 reglas activas, bajo condiciones normales de operación (servidor con 1 vCPU, 512 MB RAM).

**RNF-002 — Tiempo de carga de la interfaz**
La interfaz web debe cargar completamente en menos de 3 segundos en una conexión de 10 Mbps.

**RNF-003 — Concurrencia**
El sistema debe soportar al menos 20 usuarios simultáneos sin degradación perceptible del tiempo de respuesta en el MVP.

### 4.2 Seguridad

**RNF-004 — Autenticación**
El sistema debe requerir autenticación mediante usuario y contraseña para acceder a cualquier funcionalidad. Las contraseñas deben almacenarse con hash bcrypt.

**RNF-005 — Autorización por rol**
El sistema debe implementar control de acceso basado en roles (RBAC). Un Decisor no puede acceder a funciones de gestión de reglas. Un Analista no puede crear ni editar reglas.

**RNF-006 — Sesiones seguras**
Las sesiones de usuario deben expirar tras 8 horas de inactividad. Los tokens de autenticación deben transmitirse únicamente por HTTPS.

### 4.3 Usabilidad

**RNF-007 — Curva de aprendizaje**
Un Decisor sin capacitación previa debe poder completar su primera consulta al sistema en menos de 5 minutos siguiendo la interfaz intuitivamente.

**RNF-008 — Mensajes de error**
Todos los mensajes de error deben estar en español y describir claramente qué ocurrió y cómo resolverlo, sin exponer detalles técnicos internos.

**RNF-009 — Accesibilidad**
La interfaz debe ser operable con teclado y compatible con lectores de pantalla en sus funciones principales (WCAG 2.1 nivel AA para las vistas de consulta y recomendación).

### 4.4 Mantenibilidad

**RNF-010 — Cobertura de pruebas**
El código del motor de reglas (capas domain/ y use_cases/) debe tener cobertura de pruebas unitarias mínima del 80%.

**RNF-011 — Separación de capas**
Ningún archivo dentro de `domain/` o `use_cases/` debe contener imports de frameworks externos (FastAPI, SQLite, Pydantic). Esta regla debe verificarse en el pipeline de CI.

**RNF-012 — Documentación de API**
La API REST debe exponer documentación interactiva automática (Swagger UI) en `/docs` al correr en modo desarrollo.

### 4.5 Portabilidad

**RNF-013 — Independencia de base de datos**
La capa de repositorios debe implementarse contra interfaces abstractas, de modo que migrar de SQLite a PostgreSQL requiera únicamente reescribir los archivos en `adapters/repositories/` sin tocar ninguna otra capa.

**RNF-014 — Despliegue en contenedor**
El sistema debe poder desplegarse mediante un único `docker-compose up` que levante el backend y sirva el frontend compilado.

---

## 5. Restricciones de Diseño e Implementación

### 5.1 Restricciones de arquitectura

El sistema debe implementarse siguiendo estrictamente los principios de Clean Architecture (Martin, 2017), con las cuatro capas descritas en la sección 5.2 del documento de arquitectura principal. La regla de dependencia (las dependencias solo apuntan hacia adentro) es no negociable.

### 5.2 Restricciones tecnológicas

| Componente | Tecnología requerida | Justificación |
|---|---|---|
| Backend — dominio y casos de uso | Python 3.11+ puro | Sin dependencias externas en el núcleo |
| Backend — API | FastAPI | Rendimiento, documentación automática, tipado |
| Base de datos (MVP) | SQLite | Sin servidor, fácil despliegue inicial |
| Frontend | React 18+ (PWA) | Accesibilidad móvil sin instalación |
| Esquemas de validación | Pydantic v2 | Integración nativa con FastAPI |
| Testing | pytest | Estándar de facto en ecosistema Python |

### 5.3 Restricciones de datos

- Las reglas deben almacenarse en formato que permita exportación e importación en JSON.
- Los niveles de confianza deben preservar 4 decimales de precisión.
- El historial de versiones de reglas debe conservarse indefinidamente (nunca borrar versiones anteriores).
- Los datos de sesiones deben conservarse mínimo 12 meses antes de ser elegibles para archivado.

---

## Apéndice A — Matriz de trazabilidad

| Requisito | Objetivo asociado | Módulo | Prioridad |
|---|---|---|---|
| RF-001 a RF-005 | OE1 — Capturar conocimiento | Gestión de conocimiento | Alta |
| RF-006 a RF-009 | OE3 — Motor de decisiones | Evaluación | Alta |
| RF-010 a RF-011 | OE3 — Motor de decisiones | What-if | Media |
| RF-012 a RF-015 | OE4 — Medición de impacto | Dashboard KPIs | Media |
| RF-016 a RF-018 | OE4 — Aprendizaje organizacional | Retroalimentación | Media |
| RNF-001 a RNF-003 | OE3 — MVP funcional | Rendimiento | Alta |
| RNF-004 a RNF-006 | OE2 — Arquitectura segura | Seguridad | Alta |
| RNF-010 a RNF-011 | OE2 — Clean Architecture | Mantenibilidad | Alta |

---

## Apéndice B — Casos de uso de aceptación

Los siguientes escenarios deben funcionar correctamente para considerar el sistema aceptado:

**CUA-001:** Un Administrador crea una regla con 2 condiciones AND, la valida con un experto, y la regla aparece en el motor disponible para evaluación.

**CUA-002:** Un Decisor del área de ventas ingresa datos de una situación con `consultas_precio=4` y `volumen_potencial=7500`. El sistema retorna la recomendación "Ofrecer descuento escalonado del 5-10%" con confianza 0.87 en menos de 2 segundos.

**CUA-003:** El mismo Decisor modifica el escenario en modo What-if cambiando `consultas_precio=1`. El sistema retorna sin recomendación activa para ese escenario, sin afectar las métricas del dashboard.

**CUA-004:** El Decisor califica la recomendación del CUA-002 con 5 estrellas. El Analista puede ver esa calificación reflejada en el dashboard inmediatamente.

**CUA-005:** Después de 10 calificaciones con promedio 2.0 sobre una regla, el sistema recalcula su confianza y el Administrador recibe notificación del cambio.
