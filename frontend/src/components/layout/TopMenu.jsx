function TopMenu({ categoriaSelecionada, aoSelecionarMetodo }) {
    if (categoriaSelecionada !== "Zero de Funções") {
        return null;
    }

    return (
        <div style={{marginBottom: "20px", padding: "10px", borderBottom: "1px solid #ccc"}}>

            <button onClick={() => aoSelecionarMetodo("Bisseção")}>
                Bisseção
            </button>

            <button 
                style={{marginLeft: "10px"}}
                onClick={() => aoSelecionarMetodo("Newton")}>
                Newton
            </button>
            
        </div>
    )
}
export default TopMenu;