import { useState } from "react";
import { calcularTrapezio } from "../api/metodosNumericos";

export function useTrapezio() {
  const [resultado,  setResultado]  = useState(null);
  const [erro,       setErro]       = useState(null);
  const [carregando, setCarregando] = useState(false);

  async function calcular({ funcao, a, b, n }) {
    setCarregando(true);
    setErro(null);
    setResultado(null);
    try {
      const data = await calcularTrapezio({ funcao, a, b, n });
      setResultado(data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  function limpar() {
    setResultado(null);
    setErro(null);
  }

  return { calcular, resultado, erro, carregando, limpar };
}
