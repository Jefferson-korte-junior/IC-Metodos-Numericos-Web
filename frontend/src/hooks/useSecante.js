import { useState } from "react";

export function useSecante() {
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const calcular = async ({ funcao, x0, x1, criterio, tolerancia, maxIter }) => {
    setCarregando(true);
    setErro(null);
    setResultado(null);

    try {
      const response = await fetch("http://localhost:8000/secante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funcao,
          x0: parseFloat(x0),
          x1: parseFloat(x1),
          criterio,
          tolerancia: parseFloat(tolerancia),
          max_iter: parseInt(maxIter),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.detail || "Erro ao calcular pelo método da Secante.");
        return;
      }

      if (data.erro) {
        setErro(data.erro);
        return;
      }

      setResultado(data);
    } catch (err) {
      setErro(
        "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
      );
    } finally {
      setCarregando(false);
    }
  };

  const limpar = () => {
    setResultado(null);
    setErro(null);
  };

  return { calcular, resultado, erro, carregando, limpar };
}
