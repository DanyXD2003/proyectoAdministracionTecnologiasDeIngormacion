import psycopg2.extras

from domain.entities import Retroalimentacion


class FeedbackRepo:
    def __init__(self, conn):
        self.conn = conn

    def guardar(self, feedback: Retroalimentacion) -> None:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO retroalimentacion
                    (id, sesion_id, recomendacion_id, calificacion, fue_util, comentario, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                (
                    feedback.id, feedback.sesion_id, feedback.recomendacion_id,
                    feedback.calificacion, feedback.fue_util,
                    feedback.comentario, feedback.timestamp,
                ),
            )

    def listar(self) -> list[Retroalimentacion]:
        with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM retroalimentacion ORDER BY timestamp DESC")
            return [_row_to_feedback(r) for r in cur.fetchall()]

    def tasa_utilidad(self) -> float:
        with self.conn.cursor() as cur:
            cur.execute("SELECT AVG(fue_util::int) FROM retroalimentacion")
            result = cur.fetchone()[0]
            return float(result) if result is not None else 0.0

    def calificacion_promedio(self) -> float:
        with self.conn.cursor() as cur:
            cur.execute("SELECT AVG(calificacion) FROM retroalimentacion")
            result = cur.fetchone()[0]
            return round(float(result), 2) if result is not None else 0.0


def _row_to_feedback(row) -> Retroalimentacion:
    return Retroalimentacion(
        id=row["id"],
        sesion_id=row["sesion_id"],
        recomendacion_id=row["recomendacion_id"],
        calificacion=row["calificacion"],
        fue_util=row["fue_util"],
        comentario=row["comentario"] or "",
        timestamp=row["timestamp"],
    )
