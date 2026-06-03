import uuid
from datetime import datetime, timezone
from typing import Optional

from domain.entities import Regla
from use_cases.ports import ReglaRepository


class GestionarRegla:
    def __init__(self, repo: ReglaRepository):
        self.repo = repo

    def crear(self, datos: dict) -> Regla:
        regla = Regla(
            id=str(uuid.uuid4()),
            area=datos["area"],
            condiciones=datos["condiciones"],
            accion=datos["accion"],
            justificacion=datos["justificacion"],
            confianza=float(datos["confianza"]),
            version=1,
            autor=datos["autor"],
            activa=True,
            fecha_creacion=datetime.now(timezone.utc).isoformat(),
        )
        self.repo.guardar(regla)
        return regla

    def editar(self, id: str, datos: dict) -> Regla:
        regla = self.repo.obtener(id)
        if regla is None:
            raise ValueError(f"Regla '{id}' no encontrada")

        campos_editables = {"area", "condiciones", "accion", "justificacion", "confianza", "autor", "activa"}
        for campo, valor in datos.items():
            if campo in campos_editables:
                setattr(regla, campo, valor)
        regla.version += 1
        self.repo.guardar(regla)
        return regla

    def archivar(self, id: str) -> Regla:
        regla = self.repo.obtener(id)
        if regla is None:
            raise ValueError(f"Regla '{id}' no encontrada")
        regla.activa = False
        self.repo.guardar(regla)
        return regla

    def listar(self, area: Optional[str] = None) -> list[Regla]:
        return self.repo.listar(area)
