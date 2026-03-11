function TopMenu({ categoriaSelecionada, aoSelecionarMetodo }) {


    const metodosDisponiveis = {
        "Zero de Funções": ["Bisseção", "Newton"],
        "Interpolação": ["Lagrange", "Newton"],
        "Integrais": ["Trapézio", "Simpson"]
    }

    const metodosDaCategoria =  metodosDisponiveis[categoriaSelecionada]

    if (!metodosDaCategoria) {
        return null;
    }

    return (
        <div style={{marginBottom: "20px", padding: "10px", borderBottom: "1px solid #ccc"}}>

           {metodosDaCategoria.map((metodosDisponiveis, index) => (

                <button
                    key={index}
                    style={{marginRight: "10px" }}
                    onClick={() => aoSelecionarMetodo(metodosDisponiveis)}
                >   
                    {metodosDisponiveis}
                </button>


           ))}
            
        </div>
    )
}
export default TopMenu;