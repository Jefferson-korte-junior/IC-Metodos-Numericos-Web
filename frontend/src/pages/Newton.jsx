import { useState } from "react";
import { useNewton } from "../hooks/useNewton";

const MODOS = [
  { value: "basico",        label: "Básico"        },
  { value: "intermediario", label: "Intermediário"  },
  { value: "completo",      label: "Completo"       },
];

const CRITERIOS = [
  { valor: "absoluto", label: "Erro Absoluto  |xₙ₊₁ - xₙ|"          },
  { valor: "relativo", label: "Erro Relativo  |xₙ₊₁ - xₙ| / |xₙ₊₁|" },
  { valor: "funcao",   label: "Valor da Função  |f(xₙ)|"              },
];

function CampoNumerico({ label, value, onChange, placeholder, step = "any" }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>
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

export default function Newton() {
  const [funcao,     setFuncao]     = useState("");
  const [x0,         setX0]         = useState("");
  const [tolerancia, setTolerancia] = useState("");
  const [maxIter,    setMaxIter]    = useState("");
  const [criterio,   setCriterio]   = useState("absoluto");
  const [modo,       setModo]       = useState("basico");

  const { calcular, resultado, erro, carregando, limpar } = useNewton();

  const handleCalcular = () => {
    limpar();
    calcular({ funcao, x0, criterio, tolerancia, maxIter });
  };

  return (
    <div style={{ padding: 24, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 8 }}>Método de Newton-Raphson</h2>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.5 }}>
        Utiliza a derivada da função para convergir rapidamente à raiz.
        Requer apenas um ponto inicial <strong>x₀</strong>.
      </p>

      {/* Campo f(x) */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>
          Função f(x)
        </label>
        <input
          type="text"
          value={funcao}
          onChange={(e) => setFuncao(e.target.value)}
          placeholder="ex: x**2 - 4"
          style={{
            width: "100%", maxWidth: 640,
            border: "1px solid #ddd", borderRadius: 8,
            background: "#f8f8fc", outline: "none",
            fontSize: 14, fontFamily: "monospace", color: "#333",
            padding: "8px 12px", boxSizing: "border-box",
          }}
        />
        <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
          Use <code>**</code> para potência, <code>sin</code>, <code>cos</code>,{" "}
          <code>sqrt</code>, <code>log</code> (log natural), <code>exp</code>, etc.
        </p>
      </div>

      {/* Campos x₀, tolerância, máx iterações */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12, marginBottom: 16, maxWidth: 500,
      }}>
        <CampoNumerico label="x₀"         value={x0}         onChange={setX0}         placeholder="ex: 1"      />
        <CampoNumerico label="Tolerância"  value={tolerancia} onChange={setTolerancia} placeholder="ex: 0.0001" step="0.00001" />
        <CampoNumerico label="Máx. iter."  value={maxIter}    onChange={setMaxIter}    placeholder="ex: 50"     step="1" />
      </div>

      {/* Critério de parada */}
      <div style={{ marginBottom: 20, maxWidth: 665 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 8 }}>
          Critério de Parada
        </label>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {CRITERIOS.map((c) => (
            <label key={c.valor} style={{ fontSize: 13, color: "#555", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="radio"
                name="criterio-newton"
                value={c.valor}
                checked={criterio === c.valor}
                onChange={() => setCriterio(c.valor)}
                style={{ accentColor: "#3c3489" }}
              />
              {c.label}
            </label>
          ))}
        </div>
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
            background:   carregando ? "#9b98c9" : "#3c3489",
            color:        "#fff",
            border:       "none",
            borderRadius: 7,
            padding:      "9px 22px",
            fontSize:     14,
            fontWeight:   600,
            cursor:       carregando ? "not-allowed" : "pointer",
            whiteSpace:   "nowrap",
          }}
        >
          {carregando ? "Calculando…" : "Calcular"}
        </button>

        <div style={{ width: 1, height: 28, background: "#ddd", flexShrink: 0 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#666", marginRight: 6 }}>
            Detalhamento:
          </span>
          {MODOS.map(({ value, label }) => (
            <label
              key={value}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 13,
                color:      modo === value ? "#3c3489" : "#555",
                fontWeight: modo === value ? 600 : 400,
                cursor: "pointer", padding: "5px 10px", borderRadius: 6,
                background: modo === value ? "#eeedfe" : "transparent",
                border:     modo === value ? "1px solid #c5c2f0" : "1px solid transparent",
                transition: "all 0.15s", userSelect: "none",
              }}
            >
              <input
                type="radio"
                name="modoNewton"
                value={value}
                checked={modo === value}
                onChange={(e) => { setModo(e.target.value); limpar(); }}
                style={{ accentColor: "#3c3489", margin: 0 }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div style={{
          marginBottom: 16, padding: "10px 14px", borderRadius: 8,
          background: "#fff0f0", border: "1px solid #f5c2c2",
          color: "#a00", fontSize: 13, maxWidth: 640,
        }}>
          {erro}
        </div>
      )}

      {/* Resultado */}
      {resultado && <ResultadoNewton resultado={resultado} modo={modo} />}
    </div>
  );
}

function ResultadoNewton({ resultado, modo }) {
  const iteracoes = resultado.iteracoes ?? [];

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Resumo */}
      <div style={{
        background: "#f0f0fc", border: "1px solid #c5c2f0",
        borderRadius: 10, padding: "16px 20px", marginBottom: 16,
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        <LinhaResumo label="Raiz aproximada"     valor={`x ≈ ${resultado.raiz?.toFixed(8)}`} />
        <LinhaResumo label="Iterações realizadas" valor={iteracoes.length} />
        {iteracoes.length > 0 && (
          <LinhaResumo
            label="Erro final"
            valor={iteracoes[iteracoes.length - 1].erro?.toExponential(4)}
          />
        )}
      </div>

      {/* Tabela */}
      {(modo === "intermediario" || modo === "completo") && iteracoes.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
            {modo === "intermediario"
              ? "Primeiras e últimas iterações"
              : `Todas as iterações (${iteracoes.length})`}
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f0f0fc" }}>
                {["Iteração", "xₙ", "f(xₙ)", "f'(xₙ)", "xₙ₊₁", "Erro"].map((h) => (
                  <th key={h} style={{
                    padding: "8px 12px", textAlign: "left", fontWeight: 600,
                    color: "#3c3489", whiteSpace: "nowrap",
                    borderBottom: "2px solid #c5c2f0",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrarIteracoes(iteracoes, modo).map((it, idx) =>
                it._separador ? (
                  <tr key={`sep-${idx}`}>
                    <td colSpan={6} style={{ textAlign: "center", padding: "4px", color: "#aaa" }}>⋮</td>
                  </tr>
                ) : (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? "white" : "#f8f8fc" }}>
                    <td style={tdStyle}>{it.iteracao ?? idx + 1}</td>
                    <td style={tdStyle}>{formatarNum(it.x)}</td>
                    <td style={tdStyle}>{formatarNum(it.fx)}</td>
                    <td style={tdStyle}>{formatarNum(it.dfx)}</td>
                    <td style={tdStyle}>{formatarNum(it.x_novo)}</td>
                    <td style={tdStyle}>{it.erro?.toExponential(4)}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LinhaResumo({ label, valor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "#444" }}>{label}</span>
      <strong style={{ fontFamily: "monospace", color: "#3c3489" }}>{valor}</strong>
    </div>
  );
}

const tdStyle = { padding: "7px 12px", fontFamily: "monospace", color: "#333" };

function formatarNum(val) {
  if (val === undefined || val === null) return "-";
  return typeof val === "number" ? val.toFixed(6) : val;
}

function filtrarIteracoes(iteracoes, modo) {
  if (modo === "completo") return iteracoes;
  if (iteracoes.length <= 6) return iteracoes;
  return [
    ...iteracoes.slice(0, 3),
    { _separador: true },
    ...iteracoes.slice(-3),
  ];
}
