"""
newton.py — Método de Newton-Raphson.

Fórmula iterativa: x_{n+1} = x_n - f(x_n) / f'(x_n)

Convergência quadrática perto da raiz, mas requer:
  - Derivada não nula no ponto atual
  - Chute inicial próximo da raiz
"""

import sympy as sp
from .utils import F, parse_funcao, x


def newton(
    funcao: str,
    x0: float,
    tolerancia: float,
    criterio: str = "absoluto",
    max_iter: int = 100,
) -> dict:
    """
    Encontra raiz de `funcao` pelo método de Newton-Raphson.

    Args:
        funcao:     String da função em x, ex: "x**3 - 2*x - 5"
        x0:         Chute inicial.
        tolerancia: Valor de parada para o critério escolhido.
        criterio:   "absoluto"  → |x_{n+1} - x_n| <= tolerancia
                    "relativo"  → |x_{n+1} - x_n| / |x_{n+1}| <= tolerancia
                    "funcao"    → |f(x_n)| <= tolerancia
        max_iter:   Número máximo de iterações.

    Returns:
        {"raiz": float, "iteracoes": list[dict]}

    Raises:
        ValueError: Se a derivada for zero ou a expressão for inválida.
    """
    expr = parse_funcao(funcao)
    derivada = sp.diff(expr, x)

    iteracoes = []
    ponto_atual = float(x0)

    for i in range(max_iter):
        fx  = F(expr, ponto_atual)
        dfx = F(derivada, ponto_atual)

        if dfx == 0:
            raise ValueError(
                f"Derivada zero em x={ponto_atual:.6g} na iteração {i + 1}. "
                "Método de Newton não aplicável neste ponto."
            )

        x_novo = ponto_atual - fx / dfx

        if criterio == "relativo":
            erro = (abs(x_novo - ponto_atual) / abs(x_novo)
                    if abs(x_novo) > 1e-15
                    else abs(x_novo - ponto_atual))
        elif criterio == "funcao":
            erro = abs(fx)
        else:  # "absoluto"
            erro = abs(x_novo - ponto_atual)

        iteracoes.append({
            "iteracao": i + 1,
            "x":        ponto_atual,
            "fx":       fx,
            "dfx":      dfx,
            "x_novo":   x_novo,
            "erro":     erro,
        })

        ponto_atual = x_novo

        if erro <= tolerancia:
            break

    return {"raiz": float(ponto_atual), "iteracoes": iteracoes}
