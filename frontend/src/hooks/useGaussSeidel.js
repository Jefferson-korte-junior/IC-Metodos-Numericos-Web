import { useState } from "react";

export function useGaussSeidel() {
  const [resultado,  setResultado]  = useState(null);
  const [erro,       setErro]       = useState(null);
  const [carregando, setCarregando] = useState(false);

  const calcular = async ({ A, b, chute, tolerancia }) => {
    setCarregando(true);
    setErro(null);
    setResultado(null);
    try {
      const res = await fetch("http://localhost:8000/gauss-seidel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ A, b, chute, tolerancia }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(
          typeof data.detail === "string"
            ? data.detail
            : Array.isArray(data.detail)
              ? data.detail.map(e => e.msg || JSON.stringify(e)).join("; ")
              : "Erro ao calcular pelo método de Gauss-Seidel."
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
