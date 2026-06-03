import uuid
from datetime import datetime, timezone

from domain.entities import Sesion, Recomendacion
from domain.base_conocimiento import BaseConocimiento
from use_cases import generar_recomendacion
from use_cases.ports import SesionRepository, RecomendacionRepository


class EvaluarSituacion:
    def __init__(
        self,
        base: BaseConocimiento,
        sesion_repo: SesionRepository,
        recomendacion_repo: RecomendacionRepository,
    ):
        self.base = base
        self.sesion_repo = sesion_repo
        self.recomendacion_repo = recomendacion_repo

    def ejecutar(self, usuario_id: str, area: str, datos: dict) -> tuple[Sesion, Recomendacion]:
        sesion = Sesion(
            id=str(uuid.uuid4()),
            usuario_id=usuario_id,
            area=area,
            datos_entrada=datos,
            timestamp=datetime.now(timezone.utc).isoformat(),
            estado="pendiente",
        )
        self.sesion_repo.guardar(sesion)

        reglas_activadas = self.base.evaluar(datos, area)
        recomendacion = generar_recomendacion.generar(sesion.id, reglas_activadas)

        self.recomendacion_repo.guardar(recomendacion)
        self.sesion_repo.actualizar_estado(sesion.id, "evaluada")
        sesion.estado = "evaluada"

        return sesion, recomendacion
