import { useState } from "react";

import MainLayout from "./components/layout/MainLayout";
import Header    from "./components/layout/Header";
import TopMenu   from "./components/layout/TopMenu";

import Bissecao   from "./pages/Bissecao";
import Newton     from "./pages/Newton";
import Secante    from "./pages/Secante";
import Jacobi     from "./pages/Jacobi";
import GaussSeidel from "./pages/GaussSeidel";
import Lagrange   from "./pages/Lagrange";

function App() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [metodoSelecionado,    setMetodoSelecionado]    = useState(null);

  return (
    <MainLayout
      aoSelecionarcategoria={setCategoriaSelecionada}
      categoriaSelecionada={categoriaSelecionada}
    >
      <Header categoriaSelecionada={categoriaSelecionada} />

      <TopMenu
        aoSelecionarMetodo={setMetodoSelecionado}
        categoriaSelecionada={categoriaSelecionada}
        metodoAtivo={metodoSelecionado}
      />

      {metodoSelecionado === "Bisseção"    && <Bissecao />}
      {metodoSelecionado === "Newton"      && <Newton />}
      {metodoSelecionado === "Secante"     && <Secante />}
      {metodoSelecionado === "Jacobi"      && <Jacobi />}
      {metodoSelecionado === "Gauss-Seidel" && <GaussSeidel />}
      {metodoSelecionado === "Lagrange"    && <Lagrange />}
    </MainLayout>
  );
}

export default App;
