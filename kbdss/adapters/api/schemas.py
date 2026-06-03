from typing import Any, Optional
from pydantic import BaseModel, Field


# ── Requests ──────────────────────────────────────────────────────────────────

class EvaluarRequest(BaseModel):
    usuario_id: str
    area: str
    datos: dict[str, Any]


class FeedbackRequest(BaseModel):
    recomendacion_id: str
    sesion_id: str
    calificacion: int = Field(..., ge=1, le=5)
    comentario: str = ""


class ReglaCreateRequest(BaseModel):
    area: str
    condiciones: list[dict[str, Any]]
    accion: str
    justificacion: str
    confianza: float = Field(..., ge=0.0, le=1.0)
    autor: str


class ReglaUpdateRequest(BaseModel):
    area: Optional[str] = None
    condiciones: Optional[list[dict[str, Any]]] = None
    accion: Optional[str] = None
    justificacion: Optional[str] = None
    confianza: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    autor: Optional[str] = None
    activa: Optional[bool] = None


# ── Responses ─────────────────────────────────────────────────────────────────

class AlternativaOut(BaseModel):
    accion: str
    puntaje: float


class RecomendacionOut(BaseModel):
    accion_sugerida: str
    justificacion: str
    puntaje: float
    alternativas: list[AlternativaOut]


class EvaluarResponse(BaseModel):
    sesion_id: str
    recomendacion: RecomendacionOut
    reglas_activadas: int
    timestamp: str


class FeedbackResponse(BaseModel):
    id: str
    fue_util: bool
    calificacion: int
    timestamp: str


class ReglaOut(BaseModel):
    id: str
    area: str
    condiciones: list[dict[str, Any]]
    accion: str
    justificacion: str
    confianza: float
    version: int
    autor: str
    activa: bool
    fecha_creacion: str


class ReglaActivadaOut(BaseModel):
    regla_id: str
    accion: str
    activaciones: int


class KpisResponse(BaseModel):
    total_sesiones: int
    total_recomendaciones: int
    tasa_utilidad: float
    calificacion_promedio: float
    reglas_mas_activadas: list[ReglaActivadaOut]
    sesiones_sin_recomendacion: int
