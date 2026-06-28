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
from methods.interpolacao.lagrange import lagrange
from methods.interpolacao.newton_interpolacao import newton_interpolacao
from methods.aproximacao.minimos_quadrados import minimos_quadrados
from methods.integrais.trapezio import trapezio
from methods.integrais.simpson  import simpson

app = FastAPI(title="IC — API de Métodos Numéricos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas de entrada
# ---------------------------------------------------------------------------

class EntradaBissecao(BaseModel):
    funcao: str
    a: float
    b: float
    criterio: float  # tolerância de parada


class EntradaNewton(BaseModel):
    funcao: str
    x0: float
    tolerancia: float
    max_iter: int = 100
    criterio: str = "absoluto"  # "absoluto" | "relativo" | "funcao"


class EntradaSecante(BaseModel):
    funcao: str
    x0: float
    x1: float
    tolerancia: float
    max_iter: int = 100
    criterio: str = "absoluto"  # "absoluto" | "relativo" | "funcao"


class EntradaSistema(BaseModel):
    A: list
    b: list
    chute: list
    tolerancia: float


class EntradaLagrange(BaseModel):
    pontos: list   # list of [x, y] pairs
    x_eval: float


class EntradaNewtonInterpolacao(BaseModel):
    pontos: list   # list of [x, y] pairs
    x_eval: float


class EntradaMinimoQuadrado(BaseModel):
    pontos: list   # list of [x, y] pairs
    grau:   int    # polynomial degree (1, 2 or 3)


class EntradaIntegral(BaseModel):
    funcao: str
    a:      float
    b:      float
    n:      int


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
            x0=data.x0,
            tolerancia=data.tolerancia,
            criterio=data.criterio,
            max_iter=data.max_iter,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/secante")
async def endpoint_secante(data: EntradaSecante):
    """Método da Secante."""
    try:
        return secante(
            funcao=data.funcao,
            x0=data.x0,
            x1=data.x1,
            tolerancia=data.tolerancia,
            criterio=data.criterio,
            max_iter=data.max_iter,
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


@app.post("/lagrange")
async def endpoint_lagrange(data: EntradaLagrange):
    """Interpolação de Lagrange."""
    try:
        return lagrange(data.pontos, data.x_eval)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/newton-interpolacao")
async def endpoint_newton_interpolacao(data: EntradaNewtonInterpolacao):
    """Interpolação de Newton por Diferenças Divididas."""
    try:
        return newton_interpolacao(data.pontos, data.x_eval)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/minimos-quadrados")
async def endpoint_minimos_quadrados(data: EntradaMinimoQuadrado):
    """Aproximação por Mínimos Quadrados (regressão polinomial)."""
    try:
        return minimos_quadrados(data.pontos, data.grau)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/trapezio")
async def endpoint_trapezio(data: EntradaIntegral):
    """Integração pela Regra dos Trapézios Composta."""
    try:
        return trapezio(data.funcao, data.a, data.b, data.n)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/simpson")
async def endpoint_simpson(data: EntradaIntegral):
    """Integração pela Regra de Simpson 1/3 Composta."""
    try:
        return simpson(data.funcao, data.a, data.b, data.n)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
