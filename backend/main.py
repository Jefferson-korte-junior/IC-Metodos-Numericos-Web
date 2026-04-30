"""
main.py — Backend FastAPI 

Endpoints de métodos numéricos:
  POST /calcular       → Bisseção
  POST /newton         → Newton-Raphson
  POST /secante        → Secante
  POST /jacobi         → Jacobi (sistemas lineares)
  POST /gauss-seidel   → Gauss-Seidel (sistemas lineares)

ARQUITETURA:
  Toda lógica de cálculo vive nos módulos de método.
  Este arquivo é responsável apenas por receber, validar e rotear requisições.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from methods.zeroDeFuncoes.bissecao import bissecao
from methods.zeroDeFuncoes.newton import newton
from methods.zeroDeFuncoes.secante import secante
from methods.sistemasLineares.jacobi import jacobi
from methods.sistemasLineares.gauss_seidel import gauss_seidel

app = FastAPI(title="IC — API de Métodos Numéricos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Em produção: restringir para o domínio do frontend
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas de entrada
# ---------------------------------------------------------------------------

class EntradaMetodoUniDimensional(BaseModel):
    funcao: str
    criterio: float


class EntradaBissecao(EntradaMetodoUniDimensional):
    a: float
    b: float


class EntradaNewton(EntradaMetodoUniDimensional):
    inicial: float


class EntradaSecante(EntradaMetodoUniDimensional):
    a: float
    b: float


class EntradaSistema(BaseModel):
    A: list
    b: list
    chute: list
    tolerancia: float


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/calcular")
async def endpoint_bissecao(data: EntradaBissecao):
    """Método da Bisseção."""
    try:
        return bissecao(
            funcao=data.funcao,
            a=data.a,
            b=data.b,
            criterio=data.criterio,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/newton")
async def endpoint_newton(data: EntradaNewton):
    """Método de Newton-Raphson."""
    try:
        return newton(
            funcao=data.funcao,
            inicial=data.inicial,
            criterio=data.criterio,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/secante")
async def endpoint_secante(data: EntradaSecante):
    """Método da Secante."""
    try:
        return secante(
            funcao=data.funcao,
            a=data.a,
            b=data.b,
            criterio=data.criterio,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/jacobi")
async def endpoint_jacobi(data: EntradaSistema):
    resultado = jacobi(data.A, data.b, data.chute, data.tolerancia)
    return resultado


@app.post("/gauss-seidel")
async def endpoint_gauss_seidel(data: EntradaSistema):
    resultado = gauss_seidel(data.A, data.b, data.chute, data.tolerancia)
    return resultado


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
