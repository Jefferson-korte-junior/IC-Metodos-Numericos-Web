import Sidebar from "./Sidebar";

function MainLayout({ children, aoSelecionarcategoria, categoriaSelecionada, aoSelecionarMetodo, metodoAtivo, aoIrParaHome, aoSelecionarComparacao, comparacaoAtiva }) {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#f0f1f8" }}>
      <Sidebar
        aoSelecionarcategoria={aoSelecionarcategoria}
        categoriaSelecionada={categoriaSelecionada}
        aoSelecionarMetodo={aoSelecionarMetodo}
        metodoAtivo={metodoAtivo}
        aoIrParaHome={aoIrParaHome}
        aoSelecionarComparacao={aoSelecionarComparacao}
        comparacaoAtiva={comparacaoAtiva}
      />
      <main style={{
        flex: 1,
        padding: "20px 24px",
        overflowY: "auto",
        minWidth: 0,
      }}>
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
