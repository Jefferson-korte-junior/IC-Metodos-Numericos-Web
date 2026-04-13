def secante(a,b,criterio,funcao):
  f_a = F(funcao, a)
  f_b = F(funcao, b)
  while abs(f_b) > criterio:
    f_a = F(funcao, a)
    f_b = F(funcao, b)
    proximo = (a*f_b-b*f_a)/(f_b-f_a)
    a = b
    b = proximo



#Chat falou qeu assim esta correto
from .utils import F

def secante(a, b, criterio, funcao):
    i = 0

    f_a = F(funcao, a)
    f_b = F(funcao, b)

    while abs(f_b) > criterio:
        if (f_b - f_a) == 0:
            return {"erro": "Divisão por zero"}

        proximo = (a * f_b - b * f_a) / (f_b - f_a)

        a = b
        b = proximo

        f_a = F(funcao, a)
        f_b = F(funcao, b)

        i += 1

    return {
        "raiz": float(b),
        "iteracoes": i
    }