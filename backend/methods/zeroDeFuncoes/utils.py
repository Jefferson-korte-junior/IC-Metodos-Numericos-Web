"""
utils.py — Utilitários compartilhados para métodos numéricos.

SEGURANÇA:
  parse_expr é chamado apenas aqui, com namespace restrito.
  Nenhum built-in Python (como __import__) é acessível dentro
  da expressão avaliada.
"""

import re
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application

x = sp.Symbol('x')

# Transformações que permitem sintaxe amigável: "2x" → "2*x", "x^2" → "x**2"
_TRANSFORMATIONS = standard_transformations + (implicit_multiplication_application,)

# Apenas funções matemáticas legítimas são expostas à expressão do usuário
_SAFE_LOCALS: dict = {
    'x': x,
    'sin': sp.sin,
    'cos': sp.cos,
    'tan': sp.tan,
    'exp': sp.exp,
    'log': sp.log,
    'ln': sp.log,
    'sqrt': sp.sqrt,
    'abs': sp.Abs,
    'pi': sp.pi,
    'e': sp.E,
}

# Padrão que rejeita qualquer tentativa de acesso a atributos dunder ou chamadas de módulo
_INJECTION_PATTERN = re.compile(
    r'(__\w+__'           # dunders: __import__, __class__, etc.
    r'|import\s'          # palavra "import"
    r'|exec\s*\('         # exec(
    r'|eval\s*\('         # eval(
    r'|open\s*\('         # open(
    r'|os\.'              # os.
    r'|sys\.'             # sys.
    r'|subprocess'        # subprocess
    r'|builtins)',        # builtins
    re.IGNORECASE,
)


def validar_expressao(expressao: str) -> None:
    """
    Levanta ValueError se a expressão contiver padrões de injeção conhecidos.
    Esta é uma camada de defesa extra — o namespace restrito em parse_expr
    já bloqueia a execução, mas validar antes fornece mensagens de erro claras.
    """
    if _INJECTION_PATTERN.search(expressao):
        raise ValueError(f"Expressão inválida ou potencialmente insegura: '{expressao}'")


def parse_funcao(expressao: str) -> sp.Expr:
    """
    Converte string de expressão matemática em objeto SymPy de forma segura.

    Args:
        expressao: String como "x**2 - 4", "sin(x) + x", "x^3 - 2x + 1"

    Returns:
        Expressão SymPy pronta para avaliação/diferenciação.

    Raises:
        ValueError: Se a expressão for inválida ou contiver padrões inseguros.
    """
    # Normaliza notação de potência comum em interfaces educacionais
    expressao = expressao.replace('^', '**')

    validar_expressao(expressao)

    try:
        return parse_expr(
            expressao,
            local_dict=_SAFE_LOCALS,
            # global_dict=None usaria o escopo completo do Python, incluindo __builtins__.
            # Usamos o namespace interno do SymPy (que contém Integer, Symbol etc.
            # necessários para as transformações), mas removemos explicitamente
            # qualquer __builtins__ — isso bloqueia __import__, open, exec, eval, etc.
            global_dict={k: v for k, v in sp.__dict__.items()
                         if not k.startswith('__')},
            transformations=_TRANSFORMATIONS,
        )
    except Exception as exc:
        raise ValueError(f"Não foi possível interpretar a expressão: '{expressao}'. Detalhe: {exc}") from exc


def F(expressao_ou_expr, x_val: float) -> float:
    """
    Avalia a função em x_val.

    Args:
        expressao_ou_expr: String matemática OU objeto sp.Expr já parseado.
        x_val: Ponto de avaliação.

    Returns:
        Valor numérico f(x_val).
    """
    if isinstance(expressao_ou_expr, str):
        expr = parse_funcao(expressao_ou_expr)
    else:
        expr = expressao_ou_expr

    resultado = expr.evalf(subs={x: x_val})
    return float(resultado)
