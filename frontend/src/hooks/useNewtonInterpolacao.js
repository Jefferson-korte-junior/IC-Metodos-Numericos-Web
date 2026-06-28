import { useState, useCallback } from "react";
import { calcularNewtonInterpolacao } from "../api/metodosNumericos";

export function useNewtonInterpolacao() {
  const [resultado,  setResultado]  = useState(null);
  const [erro,       setErro]       = useState(null);
  const [carregando, setCarregando] = useState(false);

  const calcular = useCallback(async (params) => {
    setCarregando(true);
    setErro(null);
    setResultado(null);
    try {
      const data = await calcularNewtonInterpolacao(params);
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
