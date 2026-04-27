// CardIteracaoBissecao.jsx
// Coloque este arquivo em: frontend/src/components/CardIteracaoBissecao.jsx
//
// Dependência necessária:
//   npm install react-chartjs-2 chart.js
//
// Uso:
//   import CardIteracaoBissecao from './components/CardIteracaoBissecao'
//   <CardIteracaoBissecao iteracoes={resposta.iteracoes} funcao="x**2 - 4" />

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip);

// ── Avalia f(x) a partir da string (suporta x**2, x^2, sin, cos, etc.)
function avaliarFuncao(exprStr, xVal) {
  try {
    const expr = exprStr
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

// ── Gera pontos da curva f(x) entre xMin e xMax
function gerarCurva(funcao, xMin, xMax, n = 120) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const x = xMin + ((xMax - xMin) * i) / n;
    const y = avaliarFuncao(funcao, x);
    if (isFinite(y)) pts.push({ x, y });
  }
  return pts;
}

// ── Cores por sinal
const COR_NEG = "#1a6bbf";   // azul — sinal negativo
const COR_POS = "#c0420f";   // laranja — sinal positivo
const COR_MID = "#2e7d32";   // verde — média
const COR_CURVA = "#aaaaaa";

function corPonto(fval) {
  return fval < 0 ? COR_NEG : COR_POS;
}

// ── Plugin: linha y=0 em destaque
const pluginLinhaZero = {
  id: "linhaZero",
  beforeDraw(chart) {
    const { ctx, scales } = chart;
    if (!scales.y) return;
    const y0 = scales.y.getPixelForValue(0);
    const xLeft = scales.x.left;
    const xRight = scales.x.right;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xLeft, y0);
    ctx.lineTo(xRight, y0);
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.stroke();
    ctx.restore();
  },
};

// ── Mini gráfico de uma iteração
function GraficoIteracao({ iter, funcao }) {
  // Zoom em x: centralizado na média, intervalo (a-delta, b+delta)
  const delta = Math.max((iter.b - iter.a) * 0.3, 0.3);
  const xMin = iter.a - delta;
  const xMax = iter.b + delta;

  // Zoom em y: baseado nos valores reais de f(a) e f(b)
  const fVals = [iter.fa, iter.fb, iter.fm];
  const fMin = Math.min(...fVals);
  const fMax = Math.max(...fVals);
  const epsilon = Math.max(Math.abs(fMax - fMin) * 0.3, 0.3);
  const yMin = fMin - epsilon;
  const yMax = fMax + epsilon;

  const curva = gerarCurva(funcao, xMin, xMax);

  // Garante que a média fique centralizada horizontalmente
  const xCenter = iter.media;

  const data = {
    datasets: [
      {
        label: "f(x)",
        data: curva,
        type: "line",
        borderColor: COR_CURVA,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3,
        fill: false,
      },
      {
        label: "a",
        data: [{ x: iter.a, y: iter.fa }],
        backgroundColor: corPonto(iter.fa),
        pointRadius: 6,
        pointHoverRadius: 7,
      },
      {
        label: "b",
        data: [{ x: iter.b, y: iter.fb }],
        backgroundColor: corPonto(iter.fb),
        pointRadius: 6,
        pointHoverRadius: 7,
      },
      {
        label: "média",
        data: [{ x: iter.media, y: iter.fm }],
        backgroundColor: COR_MID,
        pointRadius: 9,
        pointHoverRadius: 10,
        pointStyle: "triangle",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: (${ctx.parsed.x.toFixed(4)}, ${ctx.parsed.y.toFixed(4)})`,
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        min: xMin,
        max: xMax,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { font: { size: 10 }, maxTicksLimit: 5 },
      },
      y: {
        min: yMin,
        max: yMax,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { font: { size: 10 }, maxTicksLimit: 5 },
      },
    },
  };

  return (
    <div style={{ height: 160, width: "100%" }}>
      <Scatter data={data} options={options} plugins={[pluginLinhaZero]} />
    </div>
  );
}

// ── Badge de sinal
function BadgeSinal({ valor }) {
  const neg = valor < 0;
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 4,
        background: neg ? "#deeafb" : "#fbe8df",
        color: neg ? "#0c447c" : "#6b2008",
        marginLeft: "auto",
      }}
    >
      {valor >= 0 ? "+" : ""}
      {valor.toFixed(5)}
    </span>
  );
}

// ── Linha de ponto (a, b ou média)
function LinhaPonto({ rotulo, valor, fval, cor, forma = "circle" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
      }}
    >
      {/* indicador visual */}
      <div
        style={{
          width: forma === "triangle" ? 0 : 10,
          height: forma === "triangle" ? 0 : 10,
          borderRadius: forma === "circle" ? "50%" : 2,
          background: forma !== "triangle" ? cor : "transparent",
          borderLeft: forma === "triangle" ? "5px solid transparent" : undefined,
          borderRight: forma === "triangle" ? "5px solid transparent" : undefined,
          borderBottom: forma === "triangle" ? `10px solid ${cor}` : undefined,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 13, fontWeight: 500, minWidth: 80 }}>
        {rotulo} = <span style={{ color: "#555" }}>{valor.toFixed(5)}</span>
      </span>
      <BadgeSinal valor={fval} />
    </div>
  );
}

// ── Card de uma iteração
function CardIteracao({ iter, funcao, index }) {
  const { a, b, media, fa, fb, fm, substituiu } = iter;

  const textoSubstituicao =
    substituiu === "a"
      ? `f(a) e f(média) tem o mesmo sinal: Trocamos a pela média.`
      : `f(b) e f(média) tem o mesmo sinal: Trocamos b pela média.`;

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid rgba(0,0,0,0.12)",
        borderRadius: 12,
        padding: "1.1rem 1.25rem",
        marginBottom: "1rem",
      }}
    >
      {/* Cabeçalho */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.9rem" }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            background: "#eeedfe",
            color: "#3c3489",
            padding: "3px 10px",
            borderRadius: 6,
          }}
        >
          Iteração {index}
        </span>
        <span style={{ fontSize: 12, color: "#888" }}>
          |f(média)| = {Math.abs(fm).toFixed(6)}
        </span>
      </div>

      {/* Grid: info + gráfico */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Coluna esquerda: pontos */}
        <div>
          <LinhaPonto rotulo="a" valor={a} fval={fa} cor={corPonto(fa)} />
          <LinhaPonto rotulo="b" valor={b} fval={fb} cor={corPonto(fb)} />

          <div
            style={{
              borderTop: "0.5px solid rgba(0,0,0,0.1)",
              margin: "8px 0",
            }}
          />

          <LinhaPonto
            rotulo="média"
            valor={media}
            fval={fm}
            cor={COR_MID}
            forma="triangle"
          />

          <div
            style={{
              borderTop: "0.5px solid rgba(0,0,0,0.1)",
              margin: "8px 0",
            }}
          />

          {/* Ação */}
          <p style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>
            {textoSubstituicao}
          </p>
        </div>

        {/* Coluna direita: gráfico */}
        <GraficoIteracao iter={iter} funcao={funcao} />
      </div>
    </div>
  );
}

// ── Legenda global
function Legenda() {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: "0.75rem", flexWrap: "wrap" }}>
      {[
        { cor: COR_NEG, label: "sinal negativo" },
        { cor: COR_POS, label: "sinal positivo" },
        { cor: COR_MID, label: "média (ponto testado)" },
      ].map(({ cor, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: cor }} />
          <span style={{ fontSize: 12, color: "#666" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Componente principal exportado
export default function CardIteracaoBissecao({ iteracoes = [], funcao = "" }) {
  if (!iteracoes.length) return null;

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <Legenda />
      {iteracoes.map((iter, idx) => (
        <CardIteracao key={idx} iter={iter} funcao={funcao} index={idx} />
      ))}
    </div>
  );
}
