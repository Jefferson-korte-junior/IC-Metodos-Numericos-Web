# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sympy as sp

from methods.sistemasLineares.jacobi import jacobi
from methods.sistemasLineares.gauss_seidel import gauss_seidel

app = FastAPI()

# Permite que o React (geralmente na porta 3000 ou 5173) acesse o Python
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
    # Transforma a string em uma função matemática
    expr = sp.parse_expr(expressao.replace('^', '**'))
    return float(expr.subs(x, x_val))


@app.post("/calcular")
async def bissecao(data: BissecaoInput):
    a, b = data.a, data.b
    f_str = data.funcao
    crit = data.criterio

    if calcular_f(f_str, a) * calcular_f(f_str, b) > 0:
        return {"erro": "Não é possível afirmar que há raízes no intervalo [a, b]"}

    media = (a + b) / 2
    iteracoes = []
    i = 0

    while abs(calcular_f(f_str, media)) > crit and i < 100:
        media = (a + b) / 2
        valor_f = calcular_f(f_str, media)

        iteracoes.append({"iteracao": i, "media": media, "f_x": valor_f})

        if calcular_f(f_str, a) * valor_f > 0:
            a = media
        else:
            b = media
        i += 1

    return {"raiz": media, "iteracoes": iteracoes}



# Rotas para os métodos de sistemas lineares (Jacobi e Seidel)
@app.post("/jacobi")
async def calcular_jacobi(data: SistemaInput):
    resultado = jacobi(data.A, data.b, data.chute, data.tolerancia)
    return resultado


@app.post("/gauss-seidel")
async def calcular_gauss(data: SistemaInput):
    resultado = gauss_seidel(data.A, data.b, data.chute, data.tolerancia)
    return resultado