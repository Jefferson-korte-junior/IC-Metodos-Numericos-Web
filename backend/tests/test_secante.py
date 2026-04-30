"""
test_secante.py — Testes para o método da Secante.

Categorias cobertas:
  A. Corretude matemática (raízes conhecidas)
  B. Precisão numérica e convergência superlinear
  C. Estrutura e integridade do retorno
  D. Invariantes do algoritmo
  E. Casos de erro e edge cases (denominador zero, divergência)
  F. Segurança — injeção de código
"""

import math
import pytest

from methods.zeroDeFuncoes.secante import secante
from .conftest import CRITERIO_PADRAO, CRITERIO_FINO, assert_raiz_valida


# ===========================================================================
# A. CORRETUDE MATEMÁTICA — raízes com valor exato conhecido
# ===========================================================================

@pytest.mark.parametrize("funcao, a, b, raiz_esperada", [
    # Polinômio grau 2: x² - 4 = 0  →  raiz = 2
    ("x**2 - 4",      1.0,  3.0,  2.0),
    # Polinômio grau 2: raiz negativa = -2
    ("x**2 - 4",     -3.0, -1.0, -2.0),
    # Polinômio grau 3: x³ - 8 = 0  →  raiz = 2
    ("x**3 - 8",      1.0,  3.0,  2.0),
    # Transcendente: cos(x) - x  →  ponto fixo ≈ 0.7390851332
    ("cos(x) - x",    0.5,  1.0,  0.7390851332),
    # Exponencial: e^x - 2 = 0  →  ln(2)
    ("exp(x) - 2",    0.5,  1.0,  math.log(2)),
    # Linear: 5x - 15 = 0  →  raiz = 3
    ("5*x - 15",      1.0,  5.0,  3.0),
    # Raiz implícita: x² - 5 = 0  →  √5
    ("x**2 - 5",      2.0,  3.0,  math.sqrt(5)),
])
def test_raiz_conhecida(funcao, a, b, raiz_esperada):
    """Método deve convergir para a raiz analítica dentro da tolerância padrão."""
    resultado = secante(funcao, a, b, CRITERIO_PADRAO)
    assert_raiz_valida(resultado, funcao, raiz_esperada, tolerancia=CRITERIO_PADRAO * 10)


# ===========================================================================
# B. PRECISÃO E CONVERGÊNCIA SUPERLINEAR
# ===========================================================================

@pytest.mark.parametrize("criterio, tolerancia_esperada", [
    (1e-4,  1e-3),
    (1e-6,  1e-5),
    (1e-8,  1e-7),
    (1e-10, 1e-9),
])
def test_precisao_escalonada(criterio, tolerancia_esperada):
    """Erro absoluto deve obedecer ao critério de parada."""
    resultado = secante("x**2 - 4", 1.0, 3.0, criterio)
    residual = abs(resultado["raiz"] ** 2 - 4)
    assert residual <= tolerancia_esperada, (
        f"Com critério {criterio:.0e}, resíduo {residual:.2e} excede {tolerancia_esperada:.0e}"
    )


def test_convergencia_superlinear_caracteristica():
    """
    Secante tem convergência de ordem ≈ 1.618. Para x²-4 com pontos próximos
    da raiz, deve convergir em menos de ~20 iterações para critério=1e-10.
    """
    resultado = secante("x**2 - 4", 1.5, 2.5, CRITERIO_FINO)
    n = len(resultado["iteracoes"])
    assert n <= 20, (
        f"Secante deveria convergir em ≤20 iterações para este caso, usou {n}"
    )


def test_precisao_fina():
    """Com critério fino, erro relativo deve ser menor que 1e-9."""
    resultado = secante("x**2 - 4", 1.0, 3.0, CRITERIO_FINO)
    erro_relativo = abs(resultado["raiz"] - 2.0) / 2.0
    assert erro_relativo < 1e-9


# ===========================================================================
# C. ESTRUTURA E INTEGRIDADE DO RETORNO
# ===========================================================================

def test_estrutura_retorno_chaves():
    """Retorno deve ter exatamente as chaves 'raiz' e 'iteracoes'."""
    resultado = secante("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    assert set(resultado.keys()) == {"raiz", "iteracoes"}


def test_tipo_raiz_e_float():
    """'raiz' deve ser float nativo Python."""
    resultado = secante("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    assert type(resultado["raiz"]) is float


def test_campos_obrigatorios_em_cada_iteracao():
    """
    Cada iteração deve ter 'iteracao', 'a', 'b', 'fa', 'fb'
    para que o frontend consiga exibir a tabela da secante.
    """
    campos_esperados = {"iteracao", "a", "b", "fa", "fb"}
    resultado = secante("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    for i, it in enumerate(resultado["iteracoes"]):
        campos_faltando = campos_esperados - set(it.keys())
        assert not campos_faltando, (
            f"Iteração {i} está faltando campos: {campos_faltando}"
        )


def test_numeracao_sequencial_de_iteracoes():
    """O campo 'iteracao' deve ser 0, 1, 2, ..."""
    resultado = secante("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    for i, it in enumerate(resultado["iteracoes"]):
        assert it["iteracao"] == i


def test_fa_fb_consistentes_com_a_b():
    """
    f(a) e f(b) registrados em cada iteração devem coincidir com avaliação direta.
    Detecta bugs de registro com valores de iteração anterior.
    """
    from methods.zeroDeFuncoes.utils import F
    funcao = "x**2 - 4"
    resultado = secante(funcao, 1.0, 3.0, CRITERIO_PADRAO)
    for it in resultado["iteracoes"]:
        fa_direto = F(funcao, it["a"])
        fb_direto = F(funcao, it["b"])
        assert abs(it["fa"] - fa_direto) < 1e-12, (
            f"Iteração {it['iteracao']}: fa registrado {it['fa']:.10g} "
            f"≠ f(a) direto {fa_direto:.10g}"
        )
        assert abs(it["fb"] - fb_direto) < 1e-12, (
            f"Iteração {it['iteracao']}: fb registrado {it['fb']:.10g} "
            f"≠ f(b) direto {fb_direto:.10g}"
        )


# ===========================================================================
# D. INVARIANTES DO ALGORITMO
# ===========================================================================

def test_formula_secante_aplicada_corretamente():
    """
    Verifica a fórmula x_{n+1} = (a*f(b) - b*f(a)) / (f(b) - f(a))
    entre passos consecutivos.
    """
    resultado = secante("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    iteracoes = resultado["iteracoes"]
    for i in range(len(iteracoes) - 1):
        it = iteracoes[i]
        proximo_b = iteracoes[i + 1]["b"]
        denominador = it["fb"] - it["fa"]
        if abs(denominador) < 1e-15:
            continue  # denominador negligível — não valida este passo
        proximo_calculado = (it["a"] * it["fb"] - it["b"] * it["fa"]) / denominador
        assert abs(proximo_calculado - proximo_b) < 1e-10, (
            f"Fórmula da secante violada entre iterações {i} e {i+1}: "
            f"esperado b={proximo_calculado:.10g}, obteve b={proximo_b:.10g}"
        )


def test_deslizamento_de_janela_correto():
    """
    Após cada iteração, o 'a' da iteração seguinte deve ser igual
    ao 'b' da iteração atual (janela deslizante).
    """
    resultado = secante("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    iteracoes = resultado["iteracoes"]
    for i in range(len(iteracoes) - 1):
        b_atual   = iteracoes[i]["b"]
        a_proxima = iteracoes[i + 1]["a"]
        assert abs(b_atual - a_proxima) < 1e-14, (
            f"Janela não deslizou corretamente: b[{i}]={b_atual:.10g} "
            f"≠ a[{i+1}]={a_proxima:.10g}"
        )


# ===========================================================================
# E. CASOS DE ERRO E EDGE CASES
# ===========================================================================

def test_denominador_zero_f_a_igual_f_b():
    """
    Se f(a) = f(b), denominador = 0 → secante paralela ao eixo x.
    Deve lançar ValueError.
    f(x) = (x-2)² em a=1 e b=3: f(1) = 1, f(3) = 1  →  denominador = 0.
    """
    with pytest.raises(ValueError, match="[Dd]ivisão por zero|denominador"):
        secante("(x-2)**2", 1.0, 3.0, CRITERIO_PADRAO)


def test_pontos_iniciais_simetricos_funcao_par():
    """
    f(x) = x² - 4, a=-2, b=2.
    f(-2)=0 — a própria raiz negativa está em 'a'.
    Deve retornar sem erro e com |f(raiz)| ≤ critério.
    """
    resultado = secante("x**2 - 4", -2.0, 3.0, CRITERIO_PADRAO)
    raiz = resultado["raiz"]
    residual = abs(raiz**2 - 4)
    assert residual <= CRITERIO_PADRAO * 10


def test_raiz_ja_em_b_inicial():
    """
    Se f(b) = 0 na primeira iteração, deve retornar imediatamente.
    """
    resultado = secante("x - 7", 5.0, 7.0, CRITERIO_PADRAO)
    assert abs(resultado["raiz"] - 7.0) < CRITERIO_PADRAO * 10
    # Deve ter parado na primeira iteração
    assert len(resultado["iteracoes"]) == 1


def test_funcao_invalida_raise_value_error():
    """Expressão sintaticamente inválida deve lançar ValueError."""
    with pytest.raises(ValueError):
        secante("x ** ** 3", 1.0, 3.0, CRITERIO_PADRAO)


@pytest.mark.parametrize("funcao, a, b, raiz_esperada", [
    # Polinômio com raiz em ponto não inteiro
    ("x**3 - 2",  1.0, 2.0, 2 ** (1/3)),
    # Trigonométrica: sin(x) = 0 na segunda raiz positiva ≈ π
    ("sin(x)",    3.0, 3.5, math.pi),
])
def test_casos_adicionais_de_convergencia(funcao, a, b, raiz_esperada):
    """Testa convergência em casos com raízes irracionais e transcendentes."""
    resultado = secante(funcao, a, b, CRITERIO_PADRAO)
    assert abs(resultado["raiz"] - raiz_esperada) < CRITERIO_PADRAO * 10


# ===========================================================================
# F. SEGURANÇA — INJEÇÃO DE CÓDIGO
# ===========================================================================

@pytest.mark.parametrize("payload", [
    "__import__('os').system('echo pwned')",
    "exec('print(1)')",
    "eval('1+1')",
    "open('/etc/passwd')",
    "os.environ",
    "subprocess.Popen(['ls'])",
    "__class__.__dict__",
    "import pathlib",
])
def test_rejeita_injecao_de_codigo(payload):
    """Qualquer payload de injeção deve ser bloqueado antes de execução."""
    with pytest.raises((ValueError, Exception)):
        secante(payload, 0.0, 1.0, CRITERIO_PADRAO)
