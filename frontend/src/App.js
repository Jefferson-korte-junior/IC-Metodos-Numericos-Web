import { useState } from "react";

import MainLayout  from "./components/layout/MainLayout";
import Header      from "./components/layout/Header";
import TopMenu     from "./components/layout/TopMenu";

import Bissecao    from "./pages/Bissecao";
import Newton      from "./pages/Newton";
import Secante     from "./pages/Secante";
import Jacobi      from "./pages/Jacobi";
import GaussSeidel from "./pages/GaussSeidel";
import Lagrange         from "./pages/Lagrange";
import MinimosQuadrados from "./pages/MinimosQuadrados";
import Trapezio         from "./pages/Trapezio";
import Simpson          from "./pages/Simpson";

/**
 * Registro de todos os métodos disponíveis.
 * Para adicionar um novo método, basta incluir uma entrada aqui.
 */
const METODOS = [
  { nome: "Bisseção",           Componente: Bissecao          },
  { nome: "Newton",             Componente: Newton            },
  { nome: "Secante",            Componente: Secante           },
  { nome: "Jacobi",             Componente: Jacobi            },
  { nome: "Gauss-Seidel",       Componente: GaussSeidel       },
  { nome: "Lagrange",           Componente: Lagrange          },
  { nome: "Mínimos Quadrados",  Componente: MinimosQuadrados  },
  { nome: "Trapézio",           Componente: Trapezio          },
  { nome: "Simpson",            Componente: Simpson           },
];

function App() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [metodoSelecionado,    setMetodoSelecionado]    = useState(null);

  /**
   * Conjunto dos métodos já visitados pelo usuário nesta sessão.
   * Um método entra neste Set na primeira vez que é selecionado e
   * NUNCA é removido — isso garante que o componente permaneça montado
   * (e com todo o seu estado preservado) mesmo quando não está visível.
   */
  const [metodosVisitados, setMetodosVisitados] = useState(() => new Set());

  function selecionarMetodo(nome) {
    setMetodoSelecionado(nome);
    // Registra a visita apenas se ainda não estiver no Set (evita re-render desnecessário)
    setMetodosVisitados(prev => {
      if (prev.has(nome)) return prev;
      return new Set([...prev, nome]);
    });
  }

  return (
    <MainLayout
      aoSelecionarcategoria={setCategoriaSelecionada}
      categoriaSelecionada={categoriaSelecionada}
    >
      <Header categoriaSelecionada={categoriaSelecionada} />

      <TopMenu
        aoSelecionarMetodo={selecionarMetodo}
        categoriaSelecionada={categoriaSelecionada}
        metodoAtivo={metodoSelecionado}
      />

      {/*
        Estratégia: Lazy Mount + CSS display
        ─────────────────────────────────────
        • O componente só é montado na PRIMEIRA vez que o método é visitado.
        • Após montado, NUNCA é desmontado — apenas ocultado via display:none.
        • Ao voltar para o método, todo o estado interno (inputs, resultados,
          iterações, modo interativo) está exatamente como o usuário deixou.
        • Impacto de memória: mínimo — componentes ocultos não executam layout
          nem pintura, apenas mantêm o estado JS em memória.
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
