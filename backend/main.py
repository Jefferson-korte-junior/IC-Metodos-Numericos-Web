# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sympy as sp

from methods.sistemasLineares.jacobi import jacobi
from methods.sistemasLineares.gauss_seidel import gauss_seidel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class BissecaoInput(BaseModel):
    funcao: str
    a: float
    b: float
    criterio: float


class SistemaInput(BaseModel):
    A: list
    b: list
    chute: list
    tolerancia: float


def calcular_f(expressao, x_val):
    x = sp.symbols('x')
    expr = sp.parse_expr(expressao.replace('^', '**'))
    return float(expr.subs(x, x_val))


@app.post("/calcular")
async def bissecao(data: BissecaoInput):
    a, b = data.a, data.b
    f_str = data.funcao
    crit = data.criterio

    fa_inicial = calcular_f(f_str, a)
    fb_inicial = calcular_f(f_str, b)

    if fa_inicial * fb_inicial > 0:
        return {"erro": "Não é possível afirmar que há raízes no intervalo [a, b]"}

    iteracoes = []
    i = 0

    while i < 100:
        fa = calcular_f(f_str, a)
        fb = calcular_f(f_str, b)
        media = (a + b) / 2
        fm = calcular_f(f_str, media)

        # Decide qual extremo substituir
        if fa * fm > 0:
            substituiu = "a"
        else:
            substituiu = "b"

        iteracoes.append({
            "iteracao": i,
            "a": a,
            "b": b,
            "media": media,
            "fa": fa,
            "fb": fb,
            "fm": fm,
            "substituiu": substituiu,
        })

        # Critério de parada
        if abs(fm) <= crit:
            break

        # Atualiza o intervalo após registrar
        if substituiu == "a":
            a = media
        else:
            b = media

        i += 1

    return {"raiz": media, "iteracoes": iteracoes}


@app.post("/jacobi")
async def calcular_jacobi(data: SistemaInput):
    resultado = jacobi(data.A, data.b, data.chute, data.tolerancia)
    return resultado


@app.post("/gauss-seidel")
async def calcular_gauss(data: SistemaInput):
    resultado = gauss_seidel(data.A, data.b, data.chute, data.tolerancia)
    return resultado

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)