import json
import os

import psycopg2
from psycopg2 import pool

_pool: pool.ThreadedConnectionPool | None = None


def init_pool() -> None:
    global _pool
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise RuntimeError("La variable de entorno DATABASE_URL no está configurada")
    _pool = pool.ThreadedConnectionPool(minconn=1, maxconn=10, dsn=url)


def get_db():
    """Dependencia FastAPI: yield una conexión del pool con transacción automática."""
    assert _pool is not None, "Pool no inicializado. Llama a init_pool() primero."
    conn = _pool.getconn()
    conn.autocommit = False
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        _pool.putconn(conn)


def create_tables(conn) -> None:
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS reglas (
                id            TEXT PRIMARY KEY,
                area          TEXT NOT NULL,
                condiciones   JSONB NOT NULL,
                accion        TEXT NOT NULL,
                justificacion TEXT NOT NULL,
                confianza     REAL NOT NULL,
                version       INTEGER NOT NULL DEFAULT 1,
                autor         TEXT NOT NULL,
                activa        BOOLEAN NOT NULL DEFAULT TRUE,
                fecha_creacion TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sesiones (
                id            TEXT PRIMARY KEY,
                usuario_id    TEXT NOT NULL,
                area          TEXT NOT NULL,
                datos_entrada JSONB NOT NULL,
                timestamp     TEXT NOT NULL,
                estado        TEXT NOT NULL DEFAULT 'pendiente'
            );

            CREATE TABLE IF NOT EXISTS recomendaciones (
                id               TEXT PRIMARY KEY,
                sesion_id        TEXT NOT NULL REFERENCES sesiones(id),
                reglas_activadas JSONB NOT NULL,
                accion_sugerida  TEXT NOT NULL,
                justificacion    TEXT NOT NULL,
                puntaje          REAL NOT NULL,
                alternativas     JSONB NOT NULL,
                timestamp        TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS retroalimentacion (
                id                TEXT PRIMARY KEY,
                sesion_id         TEXT NOT NULL,
                recomendacion_id  TEXT NOT NULL REFERENCES recomendaciones(id),
                calificacion      INTEGER NOT NULL,
                fue_util          BOOLEAN NOT NULL,
                comentario        TEXT NOT NULL DEFAULT '',
                timestamp         TEXT NOT NULL
            );
        """)
    conn.commit()


def seed_reglas(conn) -> None:
    seed_path = os.path.join(os.path.dirname(__file__), "..", "data", "reglas_seed.json")
    seed_path = os.path.normpath(seed_path)

    with open(seed_path, encoding="utf-8") as f:
        reglas = json.load(f)

    with conn.cursor() as cur:
        for r in reglas:
            cur.execute(
                """
                INSERT INTO reglas
                    (id, area, condiciones, accion, justificacion, confianza,
                     version, autor, activa, fecha_creacion)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                (
                    r["id"], r["area"], json.dumps(r["condiciones"]),
                    r["accion"], r["justificacion"], r["confianza"],
                    r["version"], r["autor"], r["activa"], r["fecha_creacion"],
                ),
            )
    conn.commit()


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    init_pool()
    conn = _pool.getconn()
    try:
        create_tables(conn)
        seed_reglas(conn)
        print("Base de datos inicializada con reglas semilla.")
    finally:
        _pool.putconn(conn)
        _pool.closeall()
