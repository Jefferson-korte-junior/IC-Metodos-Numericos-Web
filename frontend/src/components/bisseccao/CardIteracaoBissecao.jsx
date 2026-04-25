// CardIteracaoBissecao.jsx
// Coloque este arquivo em: frontend/src/components/CardIteracaoBissecao.jsx
//
// Dependências necessárias:
//   npm install react-chartjs-2 chart.js katex
//
// Uso:
//   import CardIteracaoBissecao from './components/CardIteracaoBissecao'
//   <CardIteracaoBissecao
//     iteracoes={resposta.iteracoes}
//     funcao="x**2 - 4"
//     nivelDetalhe="basico" | "intermediario" | "completo"
//   />

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import katex from "katex";
import "katex/dist/katex.min.css";

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
  const delta = Math.max((iter.b - iter.a) * 0.3, 0.3);
  const xMin = iter.a - delta;
  const xMax = iter.b + delta;

  const fVals = [iter.fa, iter.fb, iter.fm];
  const fMin = Math.min(...fVals);
  const fMax = Math.max(...fVals);
  const epsilon = Math.max(Math.abs(fMax - fMin) * 0.3, 0.3);
  const yMin = fMin - epsilon;
  const yMax = fMax + epsilon;

  const curva = gerarCurva(funcao, xMin, xMax);

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

// ── Painel de explicação matemática detalhada com LaTeX
function ExplicacaoMatematica({ iter }) {
  const { a, b, media, fa, fb, fm, substituiu } = iter;

  const textoSubstituicao =
    substituiu === "a"
      ? `f(a) e f(média) têm o mesmo sinal: Trocamos a pela média.`
      : `f(b) e f(média) têm o mesmo sinal: Trocamos b pela média.`;
  const mesmoSinalComA = Math.sign(fa) === Math.sign(fm);
  const corA = corPonto(fa);
  const corB = corPonto(fb);
  const corM = COR_MID;

  return (
    <div
      style={{
        marginTop: "1rem",
        background: "linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)",
        border: "0.5px solid rgba(60,52,137,0.15)",
        borderRadius: 10,
        padding: "1rem 1.25rem",
      }}
    >
      {/* Título */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#3c3489",
          marginBottom: "0.85rem",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        Análise Detalhada da Iteração
      </div>

      {/* Bloco 1: Cálculo da média */}
      <BlocoLatex titulo="1. Cálculo do ponto médio">
        <LinhaLatex
          formula={`m = \\frac{a + b}{2} = \\frac{${a.toFixed(5)} + ${b.toFixed(5)}}{2} = ${media.toFixed(6)}`}
        />
      </BlocoLatex>

      {/* Bloco 2: Avaliação dos sinais */}
      <BlocoLatex titulo="2. Avaliação dos sinais">
        <LinhaLatex
          formula={`f(a) = f(${a.toFixed(5)}) = ${fa.toFixed(6)} \\quad \\Rightarrow \\quad ${fa < 0 ? "f(a) < 0" : "f(a) > 0"}`}
          cor={corA}
        />
        <LinhaLatex
          formula={`f(b) = f(${b.toFixed(5)}) = ${fb.toFixed(6)} \\quad \\Rightarrow \\quad ${fb < 0 ? "f(b) < 0" : "f(b) > 0"}`}
          cor={corB}
        />
        <LinhaLatex
          formula={`f(m) = f(${media.toFixed(5)}) = ${fm.toFixed(6)} \\quad \\Rightarrow \\quad ${fm < 0 ? "f(m) < 0" : "f(m) > 0"}`}
          cor={corM}
        />
      </BlocoLatex>

      {/* Bloco 3: Verificação do Teorema de Bolzano */}
      <BlocoLatex titulo="3. Verificação (Teorema de Bolzano)">
        {mesmoSinalComA ? (
          <>
            <LinhaLatex
              formula={`f(a) \\cdot f(m) = (${fa.toFixed(4)}) \\cdot (${fm.toFixed(4)}) = ${(fa * fm).toFixed(6)} > 0`}
            />
            <LinhaLatex
              formula={`\\text{f(m) e f(a) têm o mesmo sinal} \\Rightarrow \\text{Substituímos a pela media m}`}
            />

            <LinhaLatex
              formula={`\\Rightarrow \\text{raiz em } [m,\\, b] = [${media.toFixed(5)},\\, ${b.toFixed(5)}]`}
            />
          </>
        ) : (
          <>
            <LinhaLatex
              formula={`f(m) \\cdot f(b) = (${fm.toFixed(4)}) \\cdot (${fb.toFixed(4)}) = ${(fm * fb).toFixed(6)} > 0`}
            />
            <LinhaLatex
              formula={`\\text{f(m) e f(b) têm o mesmo sinal} \\Rightarrow \\text{Substituímos a pela media m}`}
            />

            <LinhaLatex
              formula={`\\Rightarrow \\text{raiz em } [a,\\, m] = [${a.toFixed(5)},\\, ${media.toFixed(5)}]`}
            />
          </>
        )}
      </BlocoLatex>

      {/* Bloco 4: Atualização do intervalo */}
      <BlocoLatex titulo="4. Atualização do intervalo">
        {substituiu === "a" ? (
          <LinhaLatex
            formula={`a \\leftarrow m = ${media.toFixed(6)}, \\quad b \\text{ permanece } = ${b.toFixed(6)}`}
          />
        ) : (
          <LinhaLatex
            formula={`b \\leftarrow m = ${media.toFixed(6)}, \\quad a \\text{ permanece } = ${a.toFixed(6)}`}
          />
        )}
      </BlocoLatex>

      {/* Bloco 5: Tamanho do intervalo */}
      <BlocoLatex titulo="5. Redução do intervalo">
        <LinhaLatex
          formula={`|b - a| = |${b.toFixed(5)} - ${a.toFixed(5)}| = ${Math.abs(b - a).toFixed(6)}`}
        />
        <LinhaLatex
          formula={`\\text{Próximo intervalo: } \\frac{|b-a|}{2} = \\frac{${Math.abs(b - a).toFixed(6)}}{2} = ${(Math.abs(b - a) / 2).toFixed(6)}`}
        />
        <LinhaLatex
          formula={`\\text{Taxa de convergência: } \\mathcal{O}\\!\\left(\\frac{1}{2^n}\\right)`}
        />
      </BlocoLatex>
    </div>
  );
}

// ── Sub-componentes auxiliares para o painel LaTeX

function BlocoLatex({ titulo, children }) {
  return (
    <div style={{ marginBottom: "0.85rem" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#666",
          marginBottom: "0.35rem",
          letterSpacing: "0.02em",
        }}
      >
        {titulo}
      </div>
      <div
        style={{
          background: "#fff",
          borderRadius: 7,
          padding: "0.55rem 0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          border: "0.5px solid rgba(0,0,0,0.07)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function LinhaLatex({ formula, cor }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      katex.render(formula, ref.current, {
        throwOnError: false,
        displayMode: true,
      });
    }
  }, [formula]);
  return (
    <div
      ref={ref}
      style={{
        fontSize: 13,
        color: cor || "#222",
        overflowX: "auto",
      }}
    />
  );
}

// ── Card de uma iteração
// nivelDetalhe: "basico" | "intermediario" | "completo"
function CardIteracao({ iter, funcao, index, nivelDetalhe }) {
  const { a, b, media, fa, fb, fm, substituiu } = iter;

  const textoSubstituicao =
    substituiu === "a"
      ? `f(a) e f(média) têm o mesmo sinal: Trocamos a pela média.`
      : `f(b) e f(média) têm o mesmo sinal: Trocamos b pela média.`;

  const mostrarGrafico = nivelDetalhe === "intermediario" || nivelDetalhe === "completo";
  const mostrarExplicacao = nivelDetalhe === "completo";

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
          Iteração {index + 1}
        </span>
        <span style={{ fontSize: 12, color: "#888" }}>
          |f(média)| = {Math.abs(fm).toFixed(6)}
        </span>
      </div>

      {/* Layout: só info (básico) ou info + gráfico (intermediário/completo) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: mostrarGrafico ? "1fr 1fr" : "1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Coluna esquerda: pontos */}
        <div>
          <LinhaPonto rotulo="a" valor={a} fval={fa} cor={corPonto(fa)} />
          <LinhaPonto rotulo="b" valor={b} fval={fb} cor={corPonto(fb)} />

          <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.1)", margin: "8px 0" }} />

          <LinhaPonto
            rotulo="média"
            valor={media}
            fval={fm}
            cor={COR_MID}
            forma="triangle"
          />

          <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.1)", margin: "8px 0" }} />

          <p style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>
            {textoSubstituicao}
          </p>
        </div>

        {/* Coluna direita: gráfico — apenas intermediário e completo */}
        {mostrarGrafico && (
          <GraficoIteracao iter={iter} funcao={funcao} />
        )}
      </div>

      {/* Explicação matemática detalhada com LaTeX — apenas completo */}
      {mostrarExplicacao && (
        <ExplicacaoMatematica iter={iter} />
      )}
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
// Props:
//   iteracoes: array de objetos { a, b, media, fa, fb, fm, substituiu }
//   funcao: string da função (ex: "x**2 - 4")
//   nivelDetalhe: "basico" | "intermediario" | "completo"  (default: "basico")
export default function CardIteracaoBissecao({
  iteracoes = [],
  funcao = "",
  nivelDetalhe = "basico",
}) {
  if (!iteracoes.length) return null;

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <Legenda />
      {iteracoes.map((iter, idx) => (
        <CardIteracao
          key={idx}
          iter={iter}
          funcao={funcao}
          index={idx}
          nivelDetalhe={nivelDetalhe}
        />
      ))}
    </div>
  );
}
