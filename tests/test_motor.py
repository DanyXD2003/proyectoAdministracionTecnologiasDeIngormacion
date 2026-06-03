import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "kbdss"))

import pytest
from domain.entities import Regla, Sesion
from domain.base_conocimiento import BaseConocimiento
from use_cases.evaluar_situacion import EvaluarSituacion
from use_cases.registrar_feedback import RegistrarFeedback


# ── Fixtures ──────────────────────────────────────────────────────────────────

def _regla(id, confianza, condiciones, area="ventas") -> Regla:
    return Regla(
        id=id, area=area, condiciones=condiciones,
        accion=f"Acción {id}", justificacion=f"Justificación {id}",
        confianza=confianza, version=1, autor="Test",
        activa=True, fecha_creacion="2026-01-01T00:00:00Z",
    )


R001 = _regla("r001", 0.87, [
    {"campo": "consultas_precio", "operador": "gte", "valor": 3},
    {"campo": "volumen_potencial", "operador": "gte", "valor": 5000},
])

R003 = _regla("r003", 0.74, [
    {"campo": "consultas_precio", "operador": "gte", "valor": 3},
    {"campo": "tipo_cliente", "operador": "eq", "valor": "corporativo"},
])

R005 = _regla("r005", 0.91, [
    {"campo": "dias_sin_compra", "operador": "gte", "valor": 90},
])

TODAS = [R001, R003, R005]


# ── Tests de BaseConocimiento ─────────────────────────────────────────────────

def test_regla_se_activa_cuando_todas_condiciones_se_cumplen():
    base = BaseConocimiento(TODAS)
    activadas = base.evaluar({"consultas_precio": 4, "volumen_potencial": 7500}, "ventas")
    ids = [r.id for r in activadas]
    assert "r001" in ids


def test_regla_no_se_activa_si_una_condicion_falla():
    base = BaseConocimiento(TODAS)
    # volumen_potencial=2000 < 5000 → r001 no activa
    activadas = base.evaluar({"consultas_precio": 4, "volumen_potencial": 2000}, "ventas")
    ids = [r.id for r in activadas]
    assert "r001" not in ids


def test_multiples_reglas_ordenadas_por_confianza():
    base = BaseConocimiento(TODAS)
    activadas = base.evaluar(
        {"consultas_precio": 4, "tipo_cliente": "corporativo", "volumen_potencial": 6000},
        "ventas",
    )
    ids = [r.id for r in activadas]
    assert "r001" in ids
    assert "r003" in ids
    assert activadas[0].id == "r001"  # confianza 0.87 > 0.74


def test_sin_reglas_activadas_retorna_lista_vacia():
    base = BaseConocimiento(TODAS)
    activadas = base.evaluar({"consultas_precio": 0, "volumen_potencial": 100}, "ventas")
    assert activadas == []


def test_campo_inexistente_no_lanza_excepcion():
    base = BaseConocimiento(TODAS)
    activadas = base.evaluar({}, "ventas")
    assert isinstance(activadas, list)


def test_operador_contains():
    regla = _regla("rx", 0.5, [
        {"campo": "notas", "operador": "contains", "valor": "urgente"}
    ])
    base = BaseConocimiento([regla])
    activadas = base.evaluar({"notas": "pedido urgente confirmado"}, "ventas")
    assert len(activadas) == 1


def test_regla_inactiva_no_evalua():
    inactiva = _regla("r_off", 0.99, [{"campo": "x", "operador": "eq", "valor": 1}])
    inactiva.activa = False
    base = BaseConocimiento([inactiva])
    activadas = base.evaluar({"x": 1}, "ventas")
    assert activadas == []


# ── Tests de casos de uso ─────────────────────────────────────────────────────

class _FakeSesionRepo:
    def __init__(self): self.sesiones = {}; self.estados = {}
    def guardar(self, s): self.sesiones[s.id] = s
    def obtener(self, id): return self.sesiones.get(id)
    def actualizar_estado(self, id, estado): self.estados[id] = estado
    def contar(self): return len(self.sesiones)


class _FakeRecRepo:
    def __init__(self): self.recs = {}
    def guardar(self, r): self.recs[r.id] = r
    def obtener(self, id): return self.recs.get(id)
    def listar(self): return list(self.recs.values())
    def contar(self): return len(self.recs)
    def contar_sin_recomendacion(self): return sum(1 for r in self.recs.values() if r.puntaje == 0.0)
    def reglas_mas_activadas(self, limite=5): return []


class _FakeFeedbackRepo:
    def __init__(self): self.feedbacks = {}
    def guardar(self, f): self.feedbacks[f.id] = f
    def listar(self): return list(self.feedbacks.values())
    def tasa_utilidad(self): return 0.0
    def calificacion_promedio(self): return 0.0


def test_sin_reglas_activadas_retorna_recomendacion_vacia():
    base = BaseConocimiento(TODAS)
    sr = _FakeSesionRepo()
    rr = _FakeRecRepo()
    uc = EvaluarSituacion(base, sr, rr)
    _, rec = uc.ejecutar("u1", "ventas", {"consultas_precio": 0, "volumen_potencial": 100})
    assert rec.puntaje == 0.0
    assert "Sin recomendación" in rec.accion_sugerida


def test_feedback_actualiza_estado_sesion():
    sr = _FakeSesionRepo()
    fr = _FakeFeedbackRepo()
    uc = RegistrarFeedback(fr, sr)
    fb = uc.ejecutar("rec-1", "ses-1", calificacion=4)
    assert fb.fue_util is True
    assert sr.estados.get("ses-1") == "calificada"


def test_feedback_invalido_lanza_error():
    sr = _FakeSesionRepo()
    fr = _FakeFeedbackRepo()
    uc = RegistrarFeedback(fr, sr)
    with pytest.raises(ValueError):
        uc.ejecutar("rec-1", "ses-1", calificacion=6)
