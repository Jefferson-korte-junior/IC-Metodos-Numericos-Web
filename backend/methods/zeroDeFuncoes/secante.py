"""
secante.py — Método da Secante.

Fórmula iterativa: x_{n+1} = (x_{n-1}*f(x_n) - x_n*f(x_{n-1})) / (f(x_n) - f(x_{n-1}))

Vantagem sobre Newton: não requer cálculo de derivada analítica.
Convergência superlinear (ordem ≈ 1.618).
"""

from .utils import F, parse_funcao


def secante(funcao: str, a: float, b: float, criterio: float) -> dict:
    """
    Encontra raiz de `funcao` pelo método da secante.

    Args:
        funcao:   String da função em x, ex: "cos(x) - x"
        a:        Primeiro ponto inicial x_0.
        b:        Segundo ponto inicial x_1.
        criterio: Tolerância de parada — itera enquanto |f(b)| > criterio.

    Returns:
        {
            "raiz":      float,
            "iteracoes": list[dict],   # histórico completo de cada passo
        }

    Raises:
        ValueError: Se f(b) - f(a) = 0 (secante paralela ao eixo x) ou expressão inválida.
    """
    expr = parse_funcao(funcao)

    fa = F(expr, a)
    fb = F(expr, b)

    iteracoes = []

    for i in range(100):
        iteracoes.append({
            "iteracao": i,
            "a":        a,
            "b":        b,
            "fa":       fa,
            "fb":       fb,
        })

        if abs(fb) <= criterio:
            break

        denominador = fb - fa
        if denominador == 0:
            raise ValueError(
                f"Divisão por zero na iteração {i}: f(b) - f(a) = 0. "
                "A secante é paralela ao eixo x — método não convergiu."
            )

        proximo = (a * fb - b * fa) / denominador

        # Desloca a janela: (a, b) → (b, próximo)
        a, fa = b, fb
        b = proximo
        fb = F(expr, b)

    return {"raiz": float(b), "iteracoes": iteracoes}
