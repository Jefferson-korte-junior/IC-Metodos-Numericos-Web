import { useState } from "react";

import MainLayout  from "./components/layout/MainLayout";
import Header      from "./components/layout/Header";
import Home        from "./pages/Home";
import Comparacao  from "./pages/Comparacao";

import Bissecao          from "./pages/Bissecao";
import Newton            from "./pages/Newton";
import Secante           from "./pages/Secante";
import Jacobi            from "./pages/Jacobi";
import GaussSeidel       from "./pages/GaussSeidel";
import Lagrange          from "./pages/Lagrange";
import NewtonInterpolacao from "./pages/NewtonInterpolacao";
import MinimosQuadrados  from "./pages/MinimosQuadrados";
import Trapezio          from "./pages/Trapezio";
import Simpson           from "./pages/Simpson";

const METODOS = [
  { nome: "Bisseção",            Componente: Bissecao           },
  { nome: "Newton",              Componente: Newton             },
  { nome: "Secante",             Componente: Secante            },
  { nome: "Jacobi",              Componente: Jacobi             },
  { nome: "Gauss-Seidel",        Componente: GaussSeidel        },
  { nome: "Lagrange",            Componente: Lagrange           },
  { nome: "Newton Interpolação", Componente: NewtonInterpolacao },
  { nome: "Mínimos Quadrados",   Componente: MinimosQuadrados   },
  { nome: "Trapézio",            Componente: Trapezio           },
  { nome: "Simpson",             Componente: Simpson            },
];

function App() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [metodoSelecionado,    setMetodoSelecionado]    = useState(null);
  const [metodosVisitados,     setMetodosVisitados]     = useState(() => new Set());
  const [comparacaoAtiva,      setComparacaoAtiva]      = useState(null);

  function selecionarMetodo(nome) {
    setMetodoSelecionado(nome);
    setComparacaoAtiva(null);
    setMetodosVisitados(prev => {
      if (prev.has(nome)) return prev;
      return new Set([...prev, nome]);
    });
  }

  function selecionarComparacao(tipo) {
    setComparacaoAtiva(tipo);
    setMetodoSelecionado(null);
    setCategoriaSelecionada(null);
  }

  function irParaHome() {
    setMetodoSelecionado(null);
    setCategoriaSelecionada(null);
    setComparacaoAtiva(null);
  }

  const mostrarHome       = metodoSelecionado === null && comparacaoAtiva === null;
  const mostrarComparacao = comparacaoAtiva !== null && metodoSelecionado === null;

  return (
    <MainLayout
      aoSelecionarcategoria={setCategoriaSelecionada}
      categoriaSelecionada={categoriaSelecionada}
      aoSelecionarMetodo={selecionarMetodo}
      metodoAtivo={metodoSelecionado}
      aoIrParaHome={irParaHome}
      aoSelecionarComparacao={selecionarComparacao}
      comparacaoAtiva={comparacaoAtiva}
    >
      {/* Home */}
      {mostrarHome && (
        <Home
          aoSelecionarCategoria={setCategoriaSelecionada}
          aoSelecionarMetodo={selecionarMetodo}
        />
      )}

      {/* Comparação de Métodos */}
      {mostrarComparacao && (
        <Comparacao tipoInicial={comparacaoAtiva} />
      )}

      {/* Header: visível apenas quando um método está ativo */}
      {!mostrarHome && !mostrarComparacao && (
        <Header categoriaSelecionada={categoriaSelecionada} />
      )}

      {/*
        Lazy Mount + CSS display:
        Componente montado na 1ª visita, nunca desmontado.
        Estado preservado ao navegar entre métodos.
      */}
      {METODOS.map(({ nome, Componente }) => {
        if (!metodosVisitados.has(nome)) return null;
        return (
          <div
            key={nome}
            style={{ display: metodoSelecionado === nome ? "block" : "none" }}
          >
            <Componente />
          </div>
        );
      })}
    </MainLayout>
  );
}

export default App;
