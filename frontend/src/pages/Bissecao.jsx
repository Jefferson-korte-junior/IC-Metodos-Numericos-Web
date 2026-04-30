// pages/Bissecao.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Responsabilidade: UI e interação exclusivamente.
// Toda matemática reside no backend; este arquivo nunca avalia f(x).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from "react";
import CardIteracaoBissecao from "../components/bisseccao/CardIteracaoBissecao";
import BissecaoInterativa   from "../components/bisseccao/BissecaoInterativa";
import { useBissecao }      from "../hooks/useBissecao";
import katex from "katex";
import "katex/dist/katex.min.css";

// ── Renderiza a expressão como LaTeX (puro display, sem avaliar) ─────────────
function FuncaoLatex({ funcao }) {
  const ref = useRef(null);

  function toLatex(expr) {
    if (!expr.trim()) return "f(x) = {\\color{#aaa}\\text{...}}";
    let s = expr.trim();
    s = s.replace(/\*\*(\d+)/g,        "^{$1}");
    s = s.replace(/(\d)\*([a-zA-Z(])/g, "$1$2");
    s = s.replace(/([a-zA-Z])\*([a-zA-Z(])/g, "$1 $2");
    s = s.replace(/Math\.sin|sin/g,  "\\sin");
    s = s.replace(/Math\.cos|cos/g,  "\\cos");
    s = s.replace(/Math\.tan|tan/g,  "\\tan");
    s = s.replace(/Math\.sqrt|sqrt/g,"\\sqrt");
    // "log" em Python/SymPy é log natural; exibimos como \ln para consistência
    s = s.replace(/Math\.log|log/g,  "\\ln");
    s = s.replace(/Math\.exp|exp/g,  "e^");
    s = s.replace(/Math\.abs|abs/g,  "\\left|");
    return `f(x) = ${s}`;
  }

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(toLatex(funcao), ref.current, {
          throwOnError: false,
          displayMode:  false,
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
        fontSize: 15, color: funcao.trim() ? "#1a1a2e" : "#aaa",
        minWidth: 80, display: "inline-block",
        verticalAlign: "middle", lineHeight: 1,
      }}
    />
  );
}

// ── Campo numérico reutilizável ──────────────────────────────────────────────
function CampoNumerico({ label, value, onChange, placeholder, step = "any" }) {
  return (
    <div>
      <label style={{
        display: "block", fontSize: 13, fontWeight: 600,
        color: "#444", marginBottom: 6,
      }}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        style={{
          width: "100%", border: "1px solid #ddd", borderRadius: 8,
          background: "#f8f8fc", outline: "none", fontSize: 14,
          fontFamily: "monospace", color: "#333",
          padding: "8px 12px", boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function Bissecao() {
  const [nivelDetalhe,    setNivelDetalhe]    = useState("basico");
  const [funcao,          setFuncao]          = useState("");
  const [valA,            setValA]            = useState("");
  const [valB,            setValB]            = useState("");
  const [tolerancia,      setTolerancia]      = useState("");
  const [maxIter,         setMaxIter]         = useState("");
  const [erroValidacao,   setErroValidacao]   = useState("");
  const [chaveInterativo, setChaveInterativo] = useState(0);

  // Todo o estado de cálculo vive no hook — nunca em useState local
  const { calcular, iteracoes, raiz, carregando, erro: erroApi, limpar } = useBissecao();

  const niveisDetalhe = [
    { value: "basico",       label: "Básico"       },
    { value: "intermediario",label: "Intermediário"},
    { value: "completo",     label: "Completo"     },
    { value: "interativo",   label: "Interativo"   },
  ];

  // ── Validação local (apenas formato/intervalo, não matemática) ────────────
  function validarEntrada() {
    if (!funcao.trim())              return "Informe a função f(x).";
    const a   = parseFloat(valA);
    const b   = parseFloat(valB);
    const tol = parseFloat(tolerancia);
    if (isNaN(a) || isNaN(b))        return "Informe os valores de a e b.";
    if (a >= b)                      return "O valor de a deve ser menor que b.";
    if (isNaN(tol) || tol <= 0)      return "Informe uma tolerância válida (ex: 0.0001).";
    return null;
  }

  async function handleCalcular() {
    limpar();
    setErroValidacao("");

    const msgErro = validarEntrada();
    if (msgErro) { setErroValidacao(msgErro); return; }

    await calcular({
      funcao,
      a:        parseFloat(valA),
      b:        parseFloat(valB),
      criterio: parseFloat(tolerancia),
      // maxIter não é suportado pelo backend atual; ignorado aqui
      // caso precise, adicionar ao endpoint /calcular
    });

    setChaveInterativo((k) => k + 1);
  }

  const erroExibido = erroValidacao || erroApi;

  return (
    <div style={{ padding: 24, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 20 }}>Método da Bisseção</h2>

      {/* Campo f(x) com KaTeX */}
      <div style={{ marginBottom: 16 }}>
        <label style={{
          display: "block", fontSize: 13, fontWeight: 600,
          color: "#444", marginBottom: 6,
        }}>
          Função f(x)
        </label>
        <div style={{
          display: "flex", alignItems: "start", gap: 10,
          background: "#f8f8fc", border: "1px solid #ddd",
          borderRadius: 8, padding: "8px 12px", maxWidth: 640,
        }}>
          <div style={{
            flexShrink: 0, fontSize: 14, color: "#3c3489",
            borderRight: "1px solid #ddd", paddingRight: 10,
            whiteSpace: "nowrap",
          }}>
            <FuncaoLatex funcao={funcao} />
          </div>
          <input
            type="text"
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            placeholder="ex: x**2 - 4"
            style={{
              flex: 1, border: "none", background: "transparent",
              outline: "none", fontSize: 14,
              fontFamily: "monospace", color: "#333",
            }}
          />
        </div>
        <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
          Use <code>**</code> para potência, <code>sin</code>, <code>cos</code>,{" "}
          <code>sqrt</code>, <code>log</code> (log natural), <code>exp</code>, etc.
        </p>
      </div>

      {/* Campos a, b, tolerância, máx iterações */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12, marginBottom: 20, maxWidth: 665,
      }}>
        <CampoNumerico label="a"            value={valA}       onChange={setValA}       placeholder="ex: 1"      />
        <CampoNumerico label="b"            value={valB}       onChange={setValB}       placeholder="ex: 3"      />
        <CampoNumerico label="Tolerância"   value={tolerancia} onChange={setTolerancia} placeholder="ex: 0.0001" step="0.00001" />
        <CampoNumerico label="Máx. iter."   value={maxIter}    onChange={setMaxIter}    placeholder="ex: 100"    step="1" />
      </div>

      {/* Botão + seletor de detalhe */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        maxWidth: 665, alignItems: "center",
        gap: 20, flexWrap: "wrap", marginBottom: 24,
      }}>
        <button
          onClick={handleCalcular}
          disabled={carregando}
          style={{
            background:  carregando ? "#9b98c9" : "#3c3489",
            color:       "#fff",
            border:      "none",
            borderRadius: 7,
            padding:     "9px 22px",
            fontSize:    14,
            fontWeight:  600,
            cursor:      carregando ? "not-allowed" : "pointer",
            whiteSpace:  "nowrap",
            display:     "flex",
            alignItems:  "center",
            gap:         8,
          }}
        >
          {carregando ? (
            <>
              <span style={{
                display: "inline-block", width: 14, height: 14,
                border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }} />
              Calculando…
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </>
          ) : "Calcular"}
        </button>

        <div style={{ width: 1, height: 28, background: "#ddd", flexShrink: 0 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{
            fontSize: 12, fontWeight: 600, color: "#666", marginRight: 6,
          }}>
            Detalhamento:
          </span>
          {niveisDetalhe.map(({ value, label }) => (
            <label
              key={value}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 13,
                color:      nivelDetalhe === value ? "#3c3489" : "#555",
                fontWeight: nivelDetalhe === value ? 600 : 400,
                cursor: "pointer", padding: "5px 10px", borderRadius: 6,
                background: nivelDetalhe === value ? "#eeedfe" : "transparent",
                border:     nivelDetalhe === value ? "1px solid #c5c2f0" : "1px solid transparent",
                transition: "all 0.15s", userSelect: "none",
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

      {/* Mensagem de erro (validação local OU erro da API) */}
      {erroExibido && (
        <div style={{
          marginBottom: 16, padding: "10px 14px", borderRadius: 8,
          background: "#fff0f0", border: "1px solid #f5c2c2",
          color: "#a00", fontSize: 13, maxWidth: 640,
        }}>
          {erroExibido}
        </div>
      )}

      {/* Resultado — modos Básico / Intermediário / Completo */}
      {iteracoes.length > 0 && nivelDetalhe !== "interativo" && (
        <CardIteracaoBissecao
          iteracoes={iteracoes}
          funcao={funcao}
          nivelDetalhe={nivelDetalhe}
        />
      )}

      {/* Resultado — modo Interativo */}
      {iteracoes.length > 0 && nivelDetalhe === "interativo" && (
        <BissecaoInterativa
          key={chaveInterativo}
          funcao={funcao}
          a={parseFloat(valA)}
          b={parseFloat(valB)}
          tolerancia={parseFloat(tolerancia)}
          iteracoesBackend={iteracoes}   // ← passa dados prontos do backend
        />
      )}
    </div>
  );
}
