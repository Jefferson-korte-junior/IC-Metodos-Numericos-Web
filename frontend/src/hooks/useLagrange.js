import { useState } from "react";

export function useLagrange() {
  const [resultado,  setResultado]  = useState(null);
  const [erro,       setErro]       = useState(null);
  const [carregando, setCarregando] = useState(false);

  const calcular = async ({ pontos, x_eval }) => {
    setCarregando(true);
    setErro(null);
    setResultado(null);
    try {
      const res = await fetch("http://localhost:8000/lagrange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pontos, x_eval }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(
          typeof data.detail === "string"
            ? data.detail
            : Array.isArray(data.detail)
              ? data.detail.map(e => e.msg || JSON.stringify(e)).join("; ")
              : "Erro ao calcular interpolação de Lagrange."
        );
        return;
      }
      setResultado(data);
    } catch {
      setErro("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
    } finally {
      setCarregando(false);
    }
  };

  const limpar = () => { setResultado(null); setErro(null); };
  return { calcular, resultado, erro, carregando, limpar };
}
