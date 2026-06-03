"""
Dependencias FastAPI para repos. Al usar Depends() en las rutas,
los tests pueden hacer override limpio sin monkey-patching.
"""
from fastapi import Depends

from adapters.repositories.regla_repo import ReglaRepo
from adapters.repositories.sesion_repo import SesionRepo
from adapters.repositories.recomendacion_repo import RecomendacionRepo
from adapters.repositories.feedback_repo import FeedbackRepo
from infrastructure.database import get_db


def get_regla_repo(conn=Depends(get_db)) -> ReglaRepo:
    return ReglaRepo(conn)


def get_sesion_repo(conn=Depends(get_db)) -> SesionRepo:
    return SesionRepo(conn)


def get_rec_repo(conn=Depends(get_db)) -> RecomendacionRepo:
    return RecomendacionRepo(conn)


def get_feedback_repo(conn=Depends(get_db)) -> FeedbackRepo:
    return FeedbackRepo(conn)
