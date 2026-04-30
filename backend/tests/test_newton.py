"""
test_newton.py — Testes para o método de Newton-Raphson.

Categorias cobertas:
  A. Corretude matemática (raízes conhecidas)
  B. Precisão numérica e convergência quadrática
  C. Estrutura e integridade do retorno
  D. Invariantes do algoritmo
  E. Casos de erro e edge cases (derivada zero, divergência)
  F. Segurança — injeção de código
"""

import math
import pytest

from methods.zeroDeFuncoes.newton import newton
from .conftest import CRITERIO_PADRAO, CRITERIO_FINO, assert_raiz_valida


# ===========================================================================
# A. CORRETUDE MATEMÁTICA — raízes com valor exato conhecido
# ===========================================================================

@pytest.mark.parametrize("funcao, inicial, raiz_esperada", [
    # Polinômio grau 2: x² - 4 = 0  →  raiz = 2 (chute acima)
    ("x**2 - 4",      3.0,   2.0),
    # Polinômio grau 2: raiz negativa = -2
    ("x**2 - 4",     -3.0,  -2.0),
    # Polinômio grau 3: x³ - 8 = 0  →  raiz = 2
    ("x**3 - 8",      3.0,   2.0),
    # Transcendente clássico: cos(x) - x  →  ponto fixo ≈ 0.7390851332
    ("cos(x) - x",    1.0,   0.7390851332),
    # Exponencial: e^x - 2 = 0  →  raiz = ln(2)
    ("exp(x) - 2",    1.0,   math.log(2)),
    # Linear: 3x - 9 = 0  →  raiz = 3
    ("3*x - 9",       5.0,   3.0),
    # Raiz implícita: x² - 3 = 0  →  √3
    ("x**2 - 3",      2.0,   math.sqrt(3)),
    # Polinômio de Wilkinson truncado: (x-1)(x-2) = x²-3x+2  →  raiz = 1
    ("x**2 - 3*x + 2", 1.5,  1.0),
])
def test_raiz_conhecida(funcao, inicial, raiz_esperada):
    """Método deve convergir para a raiz analítica dentro da tolerância padrão."""
    resultado = newton(funcao, inicial, CRITERIO_PADRAO)
    assert_raiz_valida(resultado, funcao, raiz_esperada, tolerancia=CRITERIO_PADRAO * 10)


# ===========================================================================
# B. PRECISÃO E CONVERGÊNCIA QUADRÁTICA
# ===========================================================================

@pytest.mark.parametrize("criterio, tolerancia_esperada", [
    (1e-4,  1e-3),
    (1e-6,  1e-5),
    (1e-8,  1e-7),
    (1e-10, 1e-9),
])
def test_precisao_escalonada(criterio, tolerancia_esperada):
    """Erro absoluto deve obedecer ao critério de parada."""
    resultado = newton("x**2 - 4", 3.0, criterio)
    residual = abs(resultado["raiz"] ** 2 - 4)
    assert residual <= tolerancia_esperada, (
        f"Com critério {criterio:.0e}, resíduo {residual:.2e} excede {tolerancia_esperada:.0e}"
    )


def test_convergencia_quadratica_caracteristica():
    """
    Newton tem convergência quadrática: o número de iterações necessárias
    para atingir critério=1e-10 deve ser notavelmente menor do que bisseção
    precisaria. Para x²-4 partindo de 3.0, esperamos no máximo ~10 iterações.
    """
    resultado = newton("x**2 - 4", 3.0, CRITERIO_FINO)
    n = len(resultado["iteracoes"])
    assert n <= 10, (
        f"Newton deveria convergir em ≤10 iterações para este caso, usou {n}"
    )


def test_precisao_fina():
    """Com critério fino, erro relativo deve ser menor que 1e-9."""
    resultado = newton("x**2 - 4", 3.0, CRITERIO_FINO)
    erro_relativo = abs(resultado["raiz"] - 2.0) / 2.0
    assert erro_relativo < 1e-9


# ===========================================================================
# C. ESTRUTURA E INTEGRIDADE DO RETORNO
# ===========================================================================

def test_estrutura_retorno_chaves():
    """Retorno deve ter exatamente as chaves 'raiz' e 'iteracoes'."""
    resultado = newton("x**2 - 4", 3.0, CRITERIO_PADRAO)
    assert set(resultado.keys()) == {"raiz", "iteracoes"}


def test_tipo_raiz_e_float():
    """'raiz' deve ser float nativo Python."""
    resultado = newton("x**2 - 4", 3.0, CRITERIO_PADRAO)
    assert type(resultado["raiz"]) is float


def test_campos_obrigatorios_em_cada_iteracao():
    """
    Cada iteração deve ter 'iteracao', 'x', 'fx', 'fdx'
    para que o frontend consiga exibir a tabela de Newton.
    """
    campos_esperados = {"iteracao", "x", "fx", "fdx"}
    resultado = newton("x**2 - 4", 3.0, CRITERIO_PADRAO)
    for i, it in enumerate(resultado["iteracoes"]):
        campos_faltando = campos_esperados - set(it.keys())
        assert not campos_faltando, (
            f"Iteração {i} está faltando campos: {campos_faltando}"
        )


def test_numeracao_sequencial_de_iteracoes():
    """O campo 'iteracao' deve ser 0, 1, 2, ..."""
    resultado = newton("x**2 - 4", 3.0, CRITERIO_PADRAO)
    for i, it in enumerate(resultado["iteracoes"]):
        assert it["iteracao"] == i


def test_fx_consistente_com_x_registrado():
    """
    f(x) registrado em cada iteração deve ser coerente com x registrado.
    Detecta bugs de registro fora de ordem.
    """
    from methods.zeroDeFuncoes.utils import F
    funcao = "x**2 - 4"
    resultado = newton(funcao, 3.0, CRITERIO_PADRAO)
    for it in resultado["iteracoes"]:
        fx_direto = F(funcao, it["x"])
        assert abs(it["fx"] - fx_direto) < 1e-12, (
            f"Iteração {it['iteracao']}: fx registrado {it['fx']:.10g} "
            f"≠ f(x) direto {fx_direto:.10g}"
        )


def test_fdx_e_derivada_correta():
    """
    f'(x) = 2x para x²-4. Valida que a derivada registrada está correta.
    Esse teste capturaria a regressão sp.diff(expr) sem especificar 'x'.
    """
    resultado = newton("x**2 - 4", 3.0, CRITERIO_PADRAO)
    for it in resultado["iteracoes"]:
        fdx_esperado = 2.0 * it["x"]
        assert abs(it["fdx"] - fdx_esperado) < 1e-10, (
            f"Iteração {it['iteracao']}: f'(x) registrado {it['fdx']:.10g} "
            f"≠ derivada analítica {fdx_esperado:.10g}"
        )


# ===========================================================================
# D. INVARIANTES DO ALGORITMO
# ===========================================================================

def test_formula_newton_aplicada_corretamente():
    """
    Verifica a fórmula x_{n+1} = x_n - f(x_n)/f'(x_n) entre passo consecutivos.
    """
    resultado = newton("x**2 - 4", 3.0, CRITERIO_PADRAO)
    iteracoes = resultado["iteracoes"]
    for i in range(len(iteracoes) - 1):
        it_atual  = iteracoes[i]
        it_prox   = iteracoes[i + 1]
        x_calculado = it_atual["x"] - it_atual["fx"] / it_atual["fdx"]
        assert abs(x_calculado - it_prox["x"]) < 1e-12, (
            f"Fórmula de Newton violada entre iterações {i} e {i+1}: "
            f"esperado x={x_calculado:.10g}, obteve x={it_prox['x']:.10g}"
        )


def test_fx_decresce_em_modulo():
    """
    Para chute próximo da raiz, |f(x)| deve decrescer monotonicamente.
    (Não é garantido em todos os casos, mas é válido para x²-4 com x0=3.0.)
    """
    resultado = newton("x**2 - 4", 3.0, CRITERIO_PADRAO)
    abs_fx = [abs(it["fx"]) for it in resultado["iteracoes"]]
    for i in range(1, len(abs_fx)):
        assert abs_fx[i] <= abs_fx[i - 1] + 1e-14, (
            f"|f(x)| cresceu na iteração {i}: {abs_fx[i-1]:.6e} → {abs_fx[i]:.6e}"
        )


# ===========================================================================
# E. CASOS DE ERRO E EDGE CASES
# ===========================================================================

def test_derivada_zero_no_ponto_inicial():
    """
    f(x) = x² - 1, f'(0) = 2*0 = 0, mas f(0) = -1 ≠ 0.
    Newton deve lançar ValueError ao encontrar derivada zero antes de convergir.
    """
    with pytest.raises(ValueError, match="[Dd]erivada zero"):
        newton("x**2 - 1", 0.0, CRITERIO_PADRAO)


def test_derivada_zero_grau_quatro():
    """
    f(x) = x⁴ - 1, f'(0) = 4*0³ = 0, f(0) = -1 ≠ 0.
    Cobre derivada zero em funções de grau maior.
    """
    with pytest.raises(ValueError, match="[Dd]erivada zero"):
        newton("x**4 - 1", 0.0, CRITERIO_PADRAO)


def test_raiz_exatamente_no_chute_inicial():
    """
    Se x0 já é a raiz, f(x0) = 0 ≤ criterio.
    Deve retornar na primeira iteração com a raiz correta.
    """
    resultado = newton("x - 5", 5.0, CRITERIO_PADRAO)
    assert abs(resultado["raiz"] - 5.0) < CRITERIO_PADRAO * 10
    assert len(resultado["iteracoes"]) == 1


def test_funcao_invalida_raise_value_error():
    """Expressão sintaticamente inválida deve lançar ValueError."""
    with pytest.raises(ValueError):
        newton("x ** ** 2", 1.0, CRITERIO_PADRAO)


def test_raiz_negativa():
    """Deve convergir corretamente para raízes negativas."""
    resultado = newton("x**2 - 9", -4.0, CRITERIO_PADRAO)
    assert abs(resultado["raiz"] - (-3.0)) < CRITERIO_PADRAO * 10


@pytest.mark.parametrize("funcao, inicial, raiz_esperada", [
    # Polinômio grau 4: x⁴ - 1 = 0, raiz positiva = 1
    ("x**4 - 1", 2.0, 1.0),
    # Logaritmo: log(x) - 1 = 0  →  raiz = e
    ("log(x) - 1", 2.0, math.e),
])
def test_funcoes_nao_polinomiais(funcao, inicial, raiz_esperada):
    """Newton deve funcionar corretamente para funções transcendentes."""
    resultado = newton(funcao, inicial, CRITERIO_PADRAO)
    assert abs(resultado["raiz"] - raiz_esperada) < CRITERIO_PADRAO * 10


# ===========================================================================
# F. SEGURANÇA — INJEÇÃO DE CÓDIGO
# ===========================================================================

@pytest.mark.parametrize("payload", [
    "__import__('os').system('echo pwned')",
    "exec('import os')",
    "eval('2+2')",
    "open('/etc/passwd').read()",
    "os.getcwd()",
    "subprocess.check_output(['id'])",
    "__class__.__bases__",
    "import sys",
])
def test_rejeita_injecao_de_codigo(payload):
    """
    Qualquer payload de injeção deve ser bloqueado antes de execução.
    """
    with pytest.raises((ValueError, Exception)):
        newton(payload, 0.0, CRITERIO_PADRAO)
