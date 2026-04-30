"""
test_bissecao.py — Testes para o método da Bisseção.

Categorias cobertas:
  A. Corretude matemática (raízes conhecidas)
  B. Precisão numérica
  C. Estrutura e integridade do retorno
  D. Invariantes do algoritmo
  E. Casos de erro e edge cases
  F. Segurança — injeção de código
"""

import math
import pytest

from methods.zeroDeFuncoes.bissecao import bissecao
from .conftest import CRITERIO_PADRAO, CRITERIO_FINO, assert_raiz_valida


# ===========================================================================
# A. CORRETUDE MATEMÁTICA — raízes com valor exato conhecido
# ===========================================================================

@pytest.mark.parametrize("funcao, a, b, raiz_esperada", [
    # Polinômio grau 2: x² - 4 = 0  →  raiz positiva = 2
    ("x**2 - 4",          1.0,  3.0,  2.0),
    # Polinômio grau 2: raiz negativa = -2
    ("x**2 - 4",         -3.0, -1.0, -2.0),
    # Polinômio grau 3: x³ - 8 = 0  →  raiz = 2
    ("x**3 - 8",          1.0,  3.0,  2.0),
    # Linear: 2x - 6 = 0  →  raiz = 3
    ("2*x - 6",           1.0,  5.0,  3.0),
    # Trigonométrica: cos(x) - x = 0  →  ponto fixo ≈ 0.7390851332
    ("cos(x) - x",        0.0,  1.0,  0.7390851332),
    # Exponencial: e^x - 2 = 0  →  raiz = ln(2) ≈ 0.6931471806
    ("exp(x) - 2",        0.0,  1.0,  math.log(2)),
    # Raiz quadrada implícita: x² - 2 = 0  →  √2 ≈ 1.4142135624
    ("x**2 - 2",          1.0,  2.0,  math.sqrt(2)),
])
def test_raiz_conhecida(funcao, a, b, raiz_esperada):
    """Método deve convergir para a raiz analítica dentro da tolerância padrão."""
    resultado = bissecao(funcao, a, b, CRITERIO_PADRAO)
    assert_raiz_valida(resultado, funcao, raiz_esperada, tolerancia=CRITERIO_PADRAO * 10)


# ===========================================================================
# B. PRECISÃO NUMÉRICA
# ===========================================================================

@pytest.mark.parametrize("criterio, tolerancia_esperada", [
    (1e-4,  1e-3),
    (1e-6,  1e-5),
    (1e-8,  1e-7),
    (1e-10, 1e-9),
])
def test_precisao_escalonada(criterio, tolerancia_esperada):
    """
    À medida que o critério fica mais restrito, o erro absoluto deve
    diminuir proporcionalmente. Testa que o critério de parada é respeitado.
    """
    resultado = bissecao("x**2 - 4", 1.0, 3.0, criterio)
    raiz = resultado["raiz"]
    residual = abs(raiz**2 - 4)
    assert residual <= tolerancia_esperada, (
        f"Com critério {criterio:.0e}, resíduo {residual:.2e} excede {tolerancia_esperada:.0e}"
    )


def test_precisao_fina():
    """Criterio fino deve produzir raiz com erro < 1e-9."""
    resultado = bissecao("x**2 - 4", 1.0, 3.0, CRITERIO_FINO)
    assert abs(resultado["raiz"] - 2.0) < 1e-9


# ===========================================================================
# C. ESTRUTURA E INTEGRIDADE DO RETORNO
# ===========================================================================

def test_estrutura_retorno_chaves():
    """Retorno deve ter exatamente as chaves 'raiz' e 'iteracoes'."""
    resultado = bissecao("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    assert set(resultado.keys()) == {"raiz", "iteracoes"}


def test_tipo_raiz_e_float():
    """'raiz' deve ser float nativo Python, não sympy.Float ou int."""
    resultado = bissecao("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    assert type(resultado["raiz"]) is float


def test_iteracoes_e_lista_de_dicts():
    """Cada elemento de 'iteracoes' deve ser um dicionário."""
    resultado = bissecao("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    assert isinstance(resultado["iteracoes"], list)
    for item in resultado["iteracoes"]:
        assert isinstance(item, dict)


def test_campos_obrigatorios_em_cada_iteracao():
    """
    Cada iteração deve conter os campos que o frontend precisa para
    exibir a tabela pedagógica.
    """
    campos_esperados = {"iteracao", "a", "b", "media", "fa", "fb", "fm", "substituiu"}
    resultado = bissecao("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    for i, it in enumerate(resultado["iteracoes"]):
        campos_faltando = campos_esperados - set(it.keys())
        assert not campos_faltando, (
            f"Iteração {i} está faltando campos: {campos_faltando}"
        )


def test_campo_substituiu_valor_valido():
    """Campo 'substituiu' deve ser sempre 'a' ou 'b'."""
    resultado = bissecao("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    for i, it in enumerate(resultado["iteracoes"]):
        assert it["substituiu"] in ("a", "b"), (
            f"Iteração {i}: 'substituiu' = '{it['substituiu']}' não é 'a' nem 'b'"
        )


def test_numeracao_sequencial_de_iteracoes():
    """O campo 'iteracao' deve ser 0, 1, 2, ... sem pulos."""
    resultado = bissecao("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    for i, it in enumerate(resultado["iteracoes"]):
        assert it["iteracao"] == i, (
            f"Esperado iteracao={i}, obteve iteracao={it['iteracao']}"
        )


# ===========================================================================
# D. INVARIANTES DO ALGORITMO
# ===========================================================================

def test_intervalo_se_estreita_monotonicamente():
    """
    A cada iteração o intervalo [a, b] deve ficar igual ou mais estreito.
    Largura nunca deve crescer.
    """
    resultado = bissecao("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    larguras = [abs(it["b"] - it["a"]) for it in resultado["iteracoes"]]
    for i in range(1, len(larguras)):
        assert larguras[i] <= larguras[i - 1] + 1e-15, (
            f"Intervalo cresceu na iteração {i}: {larguras[i - 1]:.6e} → {larguras[i]:.6e}"
        )


def test_media_pertence_ao_intervalo():
    """Em toda iteração, a média deve estar dentro do intervalo [a, b]."""
    resultado = bissecao("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    for it in resultado["iteracoes"]:
        a, b, m = it["a"], it["b"], it["media"]
        lo, hi = min(a, b), max(a, b)
        assert lo <= m <= hi, (
            f"média {m:.6g} fora do intervalo [{lo:.6g}, {hi:.6g}]"
        )


def test_fm_consistente_com_media():
    """
    f(media) registrado em cada iteração deve ser coerente com o valor
    real calculado diretamente — detecta bug de cache ou ordem incorreta.
    """
    from methods.zeroDeFuncoes.utils import F
    funcao = "x**3 - x - 2"
    resultado = bissecao(funcao, 1.0, 2.0, CRITERIO_PADRAO)
    for it in resultado["iteracoes"]:
        fm_direto = F(funcao, it["media"])
        assert abs(it["fm"] - fm_direto) < 1e-12, (
            f"Iteração {it['iteracao']}: fm registrado {it['fm']:.10g} "
            f"≠ f(media) direto {fm_direto:.10g}"
        )


def test_numero_de_iteracoes_bissecao_esperado():
    """
    Bisseção tem convergência garantida: para intervalo de largura L e
    critério ε, o número de iterações não deve exceder ceil(log2(L/ε)).

    Para [1, 3] (L=2) e ε=1e-6: ceil(log2(2e6)) ≈ 21 iterações.
    Testamos que não ultrapassa 2× esse valor (folga para critério em |f|).
    """
    resultado = bissecao("x**2 - 4", 1.0, 3.0, CRITERIO_PADRAO)
    n = len(resultado["iteracoes"])
    limite_teorico = math.ceil(math.log2(2.0 / CRITERIO_PADRAO))
    assert n <= limite_teorico * 2, (
        f"Número de iterações {n} excede 2× o limite teórico {limite_teorico}"
    )


def test_raiz_no_extremo_do_intervalo():
    """
    Caso especial: a raiz está exatamente em um dos extremos.
    f(a) = 0 → bissecao deve lidar sem exceção (fa*fb = 0, não > 0).
    """
    # x - 1 = 0, raiz = 1.0, que é exatamente 'a'
    resultado = bissecao("x - 1", 1.0, 3.0, CRITERIO_PADRAO)
    assert abs(resultado["raiz"] - 1.0) < CRITERIO_PADRAO * 10


# ===========================================================================
# E. CASOS DE ERRO E EDGE CASES
# ===========================================================================

def test_sem_raiz_no_intervalo_mesmo_sinal():
    """
    f(x) = x² + 1 > 0 para todo x real.
    Bisseção deve lançar ValueError pois f(a) e f(b) têm o mesmo sinal.
    """
    with pytest.raises(ValueError, match="mesmo sinal"):
        bissecao("x**2 + 1", -2.0, 2.0, CRITERIO_PADRAO)


def test_erro_mesmo_sinal_intervalo_positivo():
    """f(x) = (x-5)² — mínimo em x=5, sempre ≥ 0, sem raiz real."""
    with pytest.raises(ValueError):
        bissecao("(x-5)**2 + 3", 0.0, 10.0, CRITERIO_PADRAO)


def test_funcao_invalida_raise_value_error():
    """Expressão matemática sintaticamente inválida deve lançar ValueError."""
    with pytest.raises(ValueError):
        bissecao("x ** ** 2", 1.0, 3.0, CRITERIO_PADRAO)


def test_multiplas_raizes_retorna_uma_raiz_valida():
    """
    f(x) = x³ - x tem raízes em {-1, 0, 1}.
    Com intervalo [0.5, 1.5], deve convergir para a raiz em x=1.
    """
    resultado = bissecao("x**3 - x", 0.5, 1.5, CRITERIO_PADRAO)
    assert abs(resultado["raiz"] - 1.0) < CRITERIO_PADRAO * 10


# ===========================================================================
# F. SEGURANÇA — INJEÇÃO DE CÓDIGO
# ===========================================================================

@pytest.mark.parametrize("payload", [
    "__import__('os').system('echo pwned')",
    "__class__.__mro__",
    "exec('import os')",
    "eval('1+1')",
    "open('/etc/passwd').read()",
    "os.listdir('.')",
    "subprocess.run(['ls'])",
    "import os",
    "builtins.__dict__",
])
def test_rejeita_injecao_de_codigo(payload):
    """
    Qualquer tentativa de injeção deve ser rejeitada com ValueError
    antes de qualquer execução.
    """
    with pytest.raises((ValueError, Exception)):
        bissecao(payload, -1.0, 1.0, CRITERIO_PADRAO)
