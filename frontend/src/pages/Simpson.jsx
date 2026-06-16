import React, { useState, useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  Chart as ChartJS, LinearScale, PointElement, LineElement, Filler, Tooltip,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import { useSimpson } from "../hooks/useSimpson";
import SimpsonInterativo from "../components/integrais/SimpsonInterativo";

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

function CampoNumerico({ label, value, onChange, placeholder, step = "any" }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>{label}</label>
      <input type="number" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} step={step}
        style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, background: "#f8f8fc", outline: "none", fontSize: 14, fontFamily: "monospace", color: "#333", padding: "8px 12px", boxSizing: "border-box" }}
      />
    </div>
  );
}

// ── Gráfico dos pontos com cores por peso ─────────────────────────────────────
function GraficoSimpson({ pontos }) {
  function pesoColor(peso) {
    if (peso === 1) return "#0d9488";
    if (peso === 4) return "#7c3aed";
    return "#2563eb";
  }
  const data = {
    datasets: [
      {
        data: pontos.map(p => ({ x: p.xi, y: p.fi })),
        backgroundColor: "transparent",
        borderColor: "#7c3aed",
        showLine: true,
        fill: { target: "origin", above: "rgba(124,58,237,0.08)" },
        tension: 0,
        pointRadius: 0,
      },
      {
        data: pontos.map(p => ({ x: p.xi, y: p.fi })),
        backgroundColor: pontos.map(p => pesoColor(p.peso) + "cc"),
        borderColor: pontos.map(p => pesoColor(p.peso)),
        showLine: false,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
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
    <div>
      <div style={{ height: 220, position: "relative", marginTop: 16 }}>
        <Scatter data={data} options={options}/>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "#555" }}>
        {[["#0d9488","Peso 1 (extremos)"],["#7c3aed","Peso 4 (ímpares)"],["#2563eb","Peso 2 (pares int.)"]].map(([cor, lab]) => (
          <div key={lab} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: cor }}/>
            {lab}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Modos de exibição ─────────────────────────────────────────────────────────
function ResultadoBasico({ resultado }) {
  const { resultado: I, h, n, a, b } = resultado;
  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 10, padding: "20px 24px", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", marginBottom: 8 }}>Resultado</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#5b21b6", fontFamily: "monospace", marginBottom: 4 }}>{fmtS(I, 8)}</div>
        <div style={{ fontSize: 13, color: "#a78bfa" }}>∫f(x)dx ≈ {fmtS(I, 8)}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "h (passo)", value: fmtS(h, 6), cor: "#3c3489" },
          { label: "n subintervalos", value: n, cor: "#7c3aed" },
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
  function pesoTipo(p) { return p === 1 ? "extremo" : p === 4 ? "ímpar" : "par int."; }
  function pesoColor(p) { return p === 1 ? "#0d9488" : p === 4 ? "#7c3aed" : "#2563eb"; }
  return (
    <div style={{ maxWidth: 720 }}>
      <ResultadoBasico resultado={resultado}/>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Tabela de Avaliação
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f3ff" }}>
                {["i","xᵢ","f(xᵢ)","peso","tipo","peso·f(xᵢ)"].map(h_ => (
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
                  <td style={{ padding: "6px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "center", color: pesoColor(p.peso), fontWeight: 700 }}>{p.peso}</td>
                  <td style={{ padding: "6px 14px", fontSize: 11, textAlign: "center", color: "#888" }}>{pesoTipo(p.peso)}</td>
                  <td style={{ padding: "6px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "right", color: "#3c3489" }}>{fmtS(p.fi * p.peso, 6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 16, background: "#f8f8fc", border: "1px solid #e0e0f0", borderRadius: 8, padding: "12px 16px", fontFamily: "monospace", fontSize: 13, color: "#7c3aed" }}>
        I ≈ (h/3) × Σ = ({fmtS(h,4)}/3) × {fmtS(soma_ponderada,6)} = <strong>{fmtS(I,8)}</strong>
      </div>

      <GraficoSimpson pontos={pontos}/>
    </div>
  );
}

function ResultadoAvancado({ resultado }) {
  const { resultado: I, h, n, pontos, soma_ponderada, a, b } = resultado;
  const somaExtremos  = pontos.filter(p => p.peso === 1).reduce((s, p) => s + p.fi, 0);
  const somaImpares   = pontos.filter(p => p.peso === 4).reduce((s, p) => s + p.fi, 0);
  const somaPareInt   = pontos.filter(p => p.peso === 2).reduce((s, p) => s + p.fi, 0);
  const strExtremos   = pontos.filter(p => p.peso === 1).map(p => fmtS(p.fi, 4)).join(" + ");
  const strImpares    = pontos.filter(p => p.peso === 4).map(p => fmtS(p.fi, 4)).join(" + ");
  const strParesInt   = pontos.filter(p => p.peso === 2).map(p => fmtS(p.fi, 4)).join(" + ");

  function pesoColor(p) { return p === 1 ? "#0d9488" : p === 4 ? "#7c3aed" : "#2563eb"; }
  function pesoTipo(p)  { return p === 1 ? "extremo" : p === 4 ? "ímpar" : "par int."; }

  return (
    <div style={{ maxWidth: 760 }}>
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
          {strImpares && (
            <div><span style={{ color: "#7c3aed" }}>Ímpares (peso 4):</span> 4 × ({strImpares}) = {fmtS(4 * somaImpares, 6)}</div>
          )}
          {strParesInt && (
            <div><span style={{ color: "#2563eb" }}>Pares internos (peso 2):</span> 2 × ({strParesInt}) = {fmtS(2 * somaPareInt, 6)}</div>
          )}
          <div style={{ borderTop: "1px solid #eee", marginTop: 6, paddingTop: 6 }}>
            Σ = {fmtS(somaExtremos,4)} + {fmtS(4*somaImpares,4)}{strParesInt ? ` + ${fmtS(2*somaPareInt,4)}` : ""} = <strong>{fmtS(soma_ponderada,6)}</strong>
          </div>
          <div>
            I = (h/3) × Σ = ({fmtS(h,6)}/3) × {fmtS(soma_ponderada,6)} = <strong style={{ color: "#7c3aed" }}>{fmtS(I,8)}</strong>
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
              <tr style={{ background: "#f5f3ff" }}>
                {["i","xᵢ","f(xᵢ)","peso","tipo","peso·f(xᵢ)","contrib. %"].map(h_ => (
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
                    <td style={{ padding: "6px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "center", color: pesoColor(p.peso), fontWeight: 700 }}>{p.peso}</td>
                    <td style={{ padding: "6px 14px", fontSize: 11, textAlign: "center", color: "#888" }}>{pesoTipo(p.peso)}</td>
                    <td style={{ padding: "6px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "right", color: "#3c3489" }}>{fmtS(p.fi * p.peso, 6)}</td>
                    <td style={{ padding: "6px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "right", color: "#888" }}>{fmtS(Math.abs(contrib), 1)}%</td>
                  </tr>
                );
              })}
              <tr style={{ background: "#f5f3ff", fontWeight: 700 }}>
                <td colSpan={5} style={{ padding: "7px 14px", textAlign: "right", color: "#7c3aed", fontSize: 13 }}>Σ ponderada:</td>
                <td style={{ padding: "7px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "right", color: "#7c3aed" }}>{fmtS(soma_ponderada, 6)}</td>
                <td style={{ padding: "7px 14px", fontSize: 13, fontFamily: "monospace", textAlign: "right", color: "#888" }}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 16, background: "#f8f8fc", border: "1px solid #e0e0f0", borderRadius: 8, padding: "12px 16px", fontFamily: "monospace", fontSize: 13, color: "#7c3aed" }}>
        I ≈ ({fmtS(h,6)}/3) × {fmtS(soma_ponderada,6)} = <strong>{fmtS(I,8)}</strong>
      </div>

      <GraficoSimpson pontos={pontos}/>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Simpson() {
  const [modo,            setModo]            = useState("basico");
  const [funcao,          setFuncao]          = useState("sin(x)");
  const [valA,            setValA]            = useState("0");
  const [valB,            setValB]            = useState("3.14159265");
  const [valN,            setValN]            = useState("4");
  const [erroValidacao,   setErroValidacao]   = useState("");
  const [chaveInterativo, setChaveInterativo] = useState(0);

  const { calcular, resultado, carregando, erro: erroApi, limpar } = useSimpson();

  function validarEntrada() {
    if (!funcao.trim())          return "Informe a função f(x).";
    const a = parseFloat(valA), b = parseFloat(valB), n = parseInt(valN);
    if (isNaN(a) || isNaN(b))    return "Informe os limites a e b.";
    if (a >= b)                  return "O valor de a deve ser menor que b.";
    if (isNaN(n) || n < 2)       return "n deve ser ≥ 2.";
    if (n % 2 !== 0)             return "n deve ser par para a Regra de Simpson 1/3.";
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
  const N_OPCOES = [2, 4, 6, 8, 10];

  return (
    <div style={{ padding: 24, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 4 }}>Regra de Simpson 1/3 Composta</h2>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.6 }}>
        Ajusta parábolas a cada par de subintervalos — pesos 1, 4, 2, 4, ..., 4, 1 (n deve ser par).<br/>
        I ≈ (h/3) × [f(x₀) + 4f(x₁) + 2f(x₂) + ... + 4f(xₙ₋₁) + f(xₙ)]
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

      {/* Campos a e b */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16, maxWidth: 340 }}>
        <CampoNumerico label="Limite inferior a" value={valA} onChange={v => { setValA(v); limpar(); }} placeholder="ex: 0"/>
        <CampoNumerico label="Limite superior b" value={valB} onChange={v => { setValB(v); limpar(); }} placeholder="ex: 3.14"/>
      </div>

      {/* Seletor de n (apenas pares) */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#444", marginRight: 10 }}>
          Subintervalos n:
        </span>
        <span style={{ fontSize: 12, color: "#aaa", marginRight: 10 }}>(deve ser par)</span>
        {N_OPCOES.map(op => (
          <button key={op} onClick={() => { setValN(String(op)); limpar(); }}
            style={{
              marginRight: 6, padding: "5px 13px", borderRadius: 6, cursor: "pointer",
              fontSize: 13,
              border:      Number(valN) === op ? "2px solid #3c3489" : "1px solid #ccc",
              background:  Number(valN) === op ? "#eeedfe" : "#fff",
              color:       Number(valN) === op ? "#3c3489" : "#555",
              fontWeight:  Number(valN) === op ? 700 : 400,
            }}>
            {op}
          </button>
        ))}
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
              <input type="radio" name="modoSimpson" value={value} checked={modo === value}
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
        <SimpsonInterativo key={chaveInterativo} dadosBE={resultado}/>
      )}
    </div>
  );
}
