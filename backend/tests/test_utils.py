"""
test_utils.py — Testes para utils.py (parsing seguro e avaliação de funções).

Este módulo testa a camada de segurança de forma isolada dos métodos numéricos,
garantindo que a proteção contra injeção funciona independentemente de qual
método for chamado.

Categorias cobertas:
  A. parse_funcao — parsing correto de expressões legítimas
  B. validar_expressao — detecção de payloads maliciosos
  C. F — avaliação numérica correta
  D. Normalização de sintaxe (^ → **)
"""

import math
import pytest
import sympy as sp

from methods.zeroDeFuncoes.utils import parse_funcao, validar_expressao, F, x


# ===========================================================================
# A. parse_funcao — expressões legítimas
# ===========================================================================

@pytest.mark.parametrize("expressao, x_val, esperado", [
    ("x**2",          2.0,  4.0),
    ("x**2 - 4",      2.0,  0.0),
    ("sin(x)",        0.0,  0.0),
    ("cos(x)",        0.0,  1.0),
    ("exp(x)",        0.0,  1.0),
    ("log(x)",        1.0,  0.0),
    ("sqrt(x)",       4.0,  2.0),
    ("abs(x)",       -3.0,  3.0),
    ("2*x + 1",       3.0,  7.0),
    ("x**3 - x - 2",  2.0,  4.0),
])
def test_parse_e_avaliacao_correta(expressao, x_val, esperado):
    """parse_funcao deve produzir expressão SymPy que avalia corretamente."""
    expr = parse_funcao(expressao)
    resultado = float(expr.evalf(subs={x: x_val}))
    assert abs(resultado - esperado) < 1e-10, (
        f"f({x_val}) = {resultado:.10g}, esperado {esperado:.10g} para '{expressao}'"
    )


def test_parse_retorna_sympy_expr():
    """parse_funcao deve retornar objeto sp.Expr (não string, não float)."""
    expr = parse_funcao("x**2 - 4")
    assert isinstance(expr, sp.Basic)


def test_parse_expressao_constante():
    """Expressão sem x deve ser tratada como constante."""
    expr = parse_funcao("42")
    resultado = float(expr.evalf(subs={x: 99.0}))
    assert resultado == 42.0


def test_parse_expressao_com_pi():
    """'pi' deve ser mapeado para sp.pi."""
    expr = parse_funcao("sin(pi)")
    resultado = float(expr.evalf())
    assert abs(resultado) < 1e-10


def test_parse_expressao_com_e():
    """'e' deve ser mapeado para sp.E (número de Euler)."""
    expr = parse_funcao("log(e)")
    resultado = float(expr.evalf())
    assert abs(resultado - 1.0) < 1e-10


# ===========================================================================
# B. validar_expressao — detecção de payloads maliciosos
# ===========================================================================

@pytest.mark.parametrize("payload", [
    "__import__('os')",
    "__class__",
    "__mro__",
    "__dict__",
    "exec('x=1')",
    "eval('1+1')",
    "open('/etc/passwd')",
    "os.system('ls')",
    "os.path.join('a','b')",
    "sys.exit(0)",
    "sys.modules",
    "subprocess.run(['id'])",
    "subprocess.Popen(['ls'])",
    "import os",
    "builtins.print",
    # Case insensitive
    "EXEC('code')",
    "EVAL('code')",
    "OS.system('ls')",
])
def test_validar_bloqueia_payloads_maliciosos(payload):
    """validar_expressao deve lançar ValueError para qualquer payload malicioso."""
    with pytest.raises(ValueError, match="[Ii]nválida|insegura"):
        validar_expressao(payload)


@pytest.mark.parametrize("expressao_legítima", [
    "x**2 - 4",
    "sin(x) + cos(x)",
    "exp(x) - 1",
    "log(x)",
    "sqrt(x**2 + 1)",
    "x**3 - 2*x + 1",
    "abs(x - 3)",
    "tan(x)",
    "2*x + 5",
    "pi * x",
])
def test_validar_aceita_expressoes_legitimas(expressao_legítima):
    """validar_expressao não deve levantar exceção para expressões matemáticas normais."""
    # Não deve lançar nenhuma exceção
    validar_expressao(expressao_legítima)


# ===========================================================================
# C. F — avaliação numérica correta
# ===========================================================================

@pytest.mark.parametrize("expressao, x_val, esperado", [
    ("x**2",      3.0,   9.0),
    ("x**2 - 4",  2.0,   0.0),
    ("2*x - 6",   3.0,   0.0),
    ("sin(x)",    math.pi, pytest.approx(0.0, abs=1e-10)),
    ("exp(x)",    1.0,   math.e),
])
def test_F_avaliacao_correta(expressao, x_val, esperado):
    """F deve avaliar corretamente para string de expressão."""
    resultado = F(expressao, x_val)
    if isinstance(esperado, float):
        assert abs(resultado - esperado) < 1e-10
    else:
        assert resultado == esperado


def test_F_aceita_expr_sympy_diretamente():
    """F deve aceitar um objeto sp.Expr além de string."""
    expr = parse_funcao("x**2 - 9")
    resultado = F(expr, 3.0)
    assert abs(resultado) < 1e-12


def test_F_retorna_float_nativo():
    """F deve sempre retornar float nativo Python."""
    resultado = F("x**2", 3.0)
    assert type(resultado) is float


# ===========================================================================
# D. Normalização de sintaxe (^ → **)
# ===========================================================================

@pytest.mark.parametrize("com_caret, sem_caret, x_val", [
    ("x^2",       "x**2",       3.0),
    ("x^3 - 1",   "x**3 - 1",   2.0),
    ("2^x",       "2**x",       4.0),
    ("(x+1)^2",   "(x+1)**2",   2.0),
])
def test_normalizacao_caret(com_caret, sem_caret, x_val):
    """
    Sintaxe com '^' (comum em interfaces educacionais) deve produzir
    exatamente o mesmo resultado que '**'.
    """
    resultado_caret = F(com_caret, x_val)
    resultado_padrao = F(sem_caret, x_val)
    assert abs(resultado_caret - resultado_padrao) < 1e-12, (
        f"'{com_caret}' e '{sem_caret}' deram resultados diferentes em x={x_val}"
    )
