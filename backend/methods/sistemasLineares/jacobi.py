import copy
from .utils import criterio

def jacobi(A, b, chute, tolerancia):
    chute_new = copy.deepcopy(chute)
    linhas = len(chute)

    iteracoes = []

    for i in range(100):
        for linha in range(linhas):
            soma = b[linha] / A[linha][linha]
            for coluna in range(len(A[linha])):
                if coluna != linha:
                    soma -= A[linha][coluna] * chute[coluna] / A[linha][linha]

            chute_new[linha] = soma

        chute = copy.deepcopy(chute_new)

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