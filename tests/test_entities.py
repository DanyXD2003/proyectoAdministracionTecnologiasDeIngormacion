import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "kbdss"))

from domain.entities import Regla, Recomendacion, Sesion, Retroalimentacion


def _regla_base(**kwargs) -> Regla:
    defaults = dict(
        id="r001", area="ventas",
        condiciones=[{"campo": "x", "operador": "eq", "valor": 1}],
        accion="Acción", justificacion="Justificación",
        confianza=0.9, version=1, autor="Test",
        activa=True, fecha_creacion="2026-01-01T00:00:00Z",
    )
    defaults.update(kwargs)
    return Regla(**defaults)


def test_regla_creacion():
    r = _regla_base()
    assert r.id == "r001"
    assert r.activa is True
    assert r.confianza == 0.9


def test_regla_archivada():
    r = _regla_base(activa=False)
    assert r.activa is False


def test_recomendacion_sin_alternativas():
    rec = Recomendacion(
        id="rec1", sesion_id="s1", reglas_activadas=[],
        accion_sugerida="Sin recomendación disponible",
        justificacion="N/A", puntaje=0.0, alternativas=[],
        timestamp="2026-01-01T00:00:00Z",
    )
    assert rec.puntaje == 0.0
    assert rec.alternativas == []


def test_retroalimentacion_fue_util_true():
    fb = Retroalimentacion(
        id="fb1", sesion_id="s1", recomendacion_id="rec1",
        calificacion=4, fue_util=True, comentario="",
        timestamp="2026-01-01T00:00:00Z",
    )
    assert fb.fue_util is True


def test_retroalimentacion_fue_util_false():
    fb = Retroalimentacion(
        id="fb2", sesion_id="s1", recomendacion_id="rec1",
        calificacion=2, fue_util=False, comentario="",
        timestamp="2026-01-01T00:00:00Z",
    )
    assert fb.fue_util is False
