import { useState } from "react";
import {
  Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import {
  calcularBissecao, calcularNewton, calcularSecante,
  calcularJacobi, calcularGaussSeidel,
  calcularTrapezio, calcularSimpson,
  calcularLagrange, calcularNewtonInterpolacao,
} from "../api/metodosNumericos";
import { gerarCurva } from "../utils/avaliarFuncao";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

// ─── Paleta de cores por método ──────────────────────────────────────────────
const CORES = {
  "Bisseção":             { borda: "#3c3489", fundo: "#3c348920" },
  "Newton":               { borda: "#16a34a", fundo: "#16a34a20" },
  "Secante":              { borda: "#dc6432", fundo: "#dc643220" },
  "Jacobi":               { borda: "#2563eb", fundo: "#2563eb20" },
  "Gauss-Seidel":         { borda: "#7c3aed", fundo: "#7c3aed20" },
  "Trapézio":             { borda: "#0d9488", fundo: "#0d948820" },
  "Simpson":              { borda: "#7c3aed", fundo: "#7c3aed20" },
  "Lagrange":             { borda: "#db2777", fundo: "#db277720" },
  "Newton Interpolação":  { borda: "#ea580c", fundo: "#ea580c20" },
};

const SUB_VAR = ["₁","₂","₃","₄","₅","₆","₇","₈","₉","₁₀"];

// ─── Gera sistema exemplo para Sistemas Lineares ──────────────────────────────
function gerarExemploSistema(n) {
  const A = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (i === j)             return 2 * n;
      if (Math.abs(i - j) === 1) return -1;
      return 0;
    })
  );
  const b  = A.map(row => row.reduce((s, v) => s + v, 0));
  const x0 = Array(n).fill(0);
  return { A, b, x0 };
}

// ─── Definições das comparações ───────────────────────────────────────────────
const COMPARACOES = [
  { tipo: "zeros",         label: "Zero de Funções",     short: "Zeros"        },
  { tipo: "interpolacao",  label: "Interpolação",         short: "Interpolação" },
  { tipo: "integrais",     label: "Integrais Numéricas",  short: "Integrais"    },
  { tipo: "sistemas",      label: "Sistemas Lineares",    short: "Sistemas"     },
];

// ─── Componentes de entrada ───────────────────────────────────────────────────
function Campo({ label, value, onChange, placeholder, type = "text", step = "any" }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "7px 10px", border: "1px solid #ddd", borderRadius: 7,
          fontSize: 13, fontFamily: "monospace", background: "#f8f8fc",
          outline: "none", color: "#333",
        }}
      />
    </div>
  );
}

// ─── Card de resultado de um método ──────────────────────────────────────────
function CardResultado({ metodo, resultado, erro, carregando, melhor }) {
  const cor = CORES[metodo] ?? { borda: "#5c54c8", fundo: "#5c54c820" };

  return (
    <div style={{
      flex: 1, minWidth: 0,
      border: `2px solid ${melhor ? cor.borda : "rgba(197,194,240,0.4)"}`,
      borderRadius: 14,
      background: melhor ? cor.fundo : "#fff",
      padding: "16px 18px",
      position: "relative",
      transition: "all 0.2s ease",
      boxShadow: melhor ? `0 4px 16px ${cor.borda}22` : "0 2px 8px rgba(0,0,0,0.04)",
    }}>
      {/* Badge "Mais rápido" */}
      {melhor && (
        <div style={{
          position: "absolute", top: -10, right: 12,
          background: cor.borda, color: "#fff",
          fontSize: 10, fontWeight: 700, borderRadius: 20,
          padding: "2px 10px", letterSpacing: "0.05em",
        }}>
          ★ MAIS RÁPIDO
        </div>
      )}

      <div style={{
        fontSize: 14, fontWeight: 700, color: cor.borda,
        marginBottom: 12, fontFamily: "'Inter', sans-serif",
      }}>
        {metodo}
      </div>

      {carregando && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#888", fontSize: 13 }}>
          <span style={{
            display: "inline-block", width: 14, height: 14,
            border: "2px solid #ddd", borderTopColor: cor.borda,
            borderRadius: "50%", animation: "spin 0.7s linear infinite",
          }}/>
          Calculando…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {erro && !carregando && (
        <div style={{ fontSize: 12, color: "#a00", background: "#fff0f0", border: "1px solid #f5c2c2", borderRadius: 7, padding: "8px 12px" }}>
          {erro}
        </div>
      )}

      {resultado && !carregando && !erro && <ConteudoResultado metodo={metodo} resultado={resultado} cor={cor} />}

      {!resultado && !carregando && !erro && (
        <div style={{ fontSize: 12, color: "#bbb", fontStyle: "italic" }}>Aguardando cálculo…</div>
      )}
    </div>
  );
}

function ConteudoResultado({ metodo, resultado, cor }) {
  const isZero   = ["Bisseção","Newton","Secante"].includes(metodo);
  const isInteg  = ["Trapézio","Simpson"].includes(metodo);
  const isSist   = ["Jacobi","Gauss-Seidel"].includes(metodo);
  const isInterp = ["Lagrange","Newton Interpolação"].includes(metodo);

  if (isZero) {
    const iters = resultado.iteracoes ?? [];
    const erroFinal = iters.length > 0 ? iters[iters.length - 1].erro : null;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Metrica label="Raiz" valor={`${Number(resultado.raiz).toFixed(8)}`} cor={cor.borda} grande />
        <Metrica label="Iterações" valor={iters.length} cor="#444" />
        {erroFinal !== null && (
          <Metrica label="Erro final" valor={Number(erroFinal).toExponential(3)} cor="#666" />
        )}
      </div>
    );
  }
  if (isInterp) {
    const termos = resultado.termos ?? [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Metrica label={`P(${Number(resultado.x_avaliado).toFixed(3)})`} valor={Number(resultado.resultado).toFixed(8)} cor={cor.borda} grande />
        <Metrica label="Grau do polinômio" valor={resultado.grau} cor="#444" />
        <Metrica label="Termos calculados" valor={termos.length} cor="#666" />
      </div>
    );
  }
  if (isInteg) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Metrica label="Integral" valor={Number(resultado.resultado).toFixed(8)} cor={cor.borda} grande />
        <Metrica label="h (passo)" valor={Number(resultado.h).toFixed(6)} cor="#444" />
        <Metrica label="n subinterv." valor={resultado.n} cor="#666" />
      </div>
    );
  }
  if (isSist) {
    const sol = resultado.resultado ?? [];
    const iters = resultado.iteracoes ?? [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Metrica label="Iterações" valor={iters.length} cor={cor.borda} grande />
        <div style={{ fontSize: 11, color: "#666", fontFamily: "monospace", lineHeight: 1.7 }}>
          {sol.slice(0, 5).map((v, i) => (
            <div key={i}>x{SUB_VAR[i]} = <strong style={{ color: cor.borda }}>{Number(v).toFixed(6)}</strong></div>
          ))}
          {sol.length > 5 && <div style={{ color: "#aaa" }}>… (+{sol.length - 5} vars)</div>}
        </div>
      </div>
    );
  }
  return null;
}

function Metrica({ label, valor, cor, grande }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{
        fontSize: grande ? 16 : 13, fontWeight: grande ? 700 : 600,
        color: cor, fontFamily: "monospace",
      }}>
        {valor}
      </div>
    </div>
  );
}

// ─── Avaliadores JS de interpolação ──────────────────────────────────────────
function lagrangeJS(xs, ys, x) {
  const n = xs.length;
  let result = 0;
  for (let i = 0; i < n; i++) {
    let li = 1;
    for (let j = 0; j < n; j++) {
      if (j !== i) li *= (x - xs[j]) / (xs[i] - xs[j]);
    }
    result += ys[i] * li;
  }
  return result;
}

function newtonPolyJS(coefs, xs, x) {
  const n = coefs.length;
  let result = coefs[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    result = result * (x - xs[i]) + coefs[i];
  }
  return result;
}

// ─── Gráfico combinado de Interpolação ───────────────────────────────────────
function GraficoInterpolacaoCombinado({ pontos, xEval, resultados }) {
  if (!pontos || pontos.length < 2) return null;
  const lag  = resultados["Lagrange"];
  const newt = resultados["Newton Interpolação"];
  if (!lag && !newt) return null;

  const xs = pontos.map(p => parseFloat(p[0])).filter(Number.isFinite);
  const ys = pontos.map(p => parseFloat(p[1])).filter(Number.isFinite);
  if (xs.length < 2) return null;

  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const margem = Math.max((xMax - xMin) * 0.15, 0.5);
  const xL = xMin - margem, xR = xMax + margem;

  const N = 300;
  const curveLag = [], curveNewt = [];
  for (let i = 0; i <= N; i++) {
    const x = xL + (i / N) * (xR - xL);
    if (lag && !lag.erro) {
      const y = lagrangeJS(xs, ys, x);
      if (Number.isFinite(y)) curveLag.push({ x, y });
    }
    if (newt && !newt.erro && newt.coeficientes) {
      const y = newtonPolyJS(newt.coeficientes, xs, x);
      if (Number.isFinite(y)) curveNewt.push({ x, y });
    }
  }

  const datasets = [
    curveLag.length > 0 && {
      label: "P(x) — Lagrange",
      data: curveLag,
      borderColor: CORES["Lagrange"].borda,
      backgroundColor: "transparent",
      showLine: true, pointRadius: 0, borderWidth: 2.5, tension: 0, order: 5,
    },
    curveNewt.length > 0 && {
      label: "P(x) — Newton",
      data: curveNewt,
      borderColor: CORES["Newton Interpolação"].borda,
      backgroundColor: "transparent",
      showLine: true, pointRadius: 0, borderWidth: 1.5,
      borderDash: [6, 3], tension: 0, order: 6,
    },
    {
      label: "Pontos dados",
      data: xs.map((x, i) => ({ x, y: ys[i] })),
      backgroundColor: "#1a1a2e",
      borderColor: "#1a1a2e",
      pointRadius: 6, showLine: false, order: 2,
    },
    Number.isFinite(xEval) && (lag || newt) && {
      label: `P(${xEval.toFixed(3)})`,
      data: [{ x: xEval, y: lag?.resultado ?? newt?.resultado }],
      backgroundColor: "#dc2626",
      borderColor: "#dc2626",
      pointRadius: 9, pointStyle: "star", showLine: false, order: 1,
    },
  ].filter(Boolean);

  const allY = [...curveLag, ...curveNewt].map(p => p.y).filter(Number.isFinite);
  const yMin = allY.length ? Math.min(...allY) : -1;
  const yMax = allY.length ? Math.max(...allY) : 1;
  const yMarg = Math.max((yMax - yMin) * 0.15, 0.5);

  const options = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
    plugins: {
      legend: { display: true, position: "top", labels: { boxWidth: 10, font: { size: 11 }, padding: 8 } },
      tooltip: { callbacks: { label: ctx => `x=${ctx.raw.x?.toFixed(4)}, y=${ctx.raw.y?.toFixed(6)}` } },
    },
    scales: {
      x: { type: "linear", min: xL, max: xR, title: { display: true, text: "x" }, grid: { color: "#f0f0f0" } },
      y: { type: "linear", min: yMin - yMarg, max: yMax + yMarg, title: { display: true, text: "P(x)" }, grid: { color: "#f0f0f0" } },
    },
  };

  return (
    <GraficoWrapper titulo="Polinômio Interpolador Comparado">
      <Scatter data={{ datasets }} options={options} />
    </GraficoWrapper>
  );
}

// ─── Gráfico combinado de Zero de Funções ────────────────────────────────────
function GraficoZerosCombinado({ funcao, resultados }) {
  if (!funcao) return null;
  const metodos = Object.entries(resultados).filter(([, r]) => r?.iteracoes);
  if (metodos.length === 0) return null;

  // Range: coleta todos os x das iterações de todos os métodos
  const todosX = metodos.flatMap(([m, r]) => {
    if (m === "Bisseção") return r.iteracoes.map(it => it.media);
    return r.iteracoes.flatMap(it => [it.x, it.x_novo].filter(Number.isFinite));
  }).filter(Number.isFinite);
  if (todosX.length === 0) return null;

  const xMin = Math.min(...todosX);
  const xMax = Math.max(...todosX);
  const margem = Math.max((xMax - xMin) * 0.2, 0.5);
  const xL = xMin - margem, xR = xMax + margem;

  const curva = gerarCurva(funcao, xL, xR, 300);
  if (curva.length < 2) return null;

  const ys = curva.map(p => p.y).filter(Number.isFinite);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const yMarg = Math.max((yMax - yMin) * 0.15, 0.5);

  const datasets = [
    {
      label: "f(x)",
      data: curva,
      borderColor: "#c5c2f0",
      backgroundColor: "transparent",
      showLine: true, pointRadius: 0, borderWidth: 2, tension: 0, order: 10,
    },
    { label: "y = 0", data: [{ x: xL, y: 0 }, { x: xR, y: 0 }],
      borderColor: "rgba(100,100,100,0.3)", borderWidth: 1, borderDash: [5, 4],
      showLine: true, pointRadius: 0, backgroundColor: "transparent", order: 11 },
    ...metodos.map(([m, r]) => {
      const cor = CORES[m]?.borda ?? "#888";
      let pts;
      if (m === "Bisseção") pts = r.iteracoes.map(it => ({ x: it.media, y: it.fm }));
      else pts = r.iteracoes.map(it => ({ x: it.x, y: it.fx })).filter(p => Number.isFinite(p.y));
      return {
        label: m,
        data: pts,
        backgroundColor: cor + "bb",
        borderColor: cor,
        showLine: true,
        pointRadius: 4,
        borderWidth: 1.5,
        tension: 0,
        order: 1,
      };
    }),
    ...metodos.map(([m, r]) => ({
      label: `Raiz (${m})`,
      data: [{ x: r.raiz, y: 0 }],
      backgroundColor: CORES[m]?.borda ?? "#888",
      borderColor: CORES[m]?.borda ?? "#888",
      pointRadius: 9, pointStyle: "star", showLine: false, order: 0,
    })),
  ];

  const options = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
    plugins: {
      legend: { display: true, position: "top", labels: { boxWidth: 10, font: { size: 11 }, padding: 8 } },
      tooltip: { callbacks: { label: ctx => `x=${ctx.raw.x?.toFixed(5)}, f(x)=${ctx.raw.y?.toFixed(5)}` } },
    },
    scales: {
      x: { type: "linear", min: xL, max: xR, title: { display: true, text: "x" }, grid: { color: "#f0f0f0" } },
      y: { type: "linear", min: yMin - yMarg, max: yMax + yMarg, title: { display: true, text: "f(x)" }, grid: { color: "#f0f0f0" } },
    },
  };

  return (
    <GraficoWrapper titulo="Curva f(x) e Convergência Comparada">
      <Scatter data={{ datasets }} options={options} />
    </GraficoWrapper>
  );
}

// ─── Gráfico de convergência de sistemas lineares ─────────────────────────────
function GraficoSistemasCombinado({ resultados, n }) {
  const metodos = Object.entries(resultados).filter(([, r]) => r?.iteracoes?.length > 0);
  if (metodos.length === 0) return null;

  // Para cada variável, uma linha por método com estilo diferente
  const ESTILOS = [[1, []], [1, [5, 3]]]; // sólido, tracejado
  const datasets = metodos.flatMap(([m, r], mi) => {
    const cor = CORES[m]?.borda ?? "#888";
    const [borderWidth, borderDash] = ESTILOS[mi] ?? [1, []];
    return Array.from({ length: Math.min(n, 4) }, (_, vi) => ({
      label: `${m} x${SUB_VAR[vi]}`,
      data: r.iteracoes.map((it, idx) => ({ x: idx + 1, y: it.valores[vi] })),
      borderColor: cor,
      backgroundColor: cor + "22",
      showLine: true,
      pointRadius: 2,
      borderWidth,
      borderDash,
      tension: 0.2,
      fill: false,
    }));
  });

  const options = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
    plugins: {
      legend: { display: true, position: "top", labels: { boxWidth: 10, font: { size: 11 }, padding: 8 } },
      tooltip: { callbacks: { title: ctx => `Iteração ${ctx[0].raw.x}`, label: ctx => `${ctx.dataset.label} = ${ctx.raw.y.toFixed(6)}` } },
    },
    scales: {
      x: { type: "linear", title: { display: true, text: "Iteração" }, grid: { color: "#f0f0f0" } },
      y: { type: "linear", title: { display: true, text: "Valor"    }, grid: { color: "#f0f0f0" } },
    },
  };

  return (
    <GraficoWrapper titulo="Convergência Comparada">
      <Scatter data={{ datasets }} options={options} />
    </GraficoWrapper>
  );
}

// ─── Wrapper do gráfico ───────────────────────────────────────────────────────
function GraficoWrapper({ titulo, children }) {
  return (
    <div style={{
      marginTop: 24, background: "#fff",
      border: "1px solid rgba(197,194,240,0.4)", borderRadius: 12, padding: "16px 18px",
    }}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: "#5c54c8",
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12,
      }}>
        {titulo}
      </div>
      <div style={{ height: 280, position: "relative" }}>{children}</div>
    </div>
  );
}

// ─── Painel de inputs: Zero de Funções ───────────────────────────────────────
function InputsZeros({ state, set, onCalcular, carregando }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Campo label="Função f(x)" value={state.funcao} onChange={v => set("funcao", v)} placeholder="ex: x**3 - x - 2" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <Campo label="a" value={state.a} onChange={v => set("a", v)} type="number" placeholder="ex: 1" />
        <Campo label="b" value={state.b} onChange={v => set("b", v)} type="number" placeholder="ex: 2" />
        <Campo label="Tolerância" value={state.tol} onChange={v => set("tol", v)} type="number" placeholder="ex: 0.0001" step="0.00001" />
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>
        Bisseção e Secante usam a e b diretamente · Newton usa x₀ = (a+b)/2
      </p>
      <BotaoComparar onClick={onCalcular} carregando={carregando} />
    </div>
  );
}

// ─── Painel de inputs: Interpolação ─────────────────────────────────────────
function InputsInterpolacao({ pontos, setPontos, numPontos, setNumPontos, xEval, setXEval, onCalcular, carregando }) {
  const SUB = ["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉"];

  function setPonto(i, col, v) {
    setPontos(prev => prev.map((p, pi) => pi === i ? (col === 0 ? [v, p[1]] : [p[0], v]) : p));
  }

  function mudar(n) {
    setNumPontos(n);
    const exemplo = Array.from({ length: n }, (_, i) => [String(i + 1), String((i + 1) ** 2)]);
    const xMid    = String(((1 + n) / 2).toFixed(1));
    setPontos(exemplo);
    setXEval(xMid);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Número de pontos:</span>
        {[2,3,4,5,6].map(n => (
          <button key={n} onClick={() => mudar(n)}
            style={{
              padding: "3px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12,
              border: numPontos === n ? "2px solid #3c3489" : "1px solid #ccc",
              background: numPontos === n ? "#eeedfe" : "#fff",
              color: numPontos === n ? "#3c3489" : "#555", fontWeight: numPontos === n ? 700 : 400,
            }}>
            {n}
          </button>
        ))}
        <span style={{ fontSize: 11, color: "#aaa" }}>(grau {numPontos - 1})</span>
      </div>

      {/* Tabela de pontos */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0fc" }}>
              {["i", "xᵢ", "yᵢ"].map(h => (
                <th key={h} style={{ padding: "6px 10px", fontSize: 11, color: "#3c3489", fontWeight: 600, borderBottom: "2px solid #c5c2f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pontos.map((p, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f8fc" }}>
                <td style={{ padding: "4px 10px", fontSize: 12, color: "#888", fontFamily: "monospace", textAlign: "center" }}>{i}</td>
                <td style={{ padding: "4px 6px" }}>
                  <input type="number" value={p[0]} onChange={e => setPonto(i, 0, e.target.value)}
                    placeholder={`x${SUB[i]}`}
                    style={{ width: 80, padding: "5px 6px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "monospace", background: "#f8f8fc", outline: "none", textAlign: "center" }} />
                </td>
                <td style={{ padding: "4px 6px" }}>
                  <input type="number" value={p[1]} onChange={e => setPonto(i, 1, e.target.value)}
                    placeholder={`y${SUB[i]}`}
                    style={{ width: 80, padding: "5px 6px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12, fontFamily: "monospace", background: "#f8f8fc", outline: "none", textAlign: "center" }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* x para interpolar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>P(</span>
        <input type="number" value={xEval} onChange={e => setXEval(e.target.value)}
          placeholder="x"
          style={{ width: 100, padding: "6px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, fontFamily: "monospace", background: "#f8f8fc", outline: "none" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>)</span>
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>
        Exemplo padrão: f(x) = x² nos pontos x = 1, 2, …, n · Ambos os métodos produzem o mesmo polinômio
      </p>
      <BotaoComparar onClick={onCalcular} carregando={carregando} />
    </div>
  );
}

// ─── Painel de inputs: Integrais ─────────────────────────────────────────────
function InputsIntegrais({ state, set, onCalcular, carregando }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Campo label="Função f(x)" value={state.funcao} onChange={v => set("funcao", v)} placeholder="ex: sin(x)" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <Campo label="a (limite inf.)" value={state.a} onChange={v => set("a", v)} type="number" placeholder="ex: 0" />
        <Campo label="b (limite sup.)" value={state.b} onChange={v => set("b", v)} type="number" placeholder="ex: 3.14" />
        <Campo label="n (subintervalos par)" value={state.n} onChange={v => set("n", v)} type="number" placeholder="ex: 4" step="2" />
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>
        n deve ser par para o Simpson funcionar corretamente
      </p>
      <BotaoComparar onClick={onCalcular} carregando={carregando} />
    </div>
  );
}

// ─── Painel de inputs: Sistemas Lineares ─────────────────────────────────────
function InputsSistemas({ state, set, onCalcular, carregando, tamanho, setTamanho }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Tamanho:</span>
        {[2,3,4,5].map(n => (
          <button key={n} onClick={() => setTamanho(n)}
            style={{
              padding: "3px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12,
              border: tamanho === n ? "2px solid #3c3489" : "1px solid #ccc",
              background: tamanho === n ? "#eeedfe" : "#fff",
              color: tamanho === n ? "#3c3489" : "#555", fontWeight: tamanho === n ? 700 : 400,
            }}>
            {n}×{n}
          </button>
        ))}
        <span style={{ fontSize: 11, color: "#aaa" }}>(exemplo diagonal-dominante)</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Campo label="Tolerância" value={state.tol} onChange={v => set("tol", v)} type="number" placeholder="ex: 0.001" step="0.0001" />
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>
        O sistema é gerado automaticamente com solução x = [1,1,…,1]. Chute inicial: zeros.
      </p>
      <BotaoComparar onClick={onCalcular} carregando={carregando} />
    </div>
  );
}

function BotaoComparar({ onClick, carregando }) {
  return (
    <button onClick={onClick} disabled={carregando} style={{
      alignSelf: "flex-start",
      background: carregando ? "#9b98c9" : "#3c3489", color: "#fff",
      border: "none", borderRadius: 8, padding: "9px 22px",
      fontSize: 14, fontWeight: 600, cursor: carregando ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {carregando ? (
        <>
          <span style={{ display: "inline-block", width: 13, height: 13, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
          Comparando…
        </>
      ) : "⟷ Comparar"}
    </button>
  );
}

// ─── Comparador de iterações ──────────────────────────────────────────────────
function VencedorBadge({ metodos, resultados }) {
  const com = metodos.filter(m => resultados[m] && !resultados[m]?.erro);
  if (com.length < 2) return null;

  const iters = metodos.filter(m => resultados[m]?.iteracoes)
    .map(m => ({ m, n: resultados[m].iteracoes.length }))
    .sort((a, b) => a.n - b.n);

  if (iters.length < 2 || iters[0].n === iters[1].n) return null;

  const vencedor = iters[0].m;
  const cor = CORES[vencedor]?.borda ?? "#5c54c8";
  return (
    <div style={{
      marginBottom: 12, padding: "10px 16px", borderRadius: 10,
      background: cor + "12", border: `1px solid ${cor}40`,
      fontSize: 13, color: cor, fontWeight: 600,
    }}>
      ★ {vencedor} convergiu mais rápido ({iters[0].n} vs {iters[1].n} iterações)
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Comparacao({ tipoInicial }) {
  const [tipo, setTipo] = useState(tipoInicial ?? "zeros");

  // Inputs Zero de Funções
  const [zeros, setZerosRaw] = useState({ funcao: "x**3 - x - 2", a: "1", b: "2", tol: "0.0001" });
  function setZeros(k, v) { setZerosRaw(prev => ({ ...prev, [k]: v })); }

  // Inputs Interpolação
  const [numPontos,  setNumPontos]  = useState(3);
  const [pontosInterp, setPontosInterp] = useState(() =>
    Array.from({ length: 3 }, (_, i) => [String(i + 1), String((i + 1) ** 2)])
  );
  const [xEvalInterp, setXEvalInterp] = useState("2.0");

  // Inputs Integrais
  const [integrais, setIntegraisRaw] = useState({ funcao: "sin(x)", a: "0", b: "3.14159265", n: "4" });
  function setIntegrais(k, v) { setIntegraisRaw(prev => ({ ...prev, [k]: v })); }

  // Inputs Sistemas Lineares
  const [sistemas, setSistemasRaw] = useState({ tol: "0.001" });
  function setSistemas(k, v) { setSistemasRaw(prev => ({ ...prev, [k]: v })); }
  const [tamanhoSist, setTamanhoSistRaw] = useState(3);

  function setTamanhoSist(n) {
    setTamanhoSistRaw(n);
    setResultados({});
  }

  // Resultados: { [metodo]: {dado} | {erro} }
  const [resultados, setResultados] = useState({});
  const [carregando, setCarregando] = useState(false);

  // ── Comparar ────────────────────────────────────────────────────────────────
  async function comparar() {
    setCarregando(true);
    setResultados({});

    try {
      if (tipo === "zeros") {
        const a = parseFloat(zeros.a), b = parseFloat(zeros.b);
        const tol = parseFloat(zeros.tol);
        const [rBis, rNew, rSec] = await Promise.allSettled([
          calcularBissecao({ funcao: zeros.funcao, a, b, criterio: tol }),
          calcularNewton({ funcao: zeros.funcao, x0: (a + b) / 2, tolerancia: tol }),
          calcularSecante({ funcao: zeros.funcao, x0: a, x1: b, tolerancia: tol }),
        ]);
        setResultados({
          "Bisseção": rBis.status === "fulfilled" ? rBis.value : { erro: rBis.reason?.message },
          "Newton":   rNew.status === "fulfilled" ? rNew.value : { erro: rNew.reason?.message },
          "Secante":  rSec.status === "fulfilled" ? rSec.value : { erro: rSec.reason?.message },
        });
      }

      if (tipo === "interpolacao") {
        const pts = pontosInterp
          .map(p => [parseFloat(p[0]), parseFloat(p[1])])
          .filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]));
        const x_eval = parseFloat(xEvalInterp);
        const [rL, rN] = await Promise.allSettled([
          calcularLagrange({ pontos: pts, x_eval }),
          calcularNewtonInterpolacao({ pontos: pts, x_eval }),
        ]);
        setResultados({
          "Lagrange":            rL.status === "fulfilled" ? rL.value : { erro: rL.reason?.message },
          "Newton Interpolação": rN.status === "fulfilled" ? rN.value : { erro: rN.reason?.message },
        });
      }

      if (tipo === "integrais") {
        const n = parseInt(integrais.n);
        const nPar = n % 2 === 0 ? n : n + 1;
        const [rT, rS] = await Promise.allSettled([
          calcularTrapezio({ funcao: integrais.funcao, a: parseFloat(integrais.a), b: parseFloat(integrais.b), n }),
          calcularSimpson({ funcao: integrais.funcao, a: parseFloat(integrais.a), b: parseFloat(integrais.b), n: nPar }),
        ]);
        setResultados({
          "Trapézio": rT.status === "fulfilled" ? rT.value : { erro: rT.reason?.message },
          "Simpson":  rS.status === "fulfilled" ? rS.value : { erro: rS.reason?.message },
        });
      }

      if (tipo === "sistemas") {
        const { A, b, x0 } = gerarExemploSistema(tamanhoSist);
        const tol = parseFloat(sistemas.tol);
        const [rJ, rG] = await Promise.allSettled([
          calcularJacobi({ A, b, chute: x0, tolerancia: tol }),
          calcularGaussSeidel({ A, b, chute: x0, tolerancia: tol }),
        ]);
        setResultados({
          "Jacobi":       rJ.status === "fulfilled" ? rJ.value : { erro: rJ.reason?.message },
          "Gauss-Seidel": rG.status === "fulfilled" ? rG.value : { erro: rG.reason?.message },
        });
      }
    } finally {
      setCarregando(false);
    }
  }

  // ── Reset quando muda de tipo ─────────────────────────────────────────────
  function mudarTipo(t) {
    setTipo(t);
    setResultados({});
  }

  // ── Metodos e resultados do tipo atual ─────────────────────────────────────
  const metodosAtivos = {
    zeros:        ["Bisseção", "Newton", "Secante"],
    interpolacao: ["Lagrange", "Newton Interpolação"],
    integrais:    ["Trapézio", "Simpson"],
    sistemas:     ["Jacobi", "Gauss-Seidel"],
  }[tipo];

  const melhorMetodo = (() => {
    const com = metodosAtivos.filter(m => resultados[m]?.iteracoes);
    if (com.length < 2) return null;
    return com.reduce((best, m) =>
      resultados[m].iteracoes.length < (resultados[best]?.iteracoes?.length ?? Infinity) ? m : best
    , null);
  })();

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>

      {/* Cabeçalho */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "#1a1a2e", letterSpacing: "-0.02em" }}>
          Comparação de Métodos
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "#888", lineHeight: 1.5 }}>
          Execute múltiplos métodos com os mesmos parâmetros e compare os resultados lado a lado.
        </p>
      </div>

      {/* Tabs de tipo */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 20,
        borderBottom: "2px solid #eee", paddingBottom: 0,
      }}>
        {COMPARACOES.map(c => (
          <button
            key={c.tipo}
            onClick={() => mudarTipo(c.tipo)}
            style={{
              padding: "8px 16px", border: "none", background: "none",
              cursor: "pointer", fontSize: 13, fontWeight: tipo === c.tipo ? 700 : 500,
              color: tipo === c.tipo ? "#3c3489" : "#666",
              borderBottom: tipo === c.tipo ? "2px solid #3c3489" : "2px solid transparent",
              marginBottom: -2, transition: "all 0.15s ease",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Card de inputs */}
      <div style={{
        background: "#fff", border: "1px solid rgba(197,194,240,0.4)",
        borderRadius: 14, padding: "18px 20px", marginBottom: 20,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: "#5c54c8",
          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14,
        }}>
          Parâmetros Compartilhados
        </div>

        {tipo === "zeros" && (
          <InputsZeros state={zeros} set={setZeros} onCalcular={comparar} carregando={carregando} />
        )}
        {tipo === "interpolacao" && (
          <InputsInterpolacao
            pontos={pontosInterp} setPontos={setPontosInterp}
            numPontos={numPontos} setNumPontos={setNumPontos}
            xEval={xEvalInterp} setXEval={setXEvalInterp}
            onCalcular={comparar} carregando={carregando}
          />
        )}
        {tipo === "integrais" && (
          <InputsIntegrais state={integrais} set={setIntegrais} onCalcular={comparar} carregando={carregando} />
        )}
        {tipo === "sistemas" && (
          <InputsSistemas
            state={sistemas} set={setSistemas} onCalcular={comparar}
            carregando={carregando} tamanho={tamanhoSist} setTamanho={setTamanhoSist}
          />
        )}
      </div>

      {/* Banner de vencedor */}
      {Object.keys(resultados).length > 0 && (
        <VencedorBadge metodos={metodosAtivos} resultados={resultados} />
      )}

      {/* Cards de resultado side-by-side */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {metodosAtivos.map(m => (
          <CardResultado
            key={m}
            metodo={m}
            resultado={resultados[m]?.erro ? null : resultados[m]}
            erro={resultados[m]?.erro}
            carregando={carregando && !resultados[m]}
            melhor={melhorMetodo === m}
          />
        ))}
      </div>

      {/* Gráfico combinado */}
      {tipo === "zeros" && Object.keys(resultados).some(m => resultados[m]?.iteracoes) && (
        <GraficoZerosCombinado funcao={zeros.funcao} resultados={resultados} />
      )}
      {tipo === "interpolacao" && Object.keys(resultados).some(m => resultados[m]?.resultado !== undefined) && (
        <GraficoInterpolacaoCombinado
          pontos={pontosInterp}
          xEval={parseFloat(xEvalInterp)}
          resultados={resultados}
        />
      )}
      {tipo === "sistemas" && Object.keys(resultados).some(m => resultados[m]?.iteracoes) && (
        <GraficoSistemasCombinado resultados={resultados} n={tamanhoSist} />
      )}
      {tipo === "integrais" && resultados["Trapézio"] && resultados["Simpson"] && (
        <div style={{
          marginTop: 24, background: "#fff",
          border: "1px solid rgba(197,194,240,0.4)", borderRadius: 12, padding: "16px 18px",
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: "#5c54c8",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12,
          }}>
            Comparação dos Resultados
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Trapézio", "Simpson"].map(m => resultados[m] && !resultados[m].erro && (
              <div key={m}>
                <div style={{ fontSize: 11, color: "#999", marginBottom: 2 }}>{m}</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: CORES[m]?.borda }}>
                  {Number(resultados[m].resultado).toFixed(10)}
                </div>
              </div>
            ))}
            {resultados["Trapézio"] && !resultados["Trapézio"].erro &&
             resultados["Simpson"]  && !resultados["Simpson"].erro  && (
              <div>
                <div style={{ fontSize: 11, color: "#999", marginBottom: 2 }}>Diferença |T − S|</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: "#dc6432" }}>
                  {Math.abs(resultados["Trapézio"].resultado - resultados["Simpson"].resultado).toExponential(4)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
