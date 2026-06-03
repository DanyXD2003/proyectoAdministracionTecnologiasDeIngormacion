import json
from typing import Optional

import psycopg2.extras

from domain.entities import Regla


class ReglaRepo:
    def __init__(self, conn):
        self.conn = conn

    def guardar(self, regla: Regla) -> None:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO reglas
                    (id, area, condiciones, accion, justificacion, confianza,
                     version, autor, activa, fecha_creacion)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    area          = EXCLUDED.area,
                    condiciones   = EXCLUDED.condiciones,
                    accion        = EXCLUDED.accion,
                    justificacion = EXCLUDED.justificacion,
                    confianza     = EXCLUDED.confianza,
                    version       = EXCLUDED.version,
                    autor         = EXCLUDED.autor,
                    activa        = EXCLUDED.activa,
                    fecha_creacion = EXCLUDED.fecha_creacion
                """,
                (
                    regla.id, regla.area,
                    json.dumps(regla.condiciones),
                    regla.accion, regla.justificacion,
                    regla.confianza, regla.version,
                    regla.autor, regla.activa, regla.fecha_creacion,
                ),
            )

    def obtener(self, id: str) -> Optional[Regla]:
        with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM reglas WHERE id = %s", (id,))
            row = cur.fetchone()
            return _row_to_regla(row) if row else None

    def listar(self, area: Optional[str] = None) -> list[Regla]:
        with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            if area:
                cur.execute(
                    "SELECT * FROM reglas WHERE area = %s ORDER BY confianza DESC", (area,)
                )
            else:
                cur.execute("SELECT * FROM reglas ORDER BY confianza DESC")
            return [_row_to_regla(r) for r in cur.fetchall()]

    def listar_activas(self, area: str) -> list[Regla]:
        with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM reglas WHERE area = %s AND activa = TRUE ORDER BY confianza DESC",
                (area,),
            )
            return [_row_to_regla(r) for r in cur.fetchall()]


def _row_to_regla(row) -> Regla:
    condiciones = row["condiciones"]
    if isinstance(condiciones, str):
        condiciones = json.loads(condiciones)
    return Regla(
        id=row["id"],
        area=row["area"],
        condiciones=condiciones,
        accion=row["accion"],
        justificacion=row["justificacion"],
        confianza=float(row["confianza"]),
        version=row["version"],
        autor=row["autor"],
        activa=row["activa"],
        fecha_creacion=row["fecha_creacion"],
    )
