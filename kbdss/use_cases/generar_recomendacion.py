import uuid
from datetime import datetime, timezone

from domain.entities import Regla, Recomendacion

MAX_ALTERNATIVAS = 2


def generar(sesion_id: str, reglas_activadas: list[Regla]) -> Recomendacion:
    """Construye un objeto Recomendacion a partir de las reglas activadas."""
    if not reglas_activadas:
        return Recomendacion(
            id=str(uuid.uuid4()),
            sesion_id=sesion_id,
            reglas_activadas=[],
            accion_sugerida="Sin recomendación disponible",
            justificacion="Ninguna regla de la base de conocimiento aplica a la situación actual.",
            puntaje=0.0,
            alternativas=[],
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    principal = reglas_activadas[0]
    alternativas = [
        {"accion": r.accion, "puntaje": r.confianza}
        for r in reglas_activadas[1 : 1 + MAX_ALTERNATIVAS]
    ]

    return Recomendacion(
        id=str(uuid.uuid4()),
        sesion_id=sesion_id,
        reglas_activadas=[r.id for r in reglas_activadas],
        accion_sugerida=principal.accion,
        justificacion=principal.justificacion,
        puntaje=principal.confianza,
        alternativas=alternativas,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
