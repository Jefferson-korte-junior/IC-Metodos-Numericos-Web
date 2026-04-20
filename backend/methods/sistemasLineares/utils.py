def criterio(A, b, chute):
    soma_final = 0
    for linha in range(len(A)):
        soma_linha = b[linha]
        for coluna in range(len(A[linha])):
            soma_linha -= A[linha][coluna] * chute[coluna]
        soma_final += abs(soma_linha)
    return soma_final
    