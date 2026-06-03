from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from adapters.api.schemas import (
    EvaluarRequest, EvaluarResponse, RecomendacionOut, AlternativaOut,
    FeedbackRequest, FeedbackResponse,
    ReglaCreateRequest, ReglaUpdateRequest, ReglaOut,
    KpisResponse, ReglaActivadaOut,
)
from adapters.api.deps import (
    get_regla_repo, get_sesion_repo, get_rec_repo, get_feedback_repo,
)
from domain.base_conocimiento import BaseConocimiento
from use_cases.evaluar_situacion import EvaluarSituacion
from use_cases.registrar_feedback import RegistrarFeedback
from use_cases.gestionar_regla import GestionarRegla

router = APIRouter()


# ── POST /sesiones/evaluar ────────────────────────────────────────────────────

@router.post("/sesiones/evaluar", response_model=EvaluarResponse)
def evaluar_situacion(
    body: EvaluarRequest,
    regla_repo=Depends(get_regla_repo),
    sesion_repo=Depends(get_sesion_repo),
    rec_repo=Depends(get_rec_repo),
):
    reglas = regla_repo.listar_activas(body.area)
    base = BaseConocimiento(reglas)
    use_case = EvaluarSituacion(base, sesion_repo, rec_repo)
    sesion, rec = use_case.ejecutar(body.usuario_id, body.area, body.datos)

    return EvaluarResponse(
        sesion_id=sesion.id,
        recomendacion=RecomendacionOut(
            accion_sugerida=rec.accion_sugerida,
            justificacion=rec.justificacion,
            puntaje=rec.puntaje,
            alternativas=[AlternativaOut(**a) for a in rec.alternativas],
        ),
        reglas_activadas=len(rec.reglas_activadas),
        timestamp=rec.timestamp,
    )


# ── POST /feedback ────────────────────────────────────────────────────────────

@router.post("/feedback", response_model=FeedbackResponse)
def registrar_feedback(
    body: FeedbackRequest,
    feedback_repo=Depends(get_feedback_repo),
    sesion_repo=Depends(get_sesion_repo),
):
    use_case = RegistrarFeedback(feedback_repo, sesion_repo)
    try:
        fb = use_case.ejecutar(
            recomendacion_id=body.recomendacion_id,
            sesion_id=body.sesion_id,
            calificacion=body.calificacion,
            comentario=body.comentario,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return FeedbackResponse(
        id=fb.id,
        fue_util=fb.fue_util,
        calificacion=fb.calificacion,
        timestamp=fb.timestamp,
    )


# ── GET /reglas ───────────────────────────────────────────────────────────────

@router.get("/reglas", response_model=list[ReglaOut])
def listar_reglas(area: Optional[str] = None, regla_repo=Depends(get_regla_repo)):
    return [_regla_out(r) for r in GestionarRegla(regla_repo).listar(area)]


# ── POST /reglas ──────────────────────────────────────────────────────────────

@router.post("/reglas", response_model=ReglaOut, status_code=201)
def crear_regla(body: ReglaCreateRequest, regla_repo=Depends(get_regla_repo)):
    regla = GestionarRegla(regla_repo).crear(body.model_dump())
    return _regla_out(regla)


# ── PUT /reglas/{id} ──────────────────────────────────────────────────────────

@router.put("/reglas/{id}", response_model=ReglaOut)
def editar_regla(id: str, body: ReglaUpdateRequest, regla_repo=Depends(get_regla_repo)):
    datos = {k: v for k, v in body.model_dump().items() if v is not None}
    try:
        regla = GestionarRegla(regla_repo).editar(id, datos)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return _regla_out(regla)


# ── DELETE /reglas/{id} ───────────────────────────────────────────────────────

@router.delete("/reglas/{id}", response_model=ReglaOut)
def archivar_regla(id: str, regla_repo=Depends(get_regla_repo)):
    try:
        regla = GestionarRegla(regla_repo).archivar(id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return _regla_out(regla)


# ── GET /kpis ─────────────────────────────────────────────────────────────────

@router.get("/kpis", response_model=KpisResponse)
def obtener_kpis(
    sesion_repo=Depends(get_sesion_repo),
    rec_repo=Depends(get_rec_repo),
    fb_repo=Depends(get_feedback_repo),
):
    return KpisResponse(
        total_sesiones=sesion_repo.contar(),
        total_recomendaciones=rec_repo.contar(),
        tasa_utilidad=fb_repo.tasa_utilidad(),
        calificacion_promedio=fb_repo.calificacion_promedio(),
        reglas_mas_activadas=[
            ReglaActivadaOut(
                regla_id=r["regla_id"],
                accion=r["accion"],
                activaciones=r["activaciones"],
            )
            for r in rec_repo.reglas_mas_activadas(5)
        ],
        sesiones_sin_recomendacion=rec_repo.contar_sin_recomendacion(),
    )


# ── Helper ────────────────────────────────────────────────────────────────────

def _regla_out(regla) -> ReglaOut:
    return ReglaOut(
        id=regla.id, area=regla.area, condiciones=regla.condiciones,
        accion=regla.accion, justificacion=regla.justificacion,
        confianza=regla.confianza, version=regla.version,
        autor=regla.autor, activa=regla.activa, fecha_creacion=regla.fecha_creacion,
    )
