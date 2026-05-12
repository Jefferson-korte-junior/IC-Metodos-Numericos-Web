import Botao from "../UI/Botao";

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
        <div style={{ marginBottom: "20px", padding: "10px", borderBottom: "1px solid #ccc", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {metodosDaCategoria.map((metodo, index) => (
                <Botao
                    key={index}
                    variante="metodo"
                    ativo={metodoAtivo === metodo}
                    onClick={() => aoSelecionarMetodo(metodo)}
                >
                    {metodo}
                </Botao>
            ))}
        </div>
    );
}

export default TopMenu;
