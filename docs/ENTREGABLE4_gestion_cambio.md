# Guía de Gestión del Cambio
## Implementación del KBDSS en Nexus-Corp
### Plan de Adopción Organizacional

**Versión:** 1.0  
**Fecha:** Junio 2026  
**Alcance:** Todas las áreas usuarias del sistema — Ventas, Logística, Dirección  

---

## 1. Introducción

### 1.1 Propósito de este documento

Este documento define el plan de gestión del cambio para la adopción del Sistema de Gestión de Decisiones Basado en Conocimiento (KBDSS) en Nexus-Corp. Su objetivo es garantizar que la transición desde la toma de decisiones intuitiva hacia la toma de decisiones asistida por conocimiento formalizado ocurra de forma ordenada, con mínima resistencia y máxima apropiación por parte de los usuarios.

Un sistema técnicamente correcto puede fracasar completamente si las personas que deben usarlo no lo adoptan. Este documento aborda exactamente ese riesgo.

### 1.2 Marco teórico aplicado

La guía se apoya en dos modelos complementarios de gestión del cambio organizacional:

**Modelo de Lewin (1951) — Descongelar · Cambiar · Recongelar**

Kurt Lewin describe el cambio como un proceso de tres fases. Primero hay que "descongelar" el estado actual — crear conciencia de que la forma actual de trabajar tiene un problema. Luego se ejecuta el cambio. Finalmente se "recongela" el nuevo estado para que se vuelva la norma.

Para Nexus-Corp esto se traduce en: (1) hacer visible el costo real de las decisiones sin base de conocimiento, (2) introducir el KBDSS gradualmente, (3) institucionalizar su uso hasta que consultar el sistema sea tan natural como revisar el correo antes de una reunión.

**Modelo de Kotter (1996) — 8 pasos para el cambio**

John Kotter propone que el cambio organizacional exitoso requiere construir urgencia, formar una coalición guía, crear una visión clara, comunicarla ampliamente, eliminar obstáculos, generar victorias rápidas, consolidar y anclar el cambio en la cultura. Este plan sigue ese orden de forma explícita.

---

## 2. Diagnóstico de la Situación Actual

### 2.1 Estado de la organización antes del KBDSS

Nexus-Corp presenta las siguientes condiciones que hacen necesaria una gestión activa del cambio:

**Dependencia de personas clave.** El conocimiento operativo crítico está concentrado en 2-3 expertos por área. Estos expertos están acostumbrados a ser consultados directamente — el sistema cambia ese patrón y puede generar resistencia si se percibe como una amenaza a su rol.

**Cultura de decisión intuitiva.** Los gerentes han operado durante años tomando decisiones basadas en experiencia propia y consulta informal. Introducir un paso adicional (consultar el sistema) puede percibirse como burocracia innecesaria si no se comunica correctamente el valor.

**Heterogeneidad tecnológica.** El nivel de comodidad con herramientas digitales varía significativamente entre gerentes. Algunos adoptarán el sistema con entusiasmo; otros necesitarán acompañamiento extendido.

### 2.2 Mapa de stakeholders

| Stakeholder | Interés en el cambio | Influencia | Postura esperada | Estrategia |
|---|---|---|---|---|
| Dirección General | Alto — reducción de riesgo operativo | Alta | Favorable | Presentar ROI y casos de uso estratégicos |
| Expertos senior (Ana García, Carlos Mejía, Roberto Paz) | Medio — pueden sentir amenaza a su rol | Alta | Neutral a resistente | Posicionarlos como co-creadores del sistema, no como reemplazados |
| Gerentes de área | Alto — usuarios principales | Media | Variable | Capacitación hands-on, victorias tempranas visibles |
| Analistas | Alto — nuevo rol habilitado | Baja | Favorable | Darles acceso temprano al dashboard |
| IT / Administrador del sistema | Alto — responsables técnicos | Media | Favorable | Involucrarlos desde el inicio del despliegue |

---

## 3. Plan de Implementación por Fases

### Fase 0 — Preparación (semanas 1-2)

**Objetivo:** Crear las condiciones para que el cambio pueda ocurrir.

**Acciones:**

*Construir la coalición guía.* Identificar y comprometer a un champion del cambio en cada área — idealmente un gerente respetado por sus pares que vea valor en el sistema y esté dispuesto a ser el primero en adoptarlo públicamente. Esta persona no es el experto técnico; es el referente social del grupo.

*Hacer visible el problema.* Antes de mostrar la solución, mostrar el costo del problema actual. Preparar una presentación de 10 minutos para la dirección con datos reales: ¿cuántas decisiones se retrasan esperando al experto? ¿Cuántos errores repetibles ocurrieron el último año? ¿Cuánto costó la última salida de un gerente senior que se llevó su conocimiento? No inventar números — usar incidentes reales que la organización ya conoce.

*Comunicado inicial de dirección.* Un correo o comunicado formal de la dirección explicando que se está implementando una herramienta para apoyar la toma de decisiones — no para reemplazar el juicio humano, sino para complementarlo. El tono debe ser de inversión en las personas, no de control.

---

### Fase 1 — Piloto controlado (semanas 3-6)

**Objetivo:** Demostrar valor real con un grupo pequeño antes de escalar.

**Acciones:**

*Selección del grupo piloto.* 3-5 gerentes del área de Ventas — el área con más reglas formalizadas desde el inicio. Criterios: apertura a nuevas herramientas, influencia positiva sobre sus pares, variedad de perfiles (no solo los más tecnológicos).

*Sesión de co-creación con expertos.* Antes del lanzamiento, realizar una sesión de trabajo con Ana García y Carlos Mejía donde ellos mismos revisen y aprueben las reglas cargadas en el sistema. Esto es crítico: los expertos deben sentir que el sistema contiene *su* conocimiento, no que el sistema los reemplaza. El lenguaje importa — no "el sistema sabe lo mismo que tú", sino "el sistema lleva tu criterio a cada decisión del equipo".

*Capacitación del grupo piloto (2 horas).* Sesión práctica con casos reales de Nexus-Corp. No enseñar el sistema como software — enseñarlo como una herramienta de consulta, como se consultaría a un colega experto. El flujo debe memorizarse como: situación → consultar KBDSS → recomendación → decidir.

*Uso con acompañamiento (2 semanas).* Durante las primeras dos semanas, el grupo piloto usa el sistema con acompañamiento disponible. Un canal de comunicación directo (WhatsApp, Slack o correo) para resolver dudas en tiempo real. El objetivo no es que usen el sistema perfectamente — es que lo usen, noten el valor, y tengan una historia que contar a sus pares.

**Métrica de éxito de la Fase 1:**
- Al menos el 80% del grupo piloto completa 3 o más sesiones en las 2 semanas de uso.
- Calificación promedio de recomendaciones ≥ 3.5/5.
- Al menos 2 testimonios positivos documentados para usar en la comunicación de la Fase 2.

---

### Fase 2 — Expansión (semanas 7-12)

**Objetivo:** Escalar al resto de los usuarios con el respaldo del piloto exitoso.

**Acciones:**

*Comunicación de resultados del piloto.* Una reunión de 30 minutos (o video grabado) donde los propios gerentes del piloto comparten su experiencia. No el equipo de proyecto — los usuarios. Esto es 10 veces más convincente que cualquier presentación técnica. Los testimonios reales de pares eliminan la desconfianza que ningún argumento técnico puede resolver.

*Capacitación por grupos de rol.* Tres sesiones separadas según rol:

| Sesión | Duración | Contenido | Participantes |
|---|---|---|---|
| Decisores / Gerentes | 2 horas | Flujo de consulta, interpretación de recomendaciones, calificación, modo What-if | Todos los gerentes de área |
| Administradores de Conocimiento | 3 horas | Gestión de reglas, proceso de validación, interpretación de métricas de reglas | 1-2 personas por área |
| Analistas | 2 horas | Dashboard de KPIs, filtros, identificación de brechas, exportación de reportes | Equipo de análisis |

*Despliegue por área.* Activar el sistema primero en Ventas (ya tiene reglas), luego Logística (semana 9), luego Compras (semana 11). No activar todo al mismo tiempo — el soporte disponible se diluye y los problemas se acumulan.

*Canal de soporte activo.* Durante la expansión, el Administrador del sistema debe estar disponible con respuesta máxima de 2 horas para consultas. Documentar cada problema recurrente y crear una FAQ interna.

**Métrica de éxito de la Fase 2:**
- Adopción de al menos el 70% de los gerentes en las primeras 4 semanas post-lanzamiento.
- Cobertura del motor (sesiones con recomendación) ≥ 80%.
- Cero incidentes de seguridad o pérdida de datos.

---

### Fase 3 — Institucionalización (semanas 13-20)

**Objetivo:** Convertir el uso del KBDSS en parte permanente de la cultura operativa de Nexus-Corp.

**Acciones:**

*Integrar el KBDSS en procesos formales.* El cambio se vuelve permanente cuando ya no es opcional. Tres integraciones concretas:

1. Las reuniones de revisión semanal de ventas incluyen como punto fijo el reporte del dashboard de KPIs.
2. El proceso de onboarding de nuevos gerentes incluye una sesión de capacitación en el KBDSS en sus primeras dos semanas.
3. Las decisiones de cierre de grandes cuentas deben registrar si se consultó el sistema y cuál fue la recomendación recibida.

*Ciclo mensual de mantenimiento de conocimiento.* El primer lunes de cada mes, el Administrador de Conocimiento revisa el dashboard, identifica reglas con calificación deteriorante y sesiones sin recomendación, y agenda con los expertos correspondientes la actualización o creación de reglas. Este ritual mensual es el mecanismo que mantiene vivo el sistema.

*Reconocimiento visible.* Publicar en los canales internos de Nexus-Corp las métricas de adopción y los casos de éxito (decisiones donde el sistema aportó valor documentado). Las personas adoptan comportamientos que son reconocidos socialmente.

*Evaluación a los 6 meses.* Al cumplir 6 meses de operación, realizar una evaluación formal con tres preguntas: ¿el sistema está siendo útil? (KPIs), ¿hay áreas de conocimiento sin cubrir? (brechas), ¿hay resistencia persistente que necesite atención? (encuesta de satisfacción). Los resultados alimentan la segunda iteración del sistema.

---

## 4. Gestión de la Resistencia

### 4.1 Fuentes de resistencia esperadas y respuestas

**"El sistema no sabe lo que yo sé"**
*Fuente probable:* Expertos senior.
*Respuesta:* Esta objeción es correcta — y es exactamente por eso que necesitamos su conocimiento. El sistema no reemplaza su juicio; lo distribuye. Invitar al experto a revisar las reglas y proponer mejoras. Darle crédito explícito como autor de las reglas que ingresó.

**"Es un paso más que me hace perder tiempo"**
*Fuente probable:* Gerentes con alta carga operativa.
*Respuesta:* Mostrar con datos del piloto cuánto tiempo promedio toma una consulta (objetivo: menos de 3 minutos). Comparar contra el tiempo promedio que toma localizar al experto, esperar su disponibilidad y obtener respuesta. En la mayoría de los casos, el sistema es más rápido.

**"¿Esto significa que van a monitorear mis decisiones?"**
*Fuente probable:* Gerentes con preocupación por la privacidad o la evaluación de desempeño.
*Respuesta:* Comunicar con claridad desde el inicio que el sistema no es una herramienta de control — es de apoyo. Las sesiones son para mejorar el conocimiento colectivo, no para auditar a personas. Este punto debe venir de la dirección, no del equipo técnico.

**"El sistema me recomendó algo que no tenía sentido"**
*Fuente probable:* Cualquier usuario tras una mala recomendación inicial.
*Respuesta:* Esta es la oportunidad más valiosa. Pedir al usuario que califique la recomendación con 1 estrella y deje un comentario. Mostrarle que esa calificación actualiza el sistema. Convirtirlo en co-creador de la mejora en lugar de crítico externo. El sistema que aprende de sus errores genera más confianza que el que nunca se equivoca.

### 4.2 Señales de alerta temprana

Los siguientes indicadores deben monitorearse semanalmente durante las Fases 1 y 2:

- Tasa de adopción por debajo del 40% después de 3 semanas disponible para un grupo.
- Calificación promedio global por debajo de 2.5/5 por más de 2 semanas consecutivas.
- Más de 3 quejas del mismo tipo en el canal de soporte en una semana.
- Un experto clave que se niega a participar en la validación de reglas.

Ante cualquiera de estas señales, pausar la expansión y hacer una reunión de diagnóstico antes de continuar.

---

## 5. Plan de Comunicación

### 5.1 Mensajes clave por audiencia

| Audiencia | Mensaje central | Canal | Frecuencia |
|---|---|---|---|
| Dirección General | "El KBDSS protege el conocimiento crítico y reduce el riesgo de rotación" | Reunión ejecutiva + reporte mensual | Mensual |
| Expertos senior | "Su conocimiento ahora llega a toda la organización — con su nombre" | Reunión individual + reconocimiento público | Al inicio + hitos |
| Gerentes de área | "Tienes un asesor disponible 24/7 que nunca está en reunión" | Capacitación + recordatorio semanal | Semanal (primeras 4 semanas) |
| Analistas | "Ahora tienes datos para demostrar el impacto del conocimiento organizacional" | Acceso anticipado al dashboard | Al inicio del piloto |

### 5.2 Cronograma de comunicaciones

| Semana | Comunicación | Responsable |
|---|---|---|
| 1 | Comunicado de dirección anunciando el proyecto | Dirección General |
| 2 | Invitación al grupo piloto con contexto del proyecto | Líder del proyecto |
| 4 | Reporte interno de resultados del piloto | Analista + Champion |
| 7 | Lanzamiento a toda la organización | Dirección + Champions |
| 9 | Primera revisión mensual de KPIs compartida | Analista |
| 13 | Celebración de primer mes de operación completa | Dirección |
| 20 | Evaluación formal de 6 meses | Equipo de proyecto |

---

## 6. Indicadores de Éxito del Cambio

El cambio se considera exitoso cuando se cumplen simultáneamente estos criterios al final del mes 5 de operación:

| Indicador | Meta |
|---|---|
| Tasa de adopción (usuarios activos / usuarios habilitados) | ≥ 85% |
| Sesiones por gerente por semana (promedio) | ≥ 2 |
| Calificación promedio global de recomendaciones | ≥ 3.8 / 5 |
| Cobertura del motor (sesiones con recomendación) | ≥ 85% |
| Reglas en la base de conocimiento | ≥ 20 reglas validadas |
| Tiempo promedio de respuesta del sistema | ≤ 2 segundos |
| Satisfacción general con el sistema (encuesta) | ≥ 4.0 / 5 |

---

## Apéndice A — Plantilla de sesión de co-creación con expertos

**Duración:** 90 minutos  
**Participantes:** Experto del área + Administrador de Conocimiento + Facilitador  
**Materiales:** Listado de reglas actuales del área + acceso al sistema en modo administrador

| Bloque | Tiempo | Actividad |
|---|---|---|
| Contexto | 10 min | Mostrar al experto cómo aparece su nombre como autor en cada regla. Explicar que puede editar cualquier regla que no le parezca correcta. |
| Revisión de reglas existentes | 30 min | El experto lee cada regla en voz alta y da una calificación rápida: correcta / ajustar / eliminar. El administrador toma notas. |
| Identificación de brechas | 20 min | Preguntar: "¿Qué situaciones frecuentes crees que el sistema todavía no cubre?" Cada respuesta es una regla potencial. |
| Ajustes y nuevas reglas | 25 min | Implementar los cambios identificados en tiempo real. El experto los ve reflejados inmediatamente. |
| Cierre | 5 min | Agradecer y confirmar que el experto recibirá notificación cada vez que sus reglas se actualicen por retroalimentación. |

---

## Apéndice B — Encuesta de satisfacción (mes 1 y mes 6)

1. ¿Con qué frecuencia utilizas el KBDSS en tu trabajo? (Nunca / Ocasionalmente / Regularmente / Siempre)
2. Las recomendaciones del sistema son útiles para mi trabajo. (1-5)
3. El sistema es fácil de usar. (1-5)
4. Confío en las recomendaciones del sistema. (1-5)
5. El sistema ha cambiado la forma en que tomo decisiones. (Sí / No / En parte)
6. ¿Qué es lo que más valoras del sistema? (Abierta)
7. ¿Qué mejorarías? (Abierta)
8. ¿Lo recomendarías a un colega de otra área? (Sí / No / Tal vez)
