import React, { useState, useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  Chart as ChartJS, LinearScale, PointElement, LineElement, Filler, Tooltip,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import { useTrapezio } from "../hooks/useTrapezio";
import TrapezioInterativo from "../components/integrais/TrapezioInterativo";

ChartJS.register(LinearScale, PointElement, LineElement, Filler, Tooltip);

const MODOS = [
  { value: "basico",        label: "Básico"       },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado",      label: "Avançado"      },
  { value: "interativo",    label: "Interativo"    },
];

function fmtS(v, c = 6) { return Number(v).toFixed(c); }

// ── Renderiza a expressão como LaTeX ─────────────────────────────────────────
function FuncaoLatex({ funcao }) {
  const ref = useRef(null);
  function toLatex(expr) {
    if (!expr.trim()) return "f(x) = {\\color{#aaa}\\text{...}}";
    let s = expr.trim();
    s = s.replace(/\*\*(\d+)/g,              "^{$1}");
    s = s.replace(/(\d)\*([a-zA-Z(])/g,     "$1$2");
    s = s.replace(/([a-zA-Z])\*([a-zA-Z(])/g, "$1 $2");
    s = s.replace(/Math\.sin|sin/g,  "\\sin");
    s = s.replace(/Math\.cos|cos/g,  "\\cos");
    s = s.replace(/Math\.tan|tan/g,  "\\tan");
    s = s.replace(/Math\.sqrt|sqrt/g,"\\sqrt");
    s = s.replace(/Math\.log|log/g,  "\\ln");
    s = s.replace(/Math\.exp|exp/g,  "e^");
    s = s.replace(/Math\.abs|abs/g,  "\\left|");
    return `f(x) = ${s}`;
  }
  useEffect(() => {
    if (ref.current) {
      try { katex.render(toLatex(funcao), ref.current, { throwOnError: false, displayMode: false }); }
      catch { ref.current.textContent = `f(x) = ${funcao}`; }
    }
  }, [funcao]);
  return (
    <span ref={ref} style={{ fontSize: 15, color: funcao.trim() ? "#1a1a2e" : "#aaa", minWidth: 80, display: "inline-block", verticalAlign: "middle", lineHeight: 1 }}/>
  );
}

function CampoNumerico({ label, value, onChange, placeholder, step = "any", min }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>{label}</label>
      <input type="number" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} step={step} min={min}
        style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, background: "#f8f8fc", outline: "none", fontSize: 14, fontFamily: "monospace", color: "#333", padding: "8px 12px", boxSizing: "border-box" }}
      />
    </div>
  );
}

// ── Gráfico dos pontos (trapézios) ────────────────────────────────────────────
function GraficoTrapezio({ pontos }) {
  const data = {
    datasets: [{
      label: "f(xᵢ)",
      data: pontos.map(p => ({ x: p.xi, y: p.fi })),
      backgroundColor: "#3c3489cc",
      borderColor: "#3c3489",
      showLine: true,
      fill: { target: "origin", above: "rgba(60,52,137,0.10)" },
      tension: 0,
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `f(${ctx.raw.x.toFixed(4)}) = ${ctx.raw.y.toFixed(6)}` } },
    },
    scales: {
      x: { title: { display: true, text: "x" }, grid: { color: "#f0f0f0" } },
      y: { title: { display: true, text: "f(x)" }, grid: { color: "#f0f0f0" } },
    },
  };
  return (
    <div style={{ height: 220, position: "relative", marginTop: 16 }}>
      <Scatter data={data} options={options}/>
    </div>
  );
}

// ── Modos de exibição ─────────────────────────────────────────────────────────
function ResultadoBasico({ resultado }) {
  const { resultado: I, h, n, a, b } = resultado;
  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "20px 24px", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", marginBottom: 8 }}>Resultado</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#166534", fontFamily: "monospace", marginBottom: 4 }}>{fmtS(I, 8)}</div>
        <div style={{ fontSize: 13, color: "#4ade80" }}>∫f(x)dx ≈ {fmtS(I, 8)}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "h (passo)", value: fmtS(h, 6), cor: "#3c3489" },
          { label: "n subintervalos", value: n, cor: "#2563eb" },
          { label: "[a, b]", value: `[${a}, ${b}]`, cor: "#0d9488" },
        ].map(({ label, value, cor }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e5e5f0", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: cor, fontFamily: "monospace" }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultadoIntermediario({ resultado }) {
  const { resultado: I, h, pontos, soma_ponderada } = resultado;
  return (
    <div style={{ maxWidth: 700 }}>
      <ResultadoBasico resultado={resultado}/>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Tabela de Avaliação
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f0fc" }}>
                {["i","xᵢ","f(xᵢ)","peso","peso·f(xᵢ)"].map(h_ => (
                  <th key={h_} style={{ padding: "7px 14px", textAlign: "center", color: "#3c3489", fontWeight: 600, borderBottom: "2px solid #c5c2f0", fontSize: 13 }}>{h_}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pontos.map((p, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8f8fc" }}>
                  <td style={{ padding: "6px 14px", fontSize: 13, color: "#888", textAlign: "center", fontFamily: "monospace" }}>{p.i}</td>
                  <td style={{ padding: "6px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "right" }}>{fmtS(p.xi, 4)}</td>
                  <td style={{ padding: "6px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "right", fontWeight: 600 }}>{fmtS(p.fi, 6)}</td>
                  <td style={{ padding: "6px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "center", color: p.peso === 1 ? "#0d9488" : "#2563eb", fontWeight: 700 }}>{p.peso}</td>
                  <td style={{ padding: "6px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "right", color: "#3c3489" }}>{fmtS(p.fi * p.peso, 6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 16, background: "#f8f8fc", border: "1px solid #e0e0f0", borderRadius: 8, padding: "12px 16px", fontFamily: "monospace", fontSize: 13, color: "#3c3489" }}>
        I ≈ (h/2) × Σ = ({fmtS(h,4)}/2) × {fmtS(soma_ponderada,6)} = <strong>{fmtS(I,8)}</strong>
      </div>

      <GraficoTrapezio pontos={pontos}/>
    </div>
  );
}

function ResultadoAvancado({ resultado }) {
  const { resultado: I, h, n, pontos, soma_ponderada, a, b } = resultado;
  const somaExtremos    = pontos.filter(p => p.peso === 1).reduce((s, p) => s + p.fi, 0);
  const somaInteriores  = pontos.filter(p => p.peso === 2).reduce((s, p) => s + p.fi, 0);
  const strExtremos     = pontos.filter(p => p.peso === 1).map(p => fmtS(p.fi, 4)).join(" + ");
  const strInteriores   = pontos.filter(p => p.peso === 2).map(p => fmtS(p.fi, 4)).join(" + ");

  return (
    <div style={{ maxWidth: 720 }}>
      <ResultadoBasico resultado={resultado}/>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Derivação Passo a Passo
        </div>
        <div style={{ background: "#f8f8fc", border: "1px solid #e0e0f0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 13, lineHeight: 2, color: "#444" }}>
          <div>h = (b − a) / n = ({b} − {a}) / {n} = <strong style={{ color: "#3c3489" }}>{fmtS(h,6)}</strong></div>
          <div style={{ borderTop: "1px solid #eee", marginTop: 6, paddingTop: 6 }}>
            <span style={{ color: "#0d9488" }}>Extremos (peso 1):</span> {strExtremos} = {fmtS(somaExtremos, 6)}
          </div>
          <div>
            <span style={{ color: "#2563eb" }}>Interiores (peso 2):</span> 2 × ({strInteriores}) = {fmtS(2 * somaInteriores, 6)}
          </div>
          <div style={{ borderTop: "1px solid #eee", marginTop: 6, paddingTop: 6 }}>
            Σ ponderada = {fmtS(somaExtremos,4)} + {fmtS(2*somaInteriores,4)} = <strong>{fmtS(soma_ponderada,6)}</strong>
          </div>
          <div>
            I = (h/2) × Σ = ({fmtS(h,6)}/2) × {fmtS(soma_ponderada,6)} = <strong style={{ color: "#16a34a" }}>{fmtS(I,8)}</strong>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Tabela Completa
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f0fc" }}>
                {["i","xᵢ","f(xᵢ)","peso","peso·f(xᵢ)","contrib. %"].map(h_ => (
                  <th key={h_} style={{ padding: "7px 14px", textAlign: "center", color: "#3c3489", fontWeight: 600, borderBottom: "2px solid #c5c2f0", fontSize: 13 }}>{h_}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pontos.map((p, i) => {
                const contrib = (p.fi * p.peso / soma_ponderada * 100);
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8f8fc" }}>
                    <td style={{ padding: "6px 14px", fontSize: 13, color: "#888", textAlign: "center", fontFamily: "monospace" }}>{p.i}</td>
                    <td style={{ padding: "6px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "right" }}>{fmtS(p.xi, 4)}</td>
                    <td style={{ padding: "6px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "right", fontWeight: 600 }}>{fmtS(p.fi, 6)}</td>
                    <td style={{ padding: "6px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "center", color: p.peso === 1 ? "#0d9488" : "#2563eb", fontWeight: 700 }}>{p.peso}</td>
                    <td style={{ padding: "6px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "right", color: "#3c3489" }}>{fmtS(p.fi * p.peso, 6)}</td>
                    <td style={{ padding: "6px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "right", color: "#888" }}>{fmtS(Math.abs(contrib), 1)}%</td>
                  </tr>
                );
              })}
              <tr style={{ background: "#f0f0fc", fontWeight: 700 }}>
                <td colSpan={4} style={{ padding: "7px 14px", textAlign: "right", color: "#3c3489", fontSize: 13 }}>Σ ponderada:</td>
                <td style={{ padding: "7px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "right", color: "#3c3489" }}>{fmtS(soma_ponderada, 6)}</td>
                <td style={{ padding: "7px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "right", color: "#888" }}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 16, background: "#f8f8fc", border: "1px solid #e0e0f0", borderRadius: 8, padding: "12px 16px", fontFamily: "monospace", fontSize: 13, color: "#3c3489" }}>
        I ≈ ({fmtS(h,6)}/2) × {fmtS(soma_ponderada,6)} = <strong>{fmtS(I,8)}</strong>
      </div>

      <GraficoTrapezio pontos={pontos}/>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Trapezio() {
  const [modo,            setModo]            = useState("basico");
  const [funcao,          setFuncao]          = useState("sin(x)");
  const [valA,            setValA]            = useState("0");
  const [valB,            setValB]            = useState("3.14159265");
  const [valN,            setValN]            = useState("4");
  const [erroValidacao,   setErroValidacao]   = useState("");
  const [chaveInterativo, setChaveInterativo] = useState(0);

  const { calcular, resultado, carregando, erro: erroApi, limpar } = useTrapezio();

  function validarEntrada() {
    if (!funcao.trim())          return "Informe a função f(x).";
    const a = parseFloat(valA), b = parseFloat(valB), n = parseInt(valN);
    if (isNaN(a) || isNaN(b))    return "Informe os limites a e b.";
    if (a >= b)                  return "O valor de a deve ser menor que b.";
    if (isNaN(n) || n < 1)       return "n deve ser um inteiro ≥ 1.";
    return null;
  }

  async function handleCalcular() {
    limpar();
    setErroValidacao("");
    const msg = validarEntrada();
    if (msg) { setErroValidacao(msg); return; }
    await calcular({ funcao, a: parseFloat(valA), b: parseFloat(valB), n: parseInt(valN) });
    setChaveInterativo(k => k + 1);
  }

  const erroExibido = erroValidacao || erroApi;

  return (
    <div style={{ padding: 24, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 4 }}>Regra dos Trapézios Composta</h2>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.6 }}>
        Aproxima ∫f(x)dx por uma soma de trapézios de largura uniforme h = (b−a)/n.<br/>
        I ≈ (h/2) × [f(x₀) + 2f(x₁) + ... + 2f(xₙ₋₁) + f(xₙ)]
      </p>

      {/* Função f(x) com KaTeX */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>
          Função f(x)
        </label>
        <div style={{ display: "flex", alignItems: "start", gap: 10, background: "#f8f8fc", border: "1px solid #ddd", borderRadius: 8, padding: "8px 12px", maxWidth: 640 }}>
          <div style={{ flexShrink: 0, fontSize: 14, color: "#3c3489", borderRight: "1px solid #ddd", paddingRight: 10, whiteSpace: "nowrap" }}>
            <FuncaoLatex funcao={funcao}/>
          </div>
          <input type="text" value={funcao}
            onChange={e => { setFuncao(e.target.value); limpar(); }}
            placeholder="ex: sin(x), x**2, exp(x)"
            style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14, fontFamily: "monospace", color: "#333" }}
          />
        </div>
        <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
          Use <code>**</code> para potência, <code>sin</code>, <code>cos</code>, <code>sqrt</code>, <code>log</code> (natural), <code>exp</code>, <code>pi</code>.
        </p>
      </div>

      {/* Campos a, b, n */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20, maxWidth: 500 }}>
        <CampoNumerico label="Limite inferior a" value={valA} onChange={v => { setValA(v); limpar(); }} placeholder="ex: 0"/>
        <CampoNumerico label="Limite superior b" value={valB} onChange={v => { setValB(v); limpar(); }} placeholder="ex: 3.14"/>
        <CampoNumerico label="Subintervalos n" value={valN} onChange={v => { setValN(v); limpar(); }} placeholder="ex: 4" step="1" min="1"/>
      </div>

      {/* Botão + seletor de modo */}
      <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 665, alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
        <button onClick={handleCalcular} disabled={carregando}
          style={{ background: carregando ? "#9b98c9" : "#3c3489", color: "#fff", border: "none", borderRadius: 7, padding: "9px 22px", fontSize: 14, fontWeight: 600, cursor: carregando ? "not-allowed" : "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8 }}>
          {carregando ? (
            <>
              <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
              Calculando…
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </>
          ) : "Calcular"}
        </button>

        <div style={{ width: 1, height: 28, background: "#ddd", flexShrink: 0 }}/>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#666", marginRight: 6 }}>Detalhamento:</span>
          {MODOS.map(({ value, label }) => (
            <label key={value} style={{
              display: "flex", alignItems: "center", gap: 4, fontSize: 13, cursor: "pointer",
              padding: "5px 10px", borderRadius: 6, userSelect: "none", transition: "all 0.15s",
              color:      modo === value ? "#3c3489" : "#555",
              fontWeight: modo === value ? 600 : 400,
              background: modo === value ? "#eeedfe" : "transparent",
              border:     modo === value ? "1px solid #c5c2f0" : "1px solid transparent",
            }}>
              <input type="radio" name="modoTrapezio" value={value} checked={modo === value}
                onChange={e => setModo(e.target.value)}
                style={{ accentColor: "#3c3489", margin: 0 }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Erro */}
      {erroExibido && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "#fff0f0", border: "1px solid #f5c2c2", color: "#a00", fontSize: 13, maxWidth: 640 }}>
          {erroExibido}
        </div>
      )}

      {/* Resultados */}
      {resultado && modo === "basico"        && <ResultadoBasico resultado={resultado}/>}
      {resultado && modo === "intermediario" && <ResultadoIntermediario resultado={resultado}/>}
      {resultado && modo === "avancado"      && <ResultadoAvancado resultado={resultado}/>}
      {resultado && modo === "interativo"    && (
        <TrapezioInterativo key={chaveInterativo} dadosBE={resultado}/>
      )}
    </div>
  );
}
