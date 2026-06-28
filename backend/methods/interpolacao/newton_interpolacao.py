"""
newton_interpolacao.py — Interpolação de Newton por Diferenças Divididas.

Constrói o polinômio:
  P(x) = c₀ + c₁(x−x₀) + c₂(x−x₀)(x−x₁) + ⋯
onde cₖ = f[x₀, x₁, …, xₖ] são as diferenças divididas de ordem k.
"""


def newton_interpolacao(pontos, x_eval):
    """
    Interpolação de Newton por diferenças divididas.

    pontos  : list of [x, y] — pontos de interpolação (mínimo 2)
    x_eval  : float           — ponto onde avaliar o polinômio

    Retorna dict com:
      resultado    : float
      grau         : int
      x_avaliado   : float
      coeficientes : list[float]  — [c0, c1, ..., cn-1]
      tabela_dd    : list[dict]   — tabela triangular de diferenças divididas
      termos       : list[dict]   — contribuição de cada termo do polinômio
    """
    n = len(pontos)
    xs = [float(p[0]) for p in pontos]
    ys = [float(p[1]) for p in pontos]

    for i in range(n):
        for j in range(i + 1, n):
            if abs(xs[i] - xs[j]) < 1e-14:
                raise ValueError(
                    f"Os pontos x_{i} e x_{j} têm o mesmo valor x = {xs[i]}. "
                    "Os valores de x devem ser distintos."
                )

    # Tabela de diferenças divididas: dd[i][j] = f[x_i, ..., x_{i+j}]
    dd = [[0.0] * n for _ in range(n)]
    for i in range(n):
        dd[i][0] = ys[i]

    for j in range(1, n):
        for i in range(n - j):
            dd[i][j] = (dd[i + 1][j - 1] - dd[i][j - 1]) / (xs[i + j] - xs[i])

    # Coeficientes: primeira "diagonal" da tabela (linha 0)
    coeficientes = [dd[0][j] for j in range(n)]

    # Avalia cada termo e acumula o resultado
    resultado = 0.0
    termos = []

    for k in range(n):
        produto_bases = 1.0
        bases_xs = xs[:k]
        for j in range(k):
            produto_bases *= (x_eval - xs[j])

        coef = coeficientes[k]
        contribuicao = coef * produto_bases
        resultado += contribuicao

        termos.append({
            "k":             k,
            "coef":          coef,
            "produto_bases": produto_bases,
            "bases_xs":      bases_xs,
            "contribuicao":  contribuicao,
        })

    # Tabela triangular para exibição no frontend
    tabela_dd = []
    for i in range(n):
        tabela_dd.append({
            "xi":         xs[i],
            "diferencas": [dd[i][j] for j in range(n - i)],
        })

    return {
        "resultado":    resultado,
        "grau":         n - 1,
        "x_avaliado":   x_eval,
        "coeficientes": coeficientes,
        "tabela_dd":    tabela_dd,
        "termos":       termos,
    }
