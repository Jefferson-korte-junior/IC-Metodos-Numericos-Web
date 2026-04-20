from .utils import criterio

def gauss_seidel(A, b, chute, tolerancia):
    linhas = len(chute)

    iteracoes = []

    for i in range(100):
        for linha in range(linhas):
            soma = b[linha] / A[linha][linha]

            for coluna in range(len(A[linha])):
                if coluna != linha:
                    soma -= A[linha][coluna] * chute[coluna] / A[linha][linha]

            chute[linha] = soma

        iteracoes.append({
            "iteracao": i,
            "valores": chute.copy()
        })

        if criterio(A, b, chute) < tolerancia:
            break

    return {
        "resultado": chute,
        "iteracoes": iteracoes
    }