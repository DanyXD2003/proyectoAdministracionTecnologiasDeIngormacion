import json
from typing import Optional

import psycopg2.extras

from domain.entities import Sesion


class SesionRepo:
    def __init__(self, conn):
        self.conn = conn

    def guardar(self, sesion: Sesion) -> None:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO sesiones (id, usuario_id, area, datos_entrada, timestamp, estado)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    usuario_id   = EXCLUDED.usuario_id,
                    area         = EXCLUDED.area,
                    datos_entrada = EXCLUDED.datos_entrada,
                    timestamp    = EXCLUDED.timestamp,
                    estado       = EXCLUDED.estado
                """,
                (
                    sesion.id, sesion.usuario_id, sesion.area,
                    json.dumps(sesion.datos_entrada),
                    sesion.timestamp, sesion.estado,
                ),
            )

    def obtener(self, id: str) -> Optional[Sesion]:
        with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM sesiones WHERE id = %s", (id,))
            row = cur.fetchone()
            return _row_to_sesion(row) if row else None

    def actualizar_estado(self, id: str, estado: str) -> None:
        with self.conn.cursor() as cur:
            cur.execute("UPDATE sesiones SET estado = %s WHERE id = %s", (estado, id))

    def contar(self) -> int:
        with self.conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM sesiones")
            return cur.fetchone()[0]


def _row_to_sesion(row) -> Sesion:
    datos = row["datos_entrada"]
    if isinstance(datos, str):
        datos = json.loads(datos)
    return Sesion(
        id=row["id"],
        usuario_id=row["usuario_id"],
        area=row["area"],
        datos_entrada=datos,
        timestamp=row["timestamp"],
        estado=row["estado"],
    )
