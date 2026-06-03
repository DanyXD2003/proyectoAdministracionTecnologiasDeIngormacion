"""
Tests de integración de la API usando FastAPI TestClient con repos en memoria.
No requieren base de datos real.
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "kbdss"))

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from adapters.api.routes import router
from adapters.api.deps import (
    get_regla_repo, get_sesion_repo, get_rec_repo, get_feedback_repo,
)
from domain.entities import Regla


# ── Repos en memoria ──────────────────────────────────────────────────────────

class _FakeReglaRepo:
    def __init__(self): self._s: dict = {}

    def guardar(self, r): self._s[r.id] = r
    def obtener(self, id): return self._s.get(id)
    def listar(self, area=None):
        rows = list(self._s.values())
        if area:
            rows = [r for r in rows if r.area == area]
        return sorted(rows, key=lambda x: x.confianza, reverse=True)
    def listar_activas(self, area):
        return [r for r in self.listar(area) if r.activa]


class _FakeSesionRepo:
    def __init__(self): self._s = {}
    def guardar(self, s): self._s[s.id] = s
    def obtener(self, id): return self._s.get(id)
    def actualizar_estado(self, id, estado):
        if id in self._s: self._s[id].estado = estado
    def contar(self): return len(self._s)


class _FakeRecRepo:
    def __init__(self): self._r = {}
    def guardar(self, r): self._r[r.id] = r
    def obtener(self, id): return self._r.get(id)
    def listar(self): return list(self._r.values())
    def contar(self): return len(self._r)
    def contar_sin_recomendacion(self):
        return sum(1 for r in self._r.values() if r.puntaje == 0.0)
    def reglas_mas_activadas(self, limite=5): return []


class _FakeFbRepo:
    def __init__(self): self._f = {}
    def guardar(self, f): self._f[f.id] = f
    def listar(self): return list(self._f.values())
    def tasa_utilidad(self): return 0.0
    def calificacion_promedio(self): return 0.0


# ── App de test ───────────────────────────────────────────────────────────────

_regla_repo = _FakeReglaRepo()
_sesion_repo = _FakeSesionRepo()
_rec_repo = _FakeRecRepo()
_fb_repo = _FakeFbRepo()

# Regla semilla para los tests
_regla_repo.guardar(Regla(
    id="r001", area="ventas",
    condiciones=[
        {"campo": "consultas_precio", "operador": "gte", "valor": 3},
        {"campo": "volumen_potencial", "operador": "gte", "valor": 5000},
    ],
    accion="Ofrecer descuento escalonado del 5-10%",
    justificacion="Cliente con alta intención de compra.",
    confianza=0.87, version=1, autor="Ana García",
    activa=True, fecha_creacion="2026-01-15T09:00:00Z",
))

app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_regla_repo]   = lambda: _regla_repo
app.dependency_overrides[get_sesion_repo]  = lambda: _sesion_repo
app.dependency_overrides[get_rec_repo]     = lambda: _rec_repo
app.dependency_overrides[get_feedback_repo] = lambda: _fb_repo

client = TestClient(app)


# ── Tests ─────────────────────────────────────────────────────────────────────

def test_evaluar_retorna_recomendacion():
    resp = client.post("/sesiones/evaluar", json={
        "usuario_id": "u1",
        "area": "ventas",
        "datos": {"consultas_precio": 4, "volumen_potencial": 7500},
    })
    assert resp.status_code == 200
    body = resp.json()
    assert body["recomendacion"]["puntaje"] == 0.87
    assert body["reglas_activadas"] == 1


def test_evaluar_sin_datos_retorna_sin_recomendacion():
    resp = client.post("/sesiones/evaluar", json={
        "usuario_id": "u1",
        "area": "ventas",
        "datos": {},
    })
    assert resp.status_code == 200
    body = resp.json()
    assert body["recomendacion"]["puntaje"] == 0.0
    assert body["reglas_activadas"] == 0


def test_listar_reglas():
    resp = client.get("/reglas")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    assert len(resp.json()) >= 1


def test_listar_reglas_filtro_area():
    resp = client.get("/reglas?area=ventas")
    assert resp.status_code == 200
    for r in resp.json():
        assert r["area"] == "ventas"


def test_crear_regla():
    resp = client.post("/reglas", json={
        "area": "logistica",
        "condiciones": [{"campo": "retraso_dias", "operador": "gt", "valor": 5}],
        "accion": "Escalar a gerente de operaciones",
        "justificacion": "Retraso crítico.",
        "confianza": 0.80,
        "autor": "Pedro López",
    })
    assert resp.status_code == 201
    body = resp.json()
    assert body["area"] == "logistica"
    assert body["version"] == 1


def test_kpis():
    resp = client.get("/kpis")
    assert resp.status_code == 200
    body = resp.json()
    assert "total_sesiones" in body
    assert "tasa_utilidad" in body
