# Métodos Numéricos Interativos — Projeto de Iniciação Científica

> **UTFPR** — Projeto de Iniciação Científica

---

## Motivação

Um dos maiores fatores de evasão nos cursos de Engenharia e Ciência da Computação hoje em dia é a dificuldade com disciplinas de matemática. Conceitos como zeros de funções, sistemas lineares e interpolação são ensinados de forma predominantemente teórica, sem ferramentas que permitam ao aluno **visualizar o que está acontecendo** a cada iteração de um método.

Este projeto propõe uma aplicação web interativa que permite ao estudante inserir sua própria função matemática, escolher o método numérico, configurar os parâmetros e acompanhar o processo de resolução passo a passo — tornando o aprendizado mais concreto e reduzindo a barreira de entrada nessas disciplinas.

---

## Funcionalidades

- Inserção de funções matemáticas em notação natural (`x**2 - 4`, `sin(x) - x/2`, etc.)
- Escolha do critério de parada: erro absoluto, erro relativo ou valor da função
- Três níveis de detalhamento do resultado:
  - **Básico** — apenas a raiz e o número de iterações
  - **Intermediário** — primeiras e últimas iterações
  - **Completo** — todas as iterações em tabela
- Modo **Interativo** (Bisseção) — visualização animada passo a passo
- Interface responsiva com tema visual consistente

---

## Métodos Implementados

### Zero de Funções
| Método | Descrição |
|--------|-----------|
| **Bisseção** | Divide o intervalo `[a, b]` ao meio iterativamente. Requer mudança de sinal. |
| **Newton-Raphson** | Usa a derivada analítica para convergir rapidamente. Requer um ponto inicial `x₀`. |
| **Secante** | Aproxima a derivada com dois pontos. Não exige derivada analítica. Requer `x₀` e `x₁`. |

### Sistemas Lineares
| Método | Descrição |
|--------|-----------|
| **Jacobi** | Método iterativo para sistemas lineares Ax = b. |
| **Gauss-Seidel** | Variante do Jacobi com convergência geralmente mais rápida. |

### Em desenvolvimento
- Interpolação: Lagrange, Newton
- Integração numérica: Trapézio, Simpson

---

## Tecnologias

**Frontend**
- [React](https://react.dev/) — interface de usuário
- [KaTeX](https://katex.org/) — renderização de expressões matemáticas

**Backend**
- [Python 3](https://www.python.org/) + [FastAPI](https://fastapi.tiangolo.com/) — API REST
- [SymPy](https://www.sympy.org/) — parsing seguro e diferenciação simbólica
- [Uvicorn](https://www.uvicorn.org/) — servidor ASGI

---

## Como Executar Localmente

### Pré-requisitos
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
pip install fastapi uvicorn sympy
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

A API estará disponível em `http://127.0.0.1:8000`.

### Frontend

```bash
cd frontend
npm install
npm start
```

A aplicação estará disponível em `http://localhost:3000`.

---

## Estrutura do Projeto

```
Projeto_IC/
├── backend/
│   ├── main.py                        # Endpoints FastAPI
│   ├── methods/
│   │   ├── zeroDeFuncoes/
│   │   │   ├── bissecao.py
│   │   │   ├── newton.py
│   │   │   ├── secante.py
│   │   │   └── utils.py               # Parser seguro e avaliação numérica
│   │   └── sistemasLineares/
│   │       ├── jacobi.py
│   │       └── gauss_seidel.py
│   └── tests/
│       ├── test_bissecao.py
│       ├── test_newton.py
│       └── test_secante.py
│
└── frontend/
    └── src/
        ├── App.js
        ├── pages/
        │   ├── Bissecao.jsx
        │   ├── Newton.jsx
        │   └── Secante.jsx
        ├── hooks/
        │   ├── useBissecao.js
        │   ├── useNewton.js
        │   └── useSecante.js
        └── components/
            └── layout/
                ├── MainLayout.jsx
                └── TopMenu.jsx
```

---

## Segurança

A expressão matemática digitada pelo usuário nunca é executada diretamente. O fluxo é:

1. **Validação** — regex bloqueia padrões perigosos (`__import__`, `exec`, `eval`, `os.`, etc.)
2. **Parsing** — `sympy.parse_expr` com namespace restrito (só funções matemáticas permitidas)
3. **Avaliação** — `str(expr)` + `eval` com namespace seguro do módulo `math`, sem `__builtins__`

---

## Autor

Jefferson Korte Junior (Graduando em ciencia da computação) - UTFPR
Prof Dr Giuvane Conti - UTFPR
Prof Dr. Evandro Nakajima — UTFPR
