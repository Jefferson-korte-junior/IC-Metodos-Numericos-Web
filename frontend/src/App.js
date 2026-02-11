import {useState} from "react"; //essa importaçao do react nos permite usar estados nos componentes, quando o valor for atualizado  faz o componente ser renderizado novamente.

import MainLayout from "./components/layout/MainLayout";
import TopMenu from "./components/layout/TopMenu";

function App() {

  //variavel pra guardar estado da categoria selecionada no menu lateral
  //Funçao pra mudar o valor
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null); //Ele me retorna um array com [valor, função].

  const [metodoSelecionado, setMetodoSelecionado] = useState(null);


  return (

    <MainLayout aoSelecionarcategoria={setCategoriaSelecionada}> 
    
      
      <h1>Projeto IC - Métodos Numéricos</h1>
      <p>Bem-vindo ao nosso aplicativo de Métodos Numéricos!</p>

      <p>Categoria Selecionada pelo usuario {categoriaSelecionada}</p>

      <TopMenu
        aoSelecionarMetodo={setMetodoSelecionado} 
        categoriaSelecionada={categoriaSelecionada}>

      </TopMenu>

      <p>Método selecionado: {metodoSelecionado}</p>

    </MainLayout>

  );
}

export default App;
