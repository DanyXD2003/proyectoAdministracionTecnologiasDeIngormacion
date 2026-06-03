from domain.entities import Regla

_OPERADORES = {
    "eq":       lambda d, v: d == v,
    "neq":      lambda d, v: d != v,
    "gt":       lambda d, v: d > v,
    "gte":      lambda d, v: d >= v,
    "lt":       lambda d, v: d < v,
    "lte":      lambda d, v: d <= v,
    "contains": lambda d, v: v in d,
}


class BaseConocimiento:
    def __init__(self, reglas: list[Regla]):
        self.reglas = [r for r in reglas if r.activa]

    def evaluar(self, datos: dict, area: str) -> list[Regla]:
        """
        Evalúa todas las reglas activas del área indicada contra los datos.
        Retorna lista de reglas activadas, ordenadas por confianza DESC.
        """
        candidatas = [r for r in self.reglas if r.area == area]
        activadas = [r for r in candidatas if self._evaluar_regla(r, datos)]
        return sorted(activadas, key=lambda r: r.confianza, reverse=True)

    def _evaluar_regla(self, regla: Regla, datos: dict) -> bool:
        """Retorna True si TODAS las condiciones de la regla se cumplen."""
        return all(self._evaluar_condicion(c, datos) for c in regla.condiciones)

    def _evaluar_condicion(self, condicion: dict, datos: dict) -> bool:
        """
        Evalúa una condición individual contra los datos.
        Si el campo no existe en datos retorna False sin lanzar excepción.
        """
        campo = condicion["campo"]
        operador = condicion["operador"]
        valor = condicion["valor"]

        if campo not in datos:
            return False

        op_func = _OPERADORES.get(operador)
        if op_func is None:
            return False

        try:
            return op_func(datos[campo], valor)
        except TypeError:
            return False
