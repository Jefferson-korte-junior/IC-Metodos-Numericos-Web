"""
newton.py — Método de Newton-Raphson.

Fórmula iterativa: x_{n+1} = x_n - f(x_n) / f'(x_n)

Convergência quadrática perto da raiz, mas requer:
  - Derivada não nula no ponto atual
  - Chute inicial próximo da raiz
"""

import sympy as sp
from .utils import F, parse_funcao, x


def newton(funcao: str, inicial: float, criterio: float) -> dict:
    """
    Encontra raiz de `funcao` pelo método de Newton-Raphson.

    Args:
        funcao:   String da função em x, ex: "x**3 - 2*x - 5"
        inicial:  Chute inicial x_0.
        criterio: Tolerância de parada — itera enquanto |f(x_n)| > criterio.

    Returns:
        {
            "raiz":      float,
            "iteracoes": list[dict],   # histórico completo de cada passo
        }

    Raises:
        ValueError: Se a derivada for zero (método não aplicável) ou expressão inválida.
    """
    expr = parse_funcao(funcao)

    # CORREÇÃO CRÍTICA: sp.diff(expr) sem segundo argumento pode derivar pela
    # variável errada em expressões com múltiplos símbolos, ou falhar silenciosamente.
    # Sempre especificar a variável explicitamente.
    derivada = sp.diff(expr, x)

    iteracoes = []
    ponto_atual = float(inicial)

    for i in range(100):
        fx = F(expr, ponto_atual)
        fdx = float(derivada.evalf(subs={x: ponto_atual}))

        iteracoes.append({
            "iteracao": i,
            "x":        ponto_atual,
            "fx":       fx,
            "fdx":      fdx,
        })

        if abs(fx) <= criterio:
            break

        if fdx == 0:
            raise ValueError(
                f"Derivada zero em x={ponto_atual:.6g} na iteração {i}. "
                "Método de Newton não aplicável neste ponto."
            )

        ponto_atual = ponto_atual - fx / fdx

    return {"raiz": float(ponto_atual), "iteracoes": iteracoes}
