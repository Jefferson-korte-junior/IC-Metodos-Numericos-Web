def lagrange(pontos, x_eval):
    """
    Interpolação de Lagrange.

    pontos  : list of [x, y] — pontos de interpolação (mínimo 2)
    x_eval  : float           — ponto onde avaliar o polinômio

    Retorna dict com:
      resultado   : float  — P(x_eval)
      grau        : int    — grau do polinômio (n - 1)
      x_avaliado  : float  — x_eval
      termos      : list   — detalhes de cada L_i
    """
    n = len(pontos)
    xs = [float(p[0]) for p in pontos]
    ys = [float(p[1]) for p in pontos]

    # Verificar x duplicados
    for i in range(n):
        for j in range(i + 1, n):
            if abs(xs[i] - xs[j]) < 1e-14:
                raise ValueError(
                    f"Os pontos x_{i} e x_{j} têm o mesmo valor x = {xs[i]}. "
                    "Os valores de x devem ser distintos."
                )

    termos = []
    resultado = 0.0

    for i in range(n):
        fatores_num = []
        fatores_den = []
        numerador   = 1.0
        denominador = 1.0

        for j in range(n):
            if j == i:
                continue
            fn = x_eval - xs[j]
            fd = xs[i] - xs[j]
            fatores_num.append(fn)
            fatores_den.append(fd)
            numerador   *= fn
            denominador *= fd

        Li    = numerador / denominador
        termo = ys[i] * Li
        resultado += termo

        termos.append({
            "i":           i,
            "xi":          xs[i],
            "yi":          ys[i],
            "fatores_num": fatores_num,
            "fatores_den": fatores_den,
            "numerador":   numerador,
            "denominador": denominador,
            "Li":          Li,
            "termo":       termo,
        })

    return {
        "resultado":  resultado,
        "grau":       n - 1,
        "x_avaliado": x_eval,
        "termos":     termos,
    }
