import sys
import os

# Permite importar kbdss.* sin instalar el paquete
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from adapters.api.routes import router
import infrastructure.database as db

app = FastAPI(
    title="KBDSS — Motor de Reglas Nexus-Corp",
    description="Knowledge-Based Decision Support System para logística y ventas",
    version="1.0.0",
)

# TODO: reemplaza "*" por la URL del frontend en producción
# ej: allow_origins=["https://kbdss-frontend.onrender.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def startup():
    db.init_pool()
    conn = db._pool.getconn()
    try:
        db.create_tables(conn)
        db.seed_reglas(conn)
    finally:
        db._pool.putconn(conn)


@app.get("/health")
def health():
    return {"status": "ok"}
