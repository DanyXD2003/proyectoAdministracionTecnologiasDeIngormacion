import sys
import os

# Permite importar kbdss.* sin instalar el paquete
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from adapters.api.routes import router
from infrastructure.database import init_pool, create_tables, seed_reglas, _pool

app = FastAPI(
    title="KBDSS — Motor de Reglas Nexus-Corp",
    description="Knowledge-Based Decision Support System para logística y ventas",
    version="1.0.0",
)

app.include_router(router)


@app.on_event("startup")
def startup():
    init_pool()
    conn = _pool.getconn()
    try:
        create_tables(conn)
        seed_reglas(conn)
    finally:
        _pool.putconn(conn)


@app.get("/health")
def health():
    return {"status": "ok"}
