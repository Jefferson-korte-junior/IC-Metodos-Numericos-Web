"""
bissecao.py — Método da Bisseção.

Teorema de Bolzano: se f(a)*f(b) < 0 e f é contínua em [a,b],
existe pelo menos uma raiz no intervalo.
"""

from .utils import F, parse_funcao


def bissecao(funcao: str, a: float, b: float, criterio: float) -> dict:
    """
    Encontra uma raiz de `funcao` no intervalo [a, b] pelo método da bisseção.

    Args:
        funcao:   String da função em x, ex: "x**3 - x - 2"
        a:        Extremo esquerdo do intervalo.
        b:        Extremo direito do intervalo.
        criterio: Tolerância de parada — itera enquanto |f(media)| > criterio.

    Returns:
        {
            "raiz":      float,
            "iteracoes": list[dict],   # histórico completo de cada passo
        }

    Raises:
        ValueError: Se não houver mudança de sinal em [a, b] ou expressão inválida.
    """
    # Parseia uma única vez — evita re-parse a cada avaliação
    expr = parse_funcao(funcao)

    fa = F(expr, a)
    fb = F(expr, b)

    if fa * fb > 0:
        raise ValueError(
            f"Não é possível afirmar que há raiz no intervalo [{a}, {b}]: "
            f"f(a)={fa:.6g} e f(b)={fb:.6g} têm o mesmo sinal."
        )

    iteracoes = []
    media = (a + b) / 2

    for i in range(100):
        fa = F(expr, a)
        fb = F(expr, b)
        media = (a + b) / 2
        fm = F(expr, media)

        substituiu = "a" if fa * fm > 0 else "b"

        iteracoes.append({
            "iteracao":   i,
            "a":          a,
            "b":          b,
            "media":      media,
            "fa":         fa,
            "fb":         fb,
            "fm":         fm,
            "substituiu": substituiu,
        })

        if abs(fm) <= criterio:
            break

        if substituiu == "a":
            a = media
        else:
            b = media

    return {"raiz": float(media), "iteracoes": iteracoes}
