from dataclasses import dataclass


@dataclass
class Regla:
    id: str
    area: str
    condiciones: list[dict]
    accion: str
    justificacion: str
    confianza: float
    version: int
    autor: str
    activa: bool
    fecha_creacion: str


@dataclass
class Recomendacion:
    id: str
    sesion_id: str
    reglas_activadas: list[str]
    accion_sugerida: str
    justificacion: str
    puntaje: float
    alternativas: list[dict]
    timestamp: str


@dataclass
class Usuario:
    id: str
    nombre: str
    rol: str
    area: str
    activo: bool


@dataclass
class Sesion:
    id: str
    usuario_id: str
    area: str
    datos_entrada: dict
    timestamp: str
    estado: str


@dataclass
class Retroalimentacion:
    id: str
    sesion_id: str
    recomendacion_id: str
    calificacion: int
    fue_util: bool
    comentario: str
    timestamp: str
