import uuid
from datetime import datetime, timezone

from domain.entities import Retroalimentacion
from use_cases.ports import FeedbackRepository, SesionRepository


class RegistrarFeedback:
    def __init__(self, feedback_repo: FeedbackRepository, sesion_repo: SesionRepository):
        self.feedback_repo = feedback_repo
        self.sesion_repo = sesion_repo

    def ejecutar(
        self,
        recomendacion_id: str,
        sesion_id: str,
        calificacion: int,
        comentario: str = "",
    ) -> Retroalimentacion:
        if not 1 <= calificacion <= 5:
            raise ValueError(f"Calificación debe estar entre 1 y 5, recibido: {calificacion}")

        feedback = Retroalimentacion(
            id=str(uuid.uuid4()),
            sesion_id=sesion_id,
            recomendacion_id=recomendacion_id,
            calificacion=calificacion,
            fue_util=calificacion >= 3,
            comentario=comentario,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        self.feedback_repo.guardar(feedback)
        self.sesion_repo.actualizar_estado(sesion_id, "calificada")
        return feedback
