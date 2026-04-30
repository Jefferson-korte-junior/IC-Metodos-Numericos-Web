// components/bisseccao/CardIteracaoBissecao.jsx
//
// Props:
//   iteracoes    : array de iterações vindas do backend
//   funcao       : string da função (usado apenas para o gráfico)
//   nivelDetalhe : "basico" | "intermediario" | "completo"
//
// ── O que cada nível exibe ──────────────────────────────────────────────────
//   basico        → caixa de resultado final apenas (raiz aproximada + nº iters)
//   intermediario → tabela resumida + gráfico da última iteração
//   completo      → card detalhado de CADA iteração com gráfico próprio

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip);

// ─── Paleta ──────────────────────────────────────────────────────────────────
const COR_NEG   = "#1a6bbf";
const COR_POS   = "#c0420f";
const COR_MID   = "#2e7d32";
const COR_CURVA = "#aaaaaa";

function corPonto(fval) { return fval < 0 ? COR_NEG : COR_POS; }

// ─── Plugin linha y=0 ────────────────────────────────────────────────────────
const pluginLinhaZero = {
  id: "linhaZero",
  beforeDraw(chart) {
    const { ctx, scales } = chart;
    if (!scales.y) return;
    const y0     = scales.y.getPixelForValue(0);
    const xLeft  = scales.x.left;
    const xRight = scales.x.right;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xLeft, y0);
    ctx.lineTo(xRight, y0);
    ctx.strokeStyle = "rgba(0,0,0,0.30)";
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([6, 3]);
    ctx.stroke();
    ctx.restore();
  },
};

// ─── Mini gráfico Scatter ────────────────────────────────────────────────────
// Recebe uma iteração; todos os valores já vêm do backend — sem avaliarFuncao.
function GraficoIteracao({ iter }) {
  const { a, b, media, fa, fb, fm } = iter;

  const delta = Math.max((b - a) * 0.3, 0.3);
  const xMin  = a - delta;
  const xMax  = b + delta;

  const fVals   = [fa, fb, fm];
  const fMin    = Math.min(...fVals);
  const fMax    = Math.max(...fVals);
  const eps     = Math.max(Math.abs(fMax - fMin) * 0.35, 0.4);
  const yMin    = fMin - eps;
  const yMax    = fMax + eps;

  const data = {
    datasets: [
      {
        label: "a",
        data:  [{ x: a,     y: fa }],
        backgroundColor: corPonto(fa),
        pointRadius: 6, pointHoverRadius: 7,
      },
      {
        label: "b",
        data:  [{ x: b,     y: fb }],
        backgroundColor: corPonto(fb),
        pointRadius: 6, pointHoverRadius: 7,
      },
      {
        label: "média",
        data:  [{ x: media, y: fm }],
        backgroundColor:  COR_MID,
        pointRadius: 9,   pointHoverRadius: 10,
        pointStyle: "triangle",
        pointBorderColor: "#fff", pointBorderWidth: 2,
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
      x: { type:"linear", min:xMin, max:xMax, grid:{ color:"rgba(0,0,0,0.06)" }, ticks:{ font:{ size:10 }, maxTicksLimit:5 } },
      y: { min:yMin,      max:yMax,            grid:{ color:"rgba(0,0,0,0.06)" }, ticks:{ font:{ size:10 }, maxTicksLimit:5 } },
    },
  };

  return (
    <div style={{ height: 160, width: "100%" }}>
      <Scatter data={data} options={options} plugins={[pluginLinhaZero]} />
    </div>
  );
}

// ─── Componentes compartilhados ───────────────────────────────────────────────

function BadgeSinal({ valor }) {
  const neg = valor < 0;
  return (
    <span style={{
      fontSize:12, fontWeight:500, padding:"2px 8px", borderRadius:4,
      background: neg ? "#deeafb" : "#fbe8df",
      color:      neg ? "#0c447c" : "#6b2008",
      marginLeft: "auto",
    }}>
      {valor >= 0 ? "+" : ""}{valor.toFixed(5)}
    </span>
  );
}

function LinhaPonto({ rotulo, valor, fval, cor, forma = "circle" }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
      <div style={{
        width:  forma === "triangle" ? 0  : 10,
        height: forma === "triangle" ? 0  : 10,
        borderRadius: forma === "circle"   ? "50%" : 2,
        background:   forma !== "triangle" ? cor   : "transparent",
        borderLeft:   forma === "triangle" ? "5px solid transparent"    : undefined,
        borderRight:  forma === "triangle" ? "5px solid transparent"    : undefined,
        borderBottom: forma === "triangle" ? `10px solid ${cor}`        : undefined,
        flexShrink: 0,
      }} />
      <span style={{ fontSize:13, fontWeight:500, minWidth:80 }}>
        {rotulo} = <span style={{ color:"#555" }}>{valor.toFixed(5)}</span>
      </span>
      <BadgeSinal valor={fval} />
    </div>
  );
}

function Legenda() {
  return (
    <div style={{ display:"flex", gap:16, marginBottom:"0.75rem", flexWrap:"wrap" }}>
      {[
        { cor: COR_NEG, label: "sinal negativo" },
        { cor: COR_POS, label: "sinal positivo" },
        { cor: COR_MID, label: "média (ponto testado)" },
      ].map(({ cor, label }) => (
        <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:9, height:9, borderRadius:"50%", background:cor }} />
          <span style={{ fontSize:12, color:"#666" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NÍVEL BÁSICO
// Mostra apenas o resultado final: raiz aproximada + número de iterações.
// ═══════════════════════════════════════════════════════════════════════════════
function NivelBasico({ iteracoes }) {
  const ultima = iteracoes[iteracoes.length - 1];
  const raiz   = ultima.media;

  return (
    <div style={{
      marginTop: "1.5rem",
      background: "#f0fdf4",
      border: "1px solid #86efac",
      borderLeft: "4px solid #16a34a",
      borderRadius: 12,
      padding: "1.5rem 1.75rem",
      maxWidth: 480,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1rem" }}>
        <span style={{ fontSize:20 }}>✓</span>
        <span style={{ fontSize:14, fontWeight:700, color:"#15803d" }}>
          Raiz encontrada
        </span>
      </div>

      <div style={{ marginBottom:"0.75rem" }}>
        <span style={{ fontSize:13, color:"#555" }}>Raiz aproximada</span>
        <div style={{
          fontSize: 28, fontWeight: 700, color: "#166534",
          fontFamily: "monospace", marginTop: 2,
        }}>
          x ≈ {raiz.toFixed(6)}
        </div>
      </div>

      <div style={{
        display: "flex", gap: 24, marginTop: "1rem",
        borderTop: "1px solid #bbf7d0", paddingTop: "0.75rem",
      }}>
        <div>
          <div style={{ fontSize:11, color:"#888", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>
            Iterações realizadas
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:"#166534", fontFamily:"monospace" }}>
            {iteracoes.length}
          </div>
        </div>
        <div>
          <div style={{ fontSize:11, color:"#888", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>
            |f(raiz)|
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:"#166534", fontFamily:"monospace" }}>
            {Math.abs(ultima.fm).toExponential(2)}
          </div>
        </div>
        <div>
          <div style={{ fontSize:11, color:"#888", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>
            Intervalo final
          </div>
          <div style={{ fontSize:14, fontWeight:600, color:"#166534", fontFamily:"monospace" }}>
            [{ultima.a.toFixed(4)}, {ultima.b.toFixed(4)}]
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NÍVEL INTERMEDIÁRIO
// Tabela resumida com a, b, média e f(média) de cada iteração +
// gráfico da última iteração mostrando onde a raiz foi encontrada.
// ═══════════════════════════════════════════════════════════════════════════════
function NivelIntermediario({ iteracoes }) {
  const ultima = iteracoes[iteracoes.length - 1];

  return (
    <div style={{ marginTop: "1.5rem" }}>

      {/* Resumo final compacto */}
      <div style={{
        background: "#f0fdf4", border: "1px solid #86efac",
        borderLeft: "4px solid #16a34a", borderRadius: 10,
        padding: "1rem 1.25rem", marginBottom: "1.5rem",
        display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize:11, color:"#888", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>Raiz aproximada</div>
          <div style={{ fontSize:22, fontWeight:700, color:"#166534", fontFamily:"monospace" }}>
            x ≈ {ultima.media.toFixed(6)}
          </div>
        </div>
        <div>
          <div style={{ fontSize:11, color:"#888", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>Iterações</div>
          <div style={{ fontSize:22, fontWeight:700, color:"#166534", fontFamily:"monospace" }}>{iteracoes.length}</div>
        </div>
      </div>

      {/* Tabela de iterações */}
      <div style={{
        background: "#fff", border: "0.5px solid rgba(0,0,0,0.12)",
        borderRadius: 12, overflow: "hidden", marginBottom: "1.5rem",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "52px 1fr 1fr 1fr 1fr 90px",
          background: "#f5f5fb", borderBottom: "1px solid #e8e8f0",
          padding: "8px 16px",
        }}>
          {["Iter.", "a", "b", "Média", "f(média)", "Substituiu"].map((h) => (
            <span key={h} style={{ fontSize:11, fontWeight:700, color:"#555", textTransform:"uppercase", letterSpacing:0.4, fontFamily:"monospace" }}>
              {h}
            </span>
          ))}
        </div>

        {iteracoes.map((it, idx) => {
          const ehUltima = idx === iteracoes.length - 1;
          return (
            <div key={idx} style={{
              display: "grid",
              gridTemplateColumns: "52px 1fr 1fr 1fr 1fr 90px",
              padding: "9px 16px",
              background: ehUltima ? "#f0fdf4" : idx % 2 === 0 ? "#fff" : "#fafafa",
              borderBottom: ehUltima ? "none" : "0.5px solid rgba(0,0,0,0.06)",
              alignItems: "center",
            }}>
              <span style={{ fontSize:12, fontWeight:600, color:"#3c3489", fontFamily:"monospace" }}>
                {idx + 1}
              </span>
              <span style={{ fontSize:12, color:"#333", fontFamily:"monospace" }}>{it.a.toFixed(5)}</span>
              <span style={{ fontSize:12, color:"#333", fontFamily:"monospace" }}>{it.b.toFixed(5)}</span>
              <span style={{ fontSize:12, fontWeight:600, color:"#2e7d32", fontFamily:"monospace" }}>{it.media.toFixed(5)}</span>
              <span style={{
                fontSize:12, fontFamily:"monospace",
                color: Math.abs(it.fm) < 1e-4 ? "#16a34a" : it.fm < 0 ? COR_NEG : COR_POS,
                fontWeight: Math.abs(it.fm) < 1e-4 ? 700 : 400,
              }}>
                {it.fm.toFixed(6)}
              </span>
              <span style={{
                fontSize:11, fontWeight:600,
                background: it.substituiu === "a" ? "#eff6ff" : "#fff7ed",
                color:      it.substituiu === "a" ? "#1d4ed8" : "#c2410c",
                padding: "2px 8px", borderRadius: 4,
                display: "inline-block", textAlign: "center",
                fontFamily: "monospace",
              }}>
                {it.substituiu} ← média
              </span>
            </div>
          );
        })}
      </div>

      {/* Gráfico da última iteração */}
      <div style={{
        background: "#fff", border: "0.5px solid rgba(0,0,0,0.12)",
        borderRadius: 12, padding: "1rem 1.25rem",
      }}>
        <div style={{ fontSize:12, fontWeight:600, color:"#888", marginBottom:10, textTransform:"uppercase", letterSpacing:0.5 }}>
          Gráfico — última iteração (nº {iteracoes.length})
        </div>
        <Legenda />
        <GraficoIteracao iter={ultima} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NÍVEL COMPLETO
// Card detalhado por iteração: valores de a, b, média, f(a), f(b), f(média),
// decisão de substituição e gráfico individual.
// ═══════════════════════════════════════════════════════════════════════════════
function CardIteracaoCompleto({ iter, index }) {
  const { a, b, media, fa, fb, fm, substituiu } = iter;

  const textoSub = substituiu === "a"
    ? "f(a) e f(média) têm o mesmo sinal → substituímos a pela média."
    : "f(b) e f(média) têm o mesmo sinal → substituímos b pela média.";

  return (
    <div style={{
      background: "#fff",
      border: "0.5px solid rgba(0,0,0,0.12)",
      borderRadius: 12,
      padding: "1.1rem 1.25rem",
      marginBottom: "1rem",
    }}>
      {/* Cabeçalho */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"0.9rem" }}>
        <span style={{
          fontSize:12, fontWeight:500,
          background:"#eeedfe", color:"#3c3489",
          padding:"3px 10px", borderRadius:6,
        }}>
          Iteração {index + 1}
        </span>
        <span style={{ fontSize:12, color:"#888" }}>
          |f(média)| = {Math.abs(fm).toFixed(6)}
        </span>

        {/* Badge convergência */}
        {Math.abs(fm) < 1e-4 && (
          <span style={{
            fontSize:11, fontWeight:600, marginLeft:"auto",
            background:"#f0fdf4", color:"#16a34a",
            border:"1px solid #86efac", padding:"2px 8px", borderRadius:4,
          }}>
            ✓ convergiu
          </span>
        )}
      </div>

      {/* Grid: info + gráfico */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, alignItems:"start" }}>

        {/* Coluna esquerda */}
        <div>
          <LinhaPonto rotulo="a"     valor={a}     fval={fa} cor={corPonto(fa)} />
          <LinhaPonto rotulo="b"     valor={b}     fval={fb} cor={corPonto(fb)} />
          <div style={{ borderTop:"0.5px solid rgba(0,0,0,0.1)", margin:"8px 0" }} />
          <LinhaPonto rotulo="média" valor={media} fval={fm} cor={COR_MID} forma="triangle" />
          <div style={{ borderTop:"0.5px solid rgba(0,0,0,0.1)", margin:"8px 0" }} />

          {/* Decisão */}
          <div style={{
            background: substituiu === "a" ? "#eff6ff" : "#fff7ed",
            border:     `1px solid ${substituiu === "a" ? "#bfdbfe" : "#fed7aa"}`,
            borderRadius: 6, padding:"8px 10px",
          }}>
            <p style={{
              fontSize:12, color: substituiu === "a" ? "#1d4ed8" : "#c2410c",
              lineHeight:1.5, margin:0, fontWeight:500,
            }}>
              {textoSub}
            </p>
            <p style={{ fontSize:12, color:"#666", marginTop:4, marginBottom:0 }}>
              Novo intervalo: [{substituiu === "a" ? media.toFixed(5) : a.toFixed(5)}, {substituiu === "b" ? media.toFixed(5) : b.toFixed(5)}]
            </p>
          </div>
        </div>

        {/* Coluna direita: gráfico */}
        <GraficoIteracao iter={iter} />
      </div>
    </div>
  );
}

function NivelCompleto({ iteracoes }) {
  const ultima = iteracoes[iteracoes.length - 1];

  return (
    <div style={{ marginTop: "1.5rem" }}>
      {/* Banner de resultado */}
      <div style={{
        background: "#f0fdf4", border: "1px solid #86efac",
        borderLeft: "4px solid #16a34a", borderRadius: 10,
        padding: "1rem 1.25rem", marginBottom: "1.5rem",
        display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize:11, color:"#888", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>Raiz aproximada</div>
          <div style={{ fontSize:22, fontWeight:700, color:"#166534", fontFamily:"monospace" }}>
            x ≈ {ultima.media.toFixed(6)}
          </div>
        </div>
        <div>
          <div style={{ fontSize:11, color:"#888", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>Total de iterações</div>
          <div style={{ fontSize:22, fontWeight:700, color:"#166534", fontFamily:"monospace" }}>{iteracoes.length}</div>
        </div>
        <div>
          <div style={{ fontSize:11, color:"#888", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>Erro final |f(raiz)|</div>
          <div style={{ fontSize:22, fontWeight:700, color:"#166534", fontFamily:"monospace" }}>{Math.abs(ultima.fm).toExponential(2)}</div>
        </div>
      </div>

      <Legenda />

      {iteracoes.map((iter, idx) => (
        <CardIteracaoCompleto key={idx} iter={iter} index={idx} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL EXPORTADO
// ═══════════════════════════════════════════════════════════════════════════════
export default function CardIteracaoBissecao({
  iteracoes    = [],
  funcao       = "",
  nivelDetalhe = "basico",
}) {
  if (!iteracoes.length) return null;

  if (nivelDetalhe === "basico")        return <NivelBasico        iteracoes={iteracoes} />;
  if (nivelDetalhe === "intermediario") return <NivelIntermediario iteracoes={iteracoes} />;
  if (nivelDetalhe === "completo")      return <NivelCompleto      iteracoes={iteracoes} />;

  return null; // "interativo" é tratado em Bissecao.jsx diretamente
}
