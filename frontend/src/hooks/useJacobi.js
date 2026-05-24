import { useState, useCallback } from "react";
import { calcularJacobi } from "../api/metodosNumericos";

export function useJacobi() {
  const [resultado,  setResultado]  = useState(null);
  const [erro,       setErro]       = useState(null);
  const [carregando, setCarregando] = useState(false);

  const calcular = useCallback(async (params) => {
    setCarregando(true);
    setErro(null);
    setResultado(null);
    try {
      const data = await calcularJacobi(params);
      setResultado(data);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  const limpar = useCallback(() => {
    setResultado(null);
    setErro(null);
  }, []);

  return { calcular, resultado, erro, carregando, limpar };
}
