"""
secante.py — Método da Secante.

Fórmula iterativa: x_{n+1} = (x_{n-1}*f(x_n) - x_n*f(x_{n-1})) / (f(x_n) - f(x_{n-1}))

Vantagem sobre Newton: não requer cálculo de derivada analítica.
Convergência superlinear (ordem ≈ 1.618).
"""

from .utils import F, parse_funcao


def secante(
    funcao: str,
    x0: float,
    x1: float,
    tolerancia: float,
    criterio: str = "absoluto",
    max_iter: int = 100,
) -> dict:
    """
    Encontra raiz de `funcao` pelo método da secante.

    Args:
        funcao:     String da função em x, ex: "cos(x) - x"
        x0:         Primeiro ponto inicial.
        x1:         Segundo ponto inicial.
        tolerancia: Valor de parada para o critério escolhido.
        criterio:   "absoluto"  → |x_{n+1} - x_n| <= tolerancia
                    "relativo"  → |x_{n+1} - x_n| / |x_{n+1}| <= tolerancia
                    "funcao"    → |f(x_n)| <= tolerancia
        max_iter:   Número máximo de iterações.

    Returns:
        {"raiz": float, "iteracoes": list[dict]}

    Raises:
        ValueError: Se f(x_n) - f(x_{n-1}) = 0 ou expressão inválida.
    """
    expr = parse_funcao(funcao)

    x_ant = float(x0)
    x_cur = float(x1)
    f_ant = F(expr, x_ant)
    f_cur = F(expr, x_cur)

    iteracoes = []

    for i in range(max_iter):
        denominador = f_cur - f_ant
        if denominador == 0:
            raise ValueError(
                f"Divisão por zero na iteração {i + 1}: f(x_n) - f(x_{{n-1}}) = 0. "
                "Método da Secante não convergiu."
            )

        x_novo = (x_ant * f_cur - x_cur * f_ant) / denominador
        f_novo = F(expr, x_novo)

        if criterio == "relativo":
            erro = (abs(x_novo - x_cur) / abs(x_novo)
                    if abs(x_novo) > 1e-15
                    else abs(x_novo - x_cur))
        elif criterio == "funcao":
            erro = abs(f_cur)
        else:  # "absoluto"
            erro = abs(x_novo - x_cur)

        iteracoes.append({
            "iteracao":   i + 1,
            "x_anterior": x_ant,
            "x":          x_cur,
            "fx_anterior": f_ant,
            "fx":         f_cur,
            "x_novo":     x_novo,
            "erro":       erro,
        })

        x_ant, f_ant = x_cur, f_cur
        x_cur, f_cur = x_novo, f_novo

        if erro <= tolerancia:
            break

    return {"raiz": float(x_cur), "iteracoes": iteracoes}
