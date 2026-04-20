function Sidebar({ aoSelecionarcategoria }) {
  return (

    <aside
      style={{
        width: "220px",
        backgroundColor: "#1e1e1e",
        color: "#ffffff",
        padding: "20px",
      }}
    >
      <h2>Menu</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>

        <li style={{cursor: "pointer", marginBottom: "10px"}} onClick={() => aoSelecionarcategoria("Zero de Funções")}>Zeros de Funções</li>
        <li style={{cursor: "pointer", marginBottom: "10px"}} onClick={() => aoSelecionarcategoria("Sistemas Lineares")}>Sistemas Lineares</li>
        <li style={{cursor: "pointer", marginBottom: "10px"}} onClick={() => aoSelecionarcategoria("Interpolação")}>Interpolação</li>
        <li style={{cursor: "pointer", marginBottom: "10px"}} onClick={() => aoSelecionarcategoria("Integrais")}>Integrais</li>
        

      </ul>
    </aside>

  );
}

export default Sidebar;
