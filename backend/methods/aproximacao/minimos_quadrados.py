def _gauss_eliminacao(A, b):
    """Eliminação de Gauss com pivoteamento parcial para resolver Ax = b."""
    n = len(b)
    M = [[A[i][j] for j in range(n)] + [b[i]] for i in range(n)]

    for col in range(n):
        max_row = col
        for row in range(col + 1, n):
            if abs(M[row][col]) > abs(M[max_row][col]):
                max_row = row
        M[col], M[max_row] = M[max_row], M[col]

        if abs(M[col][col]) < 1e-12:
            raise ValueError(
                "Sistema de equações normais singular — "
                "os pontos podem ser colineares ou em número insuficiente para o grau pedido."
            )

        for row in range(col + 1, n):
            f = M[row][col] / M[col][col]
            for j in range(col, n + 1):
                M[row][j] -= f * M[col][j]

    x = [0.0] * n
    for i in range(n - 1, -1, -1):
        x[i] = M[i][n]
        for j in range(i + 1, n):
            x[i] -= M[i][j] * x[j]
        x[i] /= M[i][i]

    return x


def minimos_quadrados(pontos, grau):
    """
    Ajuste por Mínimos Quadrados (regressão polinomial).

    pontos : list of [x, y]  — dados observados (mínimo grau+1 pontos)
    grau   : int              — grau do polinômio de ajuste (1, 2 ou 3)

    Retorna dict com:
      coeficientes : list[float]  — [a₀, a₁, ..., aₘ]
      grau         : int
      n_pontos     : int
      r_quadrado   : float        — R²
      rmse         : float        — raiz do erro quadrático médio
      tabela       : list[dict]   — por ponto: xi, yi, yi_calc, erro, erro2
      somas        : dict         — somas auxiliares para modo didático
      matriz_A     : list[list]   — matriz do sistema normal
      vetor_b      : list[float]  — vetor b do sistema normal
      equacao      : str
      y_medio      : float
      ss_res       : float
      ss_tot       : float
    """
    n = len(pontos)
    m = grau

    if n < 2:
        raise ValueError("São necessários pelo menos 2 pontos.")
    if m < 1:
        raise ValueError("O grau deve ser pelo menos 1.")
    if n <= m:
        raise ValueError(
            f"São necessários pelo menos {m + 1} pontos para ajuste de grau {m}."
        )

    xs = [float(p[0]) for p in pontos]
    ys = [float(p[1]) for p in pontos]

    # Somas potenciais: pot_x[k] = Σ xᵢ^k,  pot_xy[k] = Σ xᵢ^k · yᵢ
    pot_x  = [sum(x ** k for x in xs)             for k in range(2 * m + 1)]
    pot_xy = [sum((xs[i] ** k) * ys[i] for i in range(n)) for k in range(m + 1)]

    # Matriz e vetor das equações normais
    A_mat = [[pot_x[i + j] for j in range(m + 1)] for i in range(m + 1)]
    b_vec = list(pot_xy)

    coef = _gauss_eliminacao(A_mat, b_vec)

    # Valores calculados e resíduos
    y_calc = [sum(coef[k] * (xs[i] ** k) for k in range(m + 1)) for i in range(n)]
    erros  = [ys[i] - y_calc[i] for i in range(n)]
    erros2 = [e ** 2 for e in erros]

    y_medio = sum(ys) / n
    ss_res  = sum(erros2)
    ss_tot  = sum((y - y_medio) ** 2 for y in ys)
    r2      = 1.0 - ss_res / ss_tot if abs(ss_tot) > 1e-14 else 1.0
    rmse    = (ss_res / n) ** 0.5

    tabela = [
        {
            "i":       i,
            "xi":      xs[i],
            "yi":      ys[i],
            "yi_calc": y_calc[i],
            "erro":    erros[i],
            "erro2":   erros2[i],
        }
        for i in range(n)
    ]

    # Somas para exibição didática
    somas = {
        "n":      n,
        "sum_x":  pot_x[1],
        "sum_y":  pot_xy[0],
        "sum_x2": pot_x[2],
        "sum_xy": pot_xy[1],
    }
    if m >= 2:
        somas["sum_x3"]  = pot_x[3]
        somas["sum_x4"]  = pot_x[4]
        somas["sum_x2y"] = pot_xy[2]
    if m >= 3:
        somas["sum_x5"]  = pot_x[5]
        somas["sum_x6"]  = pot_x[6]
        somas["sum_x3y"] = pot_xy[3]

    # String da equação
    partes = [f"{coef[0]:.6f}"]
    for k in range(1, m + 1):
        c       = coef[k]
        pot_str = "x" if k == 1 else f"x^{k}"
        if c >= 0:
            partes.append(f"+ {c:.6f}·{pot_str}")
        else:
            partes.append(f"- {abs(c):.6f}·{pot_str}")
    equacao = "y = " + " ".join(partes)

    return {
        "coeficientes": coef,
        "grau":         m,
        "n_pontos":     n,
        "r_quadrado":   r2,
        "rmse":         rmse,
        "tabela":       tabela,
        "somas":        somas,
        "matriz_A":     A_mat,
        "vetor_b":      b_vec,
        "equacao":      equacao,
        "y_medio":      y_medio,
        "ss_res":       ss_res,
        "ss_tot":       ss_tot,
    }
