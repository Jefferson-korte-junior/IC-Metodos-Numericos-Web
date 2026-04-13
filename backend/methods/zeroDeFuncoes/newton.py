def newton(inicial, criterio, funcao):
  if F(funcao, inicial) == 0:
    print(f"A raiz é o valor {inicial}")
  while abs(F(funcao, inicial))>criterio:
    derivada = sp.diff(funcao)
    valor_derivada = derivada.evalf(subs= {x:inicial})
    if valor_derivada == 0:
      print("Não é possível utilizar o método de Newton!")
      break
    inicial = inicial - F(funcao, inicial)/valor_derivada
  print("A raiz da função é: " + str(inicial))



  #Chat falou qeu assim esta correto
import sympy as sp
from .utils import F

x = sp.Symbol('x')

def newton(inicial, criterio, funcao):
    i = 0

    while abs(F(funcao, inicial)) > criterio:
        derivada = sp.diff(funcao)
        valor_derivada = derivada.evalf(subs={x: inicial})

        if valor_derivada == 0:
            return {"erro": "Derivada zero"}

        inicial = inicial - F(funcao, inicial) / valor_derivada
        i += 1

    return {
        "raiz": float(inicial),
        "iteracoes": i
    }