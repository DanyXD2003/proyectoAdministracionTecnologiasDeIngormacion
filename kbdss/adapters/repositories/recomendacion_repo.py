import json
from typing import Optional

import psycopg2.extras

from domain.entities import Recomendacion


class RecomendacionRepo:
    def __init__(self, conn):
        self.conn = conn

    def guardar(self, recomendacion: Recomendacion) -> None:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO recomendaciones
                    (id, sesion_id, reglas_activadas, accion_sugerida,
                     justificacion, puntaje, alternativas, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                (
                    recomendacion.id, recomendacion.sesion_id,
                    json.dumps(recomendacion.reglas_activadas),
                    recomendacion.accion_sugerida, recomendacion.justificacion,
                    recomendacion.puntaje,
                    json.dumps(recomendacion.alternativas),
                    recomendacion.timestamp,
                ),
            )

    def obtener(self, id: str) -> Optional[Recomendacion]:
        with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM recomendaciones WHERE id = %s", (id,))
            row = cur.fetchone()
            return _row_to_recomendacion(row) if row else None

    def listar(self) -> list[Recomendacion]:
        with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM recomendaciones ORDER BY timestamp DESC")
            return [_row_to_recomendacion(r) for r in cur.fetchall()]

    def contar(self) -> int:
        with self.conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM recomendaciones")
            return cur.fetchone()[0]

    def contar_sin_recomendacion(self) -> int:
        with self.conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM recomendaciones WHERE puntaje = 0.0")
            return cur.fetchone()[0]

    def reglas_mas_activadas(self, limite: int = 5) -> list[dict]:
        with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                SELECT r.id AS regla_id, r.accion, sub.activaciones
                FROM (
                    SELECT jsonb_array_elements_text(reglas_activadas) AS regla_id,
                           COUNT(*) AS activaciones
                    FROM recomendaciones
                    WHERE puntaje > 0
                    GROUP BY regla_id
                    ORDER BY activaciones DESC
                    LIMIT %s
                ) sub
                JOIN reglas r ON r.id = sub.regla_id
                ORDER BY sub.activaciones DESC
                """,
                (limite,),
            )
            return [dict(r) for r in cur.fetchall()]


def _row_to_recomendacion(row) -> Recomendacion:
    def _parse(val):
        return json.loads(val) if isinstance(val, str) else val

    return Recomendacion(
        id=row["id"],
        sesion_id=row["sesion_id"],
        reglas_activadas=_parse(row["reglas_activadas"]),
        accion_sugerida=row["accion_sugerida"],
        justificacion=row["justificacion"],
        puntaje=float(row["puntaje"]),
        alternativas=_parse(row["alternativas"]),
        timestamp=row["timestamp"],
    )
