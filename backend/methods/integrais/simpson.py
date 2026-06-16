from methods.zeroDeFuncoes.utils import parse_funcao, F


def simpson(funcao: str, a: float, b: float, n: int) -> dict:
    """
    Regra de Simpson 1/3 Composta.
    I ≈ (h/3) · [f(x₀) + 4f(x₁) + 2f(x₂) + 4f(x₃) + ... + 4f(xₙ₋₁) + f(xₙ)]
    Pesos: 1, 4, 2, 4, 2, ..., 4, 1
    n deve ser par.
    """
    if n < 2 or n % 2 != 0:
        raise ValueError("n deve ser par e maior ou igual a 2 para a Regra de Simpson 1/3.")
    if a >= b:
        raise ValueError("O limite inferior a deve ser menor que b.")

    expr = parse_funcao(funcao)
    h = (b - a) / n

    pontos = []
    for i in range(n + 1):
        xi = a + i * h
        fi = F(expr, xi)
        if i == 0 or i == n:
            peso = 1
        elif i % 2 == 1:
            peso = 4
        else:
            peso = 2
        pontos.append({"i": i, "xi": xi, "fi": fi, "peso": peso})

    soma_ponderada = sum(p["fi"] * p["peso"] for p in pontos)
    resultado = (h / 3) * soma_ponderada

    return {
        "resultado":       resultado,
        "h":               h,
        "n":               n,
        "a":               a,
        "b":               b,
        "soma_ponderada":  soma_ponderada,
        "pontos":          pontos,
    }
