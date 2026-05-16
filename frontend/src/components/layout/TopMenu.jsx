import Botao from "../UI/Botao";

const METODO_ICONES = {
  "Bisseção":    "∩",
  "Newton":      "∂",
  "Secante":     "⟋",
  "Jacobi":      "⊕",
  "Gauss-Seidel":"⊗",
  "Lagrange":    "∿",
  "Trapézio":    "◺",
  "Simpson":     "∫",
};

function TopMenu({ categoriaSelecionada, aoSelecionarMetodo, metodoAtivo }) {
  const metodosDisponiveis = {
    "Zero de Funções":   ["Bisseção", "Newton", "Secante"],
    "Sistemas Lineares": ["Jacobi", "Gauss-Seidel"],
    "Interpolação":      ["Lagrange", "Newton"],
    "Integrais":         ["Trapézio", "Simpson"],
  };

  const metodosDaCategoria = metodosDisponiveis[categoriaSelecionada];

  if (!metodosDaCategoria) return null;

  return (
    <div style={{
      marginBottom: 20,
      padding: "14px 18px",
      background: "#ffffff",
      borderRadius: 12,
      border: "1px solid rgba(197,194,240,0.4)",
      boxShadow: "0 1px 8px rgba(60,52,137,0.05)",
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      alignItems: "center",
    }}>
      {metodosDaCategoria.map((metodo, index) => (
        <Botao
          key={index}
          variante="metodo"
          ativo={metodoAtivo === metodo}
          onClick={() => aoSelecionarMetodo(metodo)}
          style={{ borderRadius: 20, gap: 6, fontFamily: "'Inter', sans-serif" }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>{METODO_ICONES[metodo] ?? "·"}</span>
          {metodo}
        </Botao>
      ))}
    </div>
  );
}

export default TopMenu;
