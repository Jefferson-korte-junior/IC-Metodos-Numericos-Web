/**
 * hooks/useBissecao.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Encapsula todo o estado assíncrono da chamada ao backend.
 * O componente de UI importa apenas este hook — nunca chama fetch diretamente.
 *
 * Retorna:
 *   calcular(params)  — dispara a chamada
 *   iteracoes         — array com o histórico retornado pelo backend
 *   raiz              — valor da raiz convergida (null enquanto não calculado)
 *   carregando        — boolean
 *   erro              — string | null
 *   limpar()          — reseta o estado
 */

import { useState, useCallback } from "react";
import { calcularBissecao } from "../api/metodosNumericos";

export function useBissecao() {
  const [iteracoes,  setIteracoes]  = useState([]);
  const [raiz,       setRaiz]       = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro,       setErro]       = useState(null);

  const calcular = useCallback(async (params) => {
    setCarregando(true);
    setErro(null);
    setIteracoes([]);
    setRaiz(null);

    try {
      const resultado = await calcularBissecao(params);
      setRaiz(resultado.raiz);
      setIteracoes(resultado.iteracoes ?? []);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  const limpar = useCallback(() => {
    setIteracoes([]);
    setRaiz(null);
    setErro(null);
    setCarregando(false);
  }, []);

  return { calcular, iteracoes, raiz, carregando, erro, limpar };
}
