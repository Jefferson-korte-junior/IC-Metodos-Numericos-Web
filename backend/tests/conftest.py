"""
conftest.py — Fixtures e helpers compartilhados para a suíte de testes.

Convenções usadas nesta suíte:
  - CRITERIO_PADRAO  : tolerância padrão para testes de convergência normal
  - CRITERIO_FINO    : tolerância alta para testes de precisão
  - assert_raiz_valida: helper que centraliza as asserções de corretude matemática
"""

import math
import pytest


# ---------------------------------------------------------------------------
# Constantes
# ---------------------------------------------------------------------------

CRITERIO_PADRAO = 1e-6
CRITERIO_FINO   = 1e-10


# ---------------------------------------------------------------------------
# Helpers matemáticos
# ---------------------------------------------------------------------------

def avaliar(expressao: str, x_val: float) -> float:
    """
    Avalia uma string de expressão matemática em x_val usando o mesmo
    parse_funcao do projeto — garante que os testes usem o mesmo caminho
    de parsing que a produção.
    """
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from methods.zeroDeFuncoes.utils import F
    return F(expressao, x_val)


def assert_raiz_valida(resultado: dict, expressao: str, raiz_esperada: float, tolerancia: float) -> None:
    """
    Asserções canônicas para qualquer método de busca de raiz.

    Verifica:
      1. Estrutura do retorno (chaves obrigatórias presentes)
      2. Tipo correto da raiz
      3. |raiz - raiz_esperada| <= tolerancia  (precisão)
      4. |f(raiz)| <= tolerancia               (residual matemático)
      5. Lista de iterações não vazia
      6. Cada iteração tem os campos esperados
    """
    assert "raiz" in resultado,      "Retorno deve conter chave 'raiz'"
    assert "iteracoes" in resultado, "Retorno deve conter chave 'iteracoes'"

    raiz = resultado["raiz"]
    assert isinstance(raiz, float), f"'raiz' deve ser float, obteve {type(raiz)}"

    assert abs(raiz - raiz_esperada) <= tolerancia, (
        f"Raiz calculada {raiz:.10g} está longe da esperada {raiz_esperada}. "
        f"Erro absoluto: {abs(raiz - raiz_esperada):.2e}, tolerância: {tolerancia:.2e}"
    )

    residual = abs(avaliar(expressao, raiz))
    assert residual <= tolerancia, (
        f"|f(raiz)| = {residual:.2e} excede a tolerância {tolerancia:.2e}. "
        "A raiz não satisfaz o critério de parada matemático."
    )

    iteracoes = resultado["iteracoes"]
    assert len(iteracoes) > 0, "Lista de iterações não pode ser vazia"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def criterio_padrao():
    return CRITERIO_PADRAO


@pytest.fixture
def criterio_fino():
    return CRITERIO_FINO
