// Importa o componente Sidebar (menu lateral)
// Esse arquivo Sidebar.jsx estará na mesma pasta (layout)
import Sidebar from "./Sidebar";

function MainLayout({ children , aoSelecionarcategoria}) {

    // O return define o que esse componente vai renderizar na tela
    return (

        // Div principal que organiza o layout em duas colunas
        // display: flex = layout lateral
        <div style={{ display: "flex", height: "100vh" }}>

            {/* Renderiza o componente Sidebar */}
            {/* Aqui entra o menu lateral */}
            <Sidebar aoSelecionarcategoria={aoSelecionarcategoria} />

            <main style={{ flex: 1, padding: "20px" }}>
                {children}
            </main>

        </div>
    );
}

// Permite que esse layout seja usado em outros arquivos
export default MainLayout;

