// Bissecao.jsx
import React, { useState, useEffect, useRef } from "react";
import CardIteracaoBissecao from "../components/bisseccao/CardIteracaoBissecao";
import katex from "katex";
import "katex/dist/katex.min.css";

// ── Componente que renderiza a função em LaTeX ao lado do input
function FuncaoLatex({ funcao }) {
  const ref = useRef(null);

  // Converte a string da função para LaTeX legível
  function toLatex(expr) {
    if (!expr.trim()) return "f(x) = {\\color{#aaa}\\text{...}}";
    let s = expr.trim();
    // Potências: x**2 → x^{2}, (x+1)**3 → (x+1)^{3}
    s = s.replace(/\*\*(\d+)/g, "^{$1}");
    // Multiplicação implícita: 2*x → 2x
    s = s.replace(/(\d)\*([a-zA-Z(])/g, "$1$2");
    s = s.replace(/([a-zA-Z])\*([a-zA-Z(])/g, "$1 $2");
    // Funções matemáticas
    s = s.replace(/Math\.sin|sin/g, "\\sin");
    s = s.replace(/Math\.cos|cos/g, "\\cos");
    s = s.replace(/Math\.tan|tan/g, "\\tan");
    s = s.replace(/Math\.sqrt|sqrt/g, "\\sqrt");
    s = s.replace(/Math\.log|log/g, "\\ln");
    s = s.replace(/Math\.exp|exp/g, "e^");
    s = s.replace(/Math\.abs|abs/g, "\\left|");
    return `f(x) = ${s}`;
  }

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(toLatex(funcao), ref.current, {
          throwOnError: false,
          displayMode: false,
        });
      } catch {
        ref.current.textContent = `f(x) = ${funcao}`;
      }
    }
  }, [funcao]);

  return (
    <span
      ref={ref}
      style={{
        fontSize: 15,
        color: funcao.trim() ? "#1a1a2e" : "#aaa",
        minWidth: 80,
        display: "inline-block",
        verticalAlign: "middle",
        lineHeight: 1,
      }}
    />
  );
}


// ── Campo de input numérico reutilizável
function CampoNumerico({ label, value, onChange, placeholder, step = "any" }) {
  return (
    <div>
      <label
        style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}
      >
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        style={{
          width: "100%",
          border: "1px solid #ddd",
          borderRadius: 8,
          background: "#f8f8fc",
          outline: "none",
          fontSize: 14,
          fontFamily: "monospace",
          color: "#333",
          padding: "8px 12px",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

export default function Bissecao() {
  const [nivelDetalhe, setNivelDetalhe] = useState("basico");
  const [funcao, setFuncao] = useState("");
  const [valA, setValA] = useState("");
  const [valB, setValB] = useState("");
  const [tolerancia, setTolerancia] = useState("");
  const [maxIter, setMaxIter] = useState("");
  const [iteracoes, setIteracoes] = useState([]);
  const [erro, setErro] = useState("");

  const niveisDetalhe = [
    { value: "basico", label: "Básico" },
    { value: "intermediario", label: "Intermediário" },
    { value: "completo", label: "Completo" },
  ];

  function handleCalcular() {
    setErro("");
    setIteracoes([]);

    // Validações básicas
    const a = parseFloat(valA);
    const b = parseFloat(valB);
    const tol = parseFloat(tolerancia);
    const maxI = parseInt(maxIter) || 100;

    if (!funcao.trim()) return setErro("Informe a função f(x).");
    if (isNaN(a) || isNaN(b)) return setErro("Informe os valores de a e b.");
    if (a >= b) return setErro("O valor de a deve ser menor que b.");
    if (isNaN(tol) || tol <= 0) return setErro("Informe uma tolerância válida (ex: 0.0001).");

    // Avalia f(x)
    function f(xVal) {
      try {
        const expr = funcao
          .replace(/\^/g, "**")
          .replace(/sin/g, "Math.sin")
          .replace(/cos/g, "Math.cos")
          .replace(/tan/g, "Math.tan")
          .replace(/sqrt/g, "Math.sqrt")
          .replace(/log/g, "Math.log")
          .replace(/exp/g, "Math.exp")
          .replace(/abs/g, "Math.abs");
        // eslint-disable-next-line no-new-func
        return Function("x", `return ${expr}`)(xVal);
      } catch {
        return NaN;
      }
    }

    const fa0 = f(a);
    const fb0 = f(b);

    if (isNaN(fa0) || isNaN(fb0)) return setErro("Não foi possível avaliar f(x) no intervalo informado.");
    if (fa0 * fb0 > 0) return setErro("f(a) e f(b) têm o mesmo sinal — o método não garante raiz nesse intervalo.");

    // Executa bisseção
    let ai = a, bi = b;
    const resultado = [];

    for (let i = 0; i < maxI; i++) {
      const media = (ai + bi) / 2;
      const fa = f(ai);
      const fb = f(bi);
      const fm = f(media);

      const substituiu = Math.sign(fa) === Math.sign(fm) ? "a" : "b";

      resultado.push({ a: ai, b: bi, media, fa, fb, fm, substituiu });

      if (Math.abs(fm) < tol || Math.abs(bi - ai) / 2 < tol) break;

      if (substituiu === "a") ai = media;
      else bi = media;
    }

    setIteracoes(resultado);
  }

  return (
    <div style={{ padding: 24, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 20 }}>Método da Bisseção</h2>

      {/* Campo f(x) com KaTeX */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}
        >
          Função f(x)
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "start",
            gap: 10,
            background: "#f8f8fc",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "8px 12px",
            maxWidth: 640,
          }}
        >
          {/* Preview KaTeX à esquerda */}
          <div
            style={{
              flexShrink: 0,
              fontSize: 14,
              color: "#3c3489",
              borderRight: "1px solid #ddd",
              paddingRight: 10,
              whiteSpace: "nowrap",
            }}
          >
            <FuncaoLatex funcao={funcao} />
          </div>

          {/* Input */}
          <input
            type="text"
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            placeholder="ex: x**2 - 4"
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 14,
              fontFamily: "monospace",
              color: "#333",
            }}
          />
        </div>
        <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
          Use <code>**</code> para potência, <code>sin</code>, <code>cos</code>, <code>sqrt</code>, etc.
        </p>
      </div>

      {/* Campos a, b, tolerância, máx. iterações — em grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 20,
          maxWidth: 665,
        }}
      >
        <CampoNumerico label="a" value={valA} onChange={setValA} placeholder="ex: 1" />
        <CampoNumerico label="b" value={valB} onChange={setValB} placeholder="ex: 2" />
        <CampoNumerico
          label="Tolerância"
          value={tolerancia}
          onChange={setTolerancia}
          placeholder="ex: 0.0001"
          step="0.00001"
        />
        <CampoNumerico
          label="Máx. iterações"
          value={maxIter}
          onChange={setMaxIter}
          placeholder="ex: 100"
          step="1"
        />
      </div>

      {/* Linha: Botão Calcular + Radio de nível de detalhe */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          maxWidth: 665,
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
        
        
        
      >
        {/* Botão */}
        <button
          onClick={handleCalcular}
          style={{
            background: "#3c3489",
            color: "#fff",
            border: "none",
            borderRadius: 7,
            padding: "9px 22px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Calcular
        </button>

        {/* Separador visual */}
        <div style={{ width: 1, height: 28, background: "#ddd", flexShrink: 0 }} />

        {/* Radio: nível de detalhe */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#666", marginRight: 6 }}>
            Detalhamento:
          </span>
          {niveisDetalhe.map(({ value, label }) => (
            <label
              key={value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
                color: nivelDetalhe === value ? "#3c3489" : "#555",
                fontWeight: nivelDetalhe === value ? 600 : 400,
                cursor: "pointer",
                padding: "5px 10px",
                borderRadius: 6,
                background: nivelDetalhe === value ? "#eeedfe" : "transparent",
                border: nivelDetalhe === value ? "1px solid #c5c2f0" : "1px solid transparent",
                transition: "all 0.15s",
                userSelect: "none",
              }}
            >
              <input
                type="radio"
                name="nivelDetalhe"
                value={value}
                checked={nivelDetalhe === value}
                onChange={(e) => setNivelDetalhe(e.target.value)}
                style={{ accentColor: "#3c3489", margin: 0 }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 8,
            background: "#fff0f0",
            border: "1px solid #f5c2c2",
            color: "#a00",
            fontSize: 13,
            maxWidth: 640,
          }}
        >
          {erro}
        </div>
      )}

      {/* Resultado */}
      {iteracoes.length > 0 && (
        <CardIteracaoBissecao
          iteracoes={iteracoes}
          funcao={funcao}
          nivelDetalhe={nivelDetalhe}
        />
      )}
    </div>
  );
}
