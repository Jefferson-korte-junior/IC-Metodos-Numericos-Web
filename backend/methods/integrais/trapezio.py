from methods.zeroDeFuncoes.utils import parse_funcao, F


def trapezio(funcao: str, a: float, b: float, n: int) -> dict:
    """
    Regra dos Trapézios Composta.
    I ≈ (h/2) · [f(x₀) + 2·f(x₁) + ... + 2·f(xₙ₋₁) + f(xₙ)]
    h = (b − a) / n
    """
    if n < 1:
        raise ValueError("n deve ser pelo menos 1.")
    if a >= b:
        raise ValueError("O limite inferior a deve ser menor que b.")

    expr = parse_funcao(funcao)
    h = (b - a) / n

    pontos = []
    for i in range(n + 1):
        xi = a + i * h
        fi = F(expr, xi)
        peso = 1 if (i == 0 or i == n) else 2
        pontos.append({"i": i, "xi": xi, "fi": fi, "peso": peso})

    soma_ponderada = sum(p["fi"] * p["peso"] for p in pontos)
    resultado = (h / 2) * soma_ponderada

    return {
        "resultado":       resultado,
        "h":               h,
        "n":               n,
        "a":               a,
        "b":               b,
        "soma_ponderada":  soma_ponderada,
        "pontos":          pontos,
    }
