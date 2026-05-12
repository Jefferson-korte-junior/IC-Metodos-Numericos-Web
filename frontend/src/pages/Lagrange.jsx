import { useState } from "react";
import { useLagrange } from "../hooks/useLagrange";
import LagrangeInterativo from "../components/interpolacao/LagrangeInterativo";

const MODOS = [
  { value: "basico",        label: "Básico"        },
  { value: "intermediario", label: "Intermediário"  },
  { value: "completo",      label: "Completo"       },
  { value: "interativo",    label: "Interativo"     },
];

const SUB = ["₀","₁","₂","₃","₄","₅"];

function gerarPontos(n) { return Array.from({ length: n }, () => ["", ""]); }

function fmt6(v) {
  if (v === null || v === undefined) return "-";
  return typeof v === "number" ? v.toFixed(6) : v;
}

function CelulaInput({ value, onChange, placeholder, largura = 80 }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: largura, padding: "6px 6px", textAlign: "center",
        border: "1px solid #ddd", borderRadius: 6, fontSize: 13,
        fontFamily: "monospace", background: "#f8f8fc", outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}

// ── Tabela de termos (Intermediário / Completo) ───────────────────────────────
function TabelaTermos({ termos, modo, x_eval }) {
  const exibir = (() => {
    if (modo === "completo" || termos.length <= 4) return termos;
    return [...termos.slice(0, 2), { _sep: true }, ...termos.slice(-2)];
  })();

  const tdS = { padding: "7px 10px", fontFamily: "monospace", fontSize: 13, color: "#333" };

  return (
    <div style={{ overflowX: "auto", marginTop: 14 }}>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
        {modo === "intermediario" ? "Primeiros e últimos termos" : `Todos os termos de Lagrange (n = ${termos.length})`}
      </p>
      <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
        <thead>
          <tr style={{ background: "#f0f0fc" }}>
            {["i", "xᵢ", "yᵢ", "Numerador", "Denominador", "Lᵢ(x)", "yᵢ · Lᵢ(x)"].map(h => (
              <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#3c3489", borderBottom: "2px solid #c5c2f0", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exibir.map((t, idx) =>
            t._sep ? (
              <tr key={`sep-${idx}`}>
                <td colSpan={7} style={{ textAlign: "center", padding: "4px", color: "#aaa" }}>⋮</td>
              </tr>
            ) : (
              <tr key={idx} style={{ background: idx % 2 === 0 ? "white" : "#f8f8fc" }}>
                <td style={tdS}>{t.i}</td>
                <td style={tdS}>{fmt6(t.xi)}</td>
                <td style={tdS}>{fmt6(t.yi)}</td>
                <td style={tdS}>{fmt6(t.numerador)}</td>
                <td style={tdS}>{fmt6(t.denominador)}</td>
                <td style={{ ...tdS, fontWeight: 600, color: "#3c3489" }}>{fmt6(t.Li)}</td>
                <td style={{ ...tdS, fontWeight: 600, color: "#1a7a4a" }}>{fmt6(t.termo)}</td>
              </tr>
            )
          )}
        </tbody>
        <tfoot>
          <tr style={{ background: "#e8e8f8", borderTop: "2px solid #c5c2f0" }}>
            <td colSpan={6} style={{ ...tdS, fontWeight: 700, color: "#3c3489", textAlign: "right" }}>
              P({fmt6(x_eval)}) =
            </td>
            <td style={{ ...tdS, fontWeight: 700, color: "#1a7a4a", fontSize: 14 }}>
              {fmt6(termos.reduce((s, t) => s + t.termo, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ── Resultado ─────────────────────────────────────────────────────────────────
function ResultadoLagrange({ resultado: res, modo }) {
  const termos    = res.termos ?? [];
  const resultado = res.resultado;
  const x_eval   = res.x_avaliado;
  const grau     = res.grau;

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ background: "#f0f0fc", border: "1px solid #c5c2f0", borderRadius: 10, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#3c3489", marginBottom: 10 }}>Resultado da Interpolação</div>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ fontSize: 15 }}>
            <span style={{ color: "#555" }}>P({fmt6(x_eval)}) =</span>{" "}
            <strong style={{ fontFamily: "monospace", color: "#3c3489", fontSize: 17 }}>{fmt6(resultado)}</strong>
          </div>
          <div style={{ fontSize: 13, color: "#666" }}>
            Grau do polinômio: <strong>{grau}</strong>
          </div>
          <div style={{ fontSize: 13, color: "#666" }}>
            Pontos usados: <strong>{termos.length}</strong>
          </div>
        </div>
      </div>

      {(modo === "intermediario" || modo === "completo") && termos.length > 0 && (
        <TabelaTermos termos={termos} modo={modo} x_eval={x_eval} />
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Lagrange() {
  const [numPontos, setNumPontos] = useState(3);
  const [pontos,    setPontos]    = useState(gerarPontos(3));
  const [xEval,     setXEval]     = useState("");
  const [modo,      setModo]      = useState("basico");
  const [erroVal,   setErroVal]   = useState("");
  const [chaveInt,  setChaveInt]  = useState(0);
  const [params,    setParams]    = useState(null);

  const { calcular, resultado, erro: erroApi, carregando, limpar } = useLagrange();

  function mudarNumPontos(n) {
    setNumPontos(n);
    setPontos(gerarPontos(n));
    limpar(); setErroVal("");
  }

  function setPonto(i, col, v) {
    setPontos(prev => prev.map((p, pi) => pi === i ? (col === 0 ? [v, p[1]] : [p[0], v]) : p));
  }

  function validar() {
    const xs = [];
    for (let i = 0; i < numPontos; i++) {
      if (pontos[i][0] === "" || isNaN(parseFloat(pontos[i][0])))
        return `Preencha x${SUB[i]}.`;
      if (pontos[i][1] === "" || isNaN(parseFloat(pontos[i][1])))
        return `Preencha y${SUB[i]}.`;
      const xi = parseFloat(pontos[i][0]);
      if (xs.includes(xi)) return `x${SUB[i]} = ${xi} está repetido. Os valores de x devem ser distintos.`;
      xs.push(xi);
    }
    if (xEval === "" || isNaN(parseFloat(xEval)))
      return "Informe o valor de x para interpolação.";
    return null;
  }

  async function handleCalcular() {
    limpar(); setErroVal("");
    const msg = validar();
    if (msg) { setErroVal(msg); return; }

    const pts    = pontos.map(p => [parseFloat(p[0]), parseFloat(p[1])]);
    const x_eval = parseFloat(xEval);
    setParams({ pontos: pts, x_eval });
    await calcular({ pontos: pts, x_eval });
    setChaveInt(k => k + 1);
  }

  const erroExibido = erroVal || erroApi;
  const termos      = resultado?.termos ?? [];

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 8 }}>Interpolação de Lagrange</h2>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.5 }}>
        Dado um conjunto de <em>n+1</em> pontos distintos, constrói o polinômio de grau ≤ <em>n</em> que
        passa por todos eles. Cada base L<sub>i</sub>(x) vale 1 no ponto x<sub>i</sub> e 0 nos demais.
      </p>

      {/* Número de pontos */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#444", marginRight: 10 }}>Número de pontos:</span>
        {[2, 3, 4, 5, 6].map(n => (
          <button key={n} onClick={() => mudarNumPontos(n)} style={{
            marginRight: 6, padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13,
            border: numPontos === n ? "2px solid #3c3489" : "1px solid #ccc",
            background: numPontos === n ? "#eeedfe" : "#fff",
            color: numPontos === n ? "#3c3489" : "#555",
            fontWeight: numPontos === n ? 700 : 400,
          }}>{n}</button>
        ))}
        <span style={{ fontSize: 12, color: "#aaa", marginLeft: 8 }}>(grau {numPontos - 1})</span>
      </div>

      {/* Tabela de pontos */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Pontos de interpolação
        </div>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0fc" }}>
              <th style={{ padding: "6px 12px", fontSize: 12, color: "#3c3489", fontWeight: 600, borderBottom: "2px solid #c5c2f0" }}>i</th>
              <th style={{ padding: "6px 12px", fontSize: 12, color: "#3c3489", fontWeight: 600, borderBottom: "2px solid #c5c2f0" }}>xᵢ</th>
              <th style={{ padding: "6px 12px", fontSize: 12, color: "#3c3489", fontWeight: 600, borderBottom: "2px solid #c5c2f0" }}>yᵢ = f(xᵢ)</th>
            </tr>
          </thead>
          <tbody>
            {pontos.map((p, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8f8fc" }}>
                <td style={{ padding: "6px 12px", fontSize: 13, color: "#666", fontFamily: "monospace", textAlign: "center" }}>{i}</td>
                <td style={{ padding: "6px 8px" }}>
                  <CelulaInput value={p[0]} onChange={v => setPonto(i, 0, v)} placeholder={`x${SUB[i]}`} />
                </td>
                <td style={{ padding: "6px 8px" }}>
                  <CelulaInput value={p[1]} onChange={v => setPonto(i, 1, v)} placeholder={`y${SUB[i]}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* x para interpolar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Ponto x para interpolar
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, color: "#555" }}>P(</span>
          <input
            type="number"
            value={xEval}
            onChange={e => setXEval(e.target.value)}
            placeholder="x"
            style={{ width: 110, padding: "6px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, fontFamily: "monospace", background: "#f8f8fc", outline: "none" }}
          />
          <span style={{ fontSize: 14, color: "#555" }}>)</span>
        </div>
      </div>

      {/* Botão + modos */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 24, maxWidth: 760 }}>
        <button onClick={handleCalcular} disabled={carregando} style={{
          background: carregando ? "#9b98c9" : "#3c3489", color: "#fff",
          border: "none", borderRadius: 7, padding: "9px 22px",
          fontSize: 14, fontWeight: 600, cursor: carregando ? "not-allowed" : "pointer", whiteSpace: "nowrap",
        }}>
          {carregando ? "Calculando…" : "Calcular"}
        </button>

        <div style={{ width: 1, height: 28, background: "#ddd", flexShrink: 0 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#666", marginRight: 6 }}>Detalhamento:</span>
          {MODOS.map(({ value, label }) => (
            <label key={value} style={{
              display: "flex", alignItems: "center", gap: 4, fontSize: 13, cursor: "pointer",
              padding: "5px 10px", borderRadius: 6, userSelect: "none", transition: "all 0.15s",
              color: modo === value ? "#3c3489" : "#555", fontWeight: modo === value ? 600 : 400,
              background: modo === value ? "#eeedfe" : "transparent",
              border: modo === value ? "1px solid #c5c2f0" : "1px solid transparent",
            }}>
              <input type="radio" name="modoLagrange" value={value} checked={modo === value}
                onChange={e => { setModo(e.target.value); limpar(); setErroVal(""); }}
                style={{ accentColor: "#3c3489", margin: 0 }} />
              {label}
            </label>
          ))}
        </div>
      </div>

      {erroExibido && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "#fff0f0", border: "1px solid #f5c2c2", color: "#a00", fontSize: 13, maxWidth: 640 }}>
          {erroExibido}
        </div>
      )}

      {resultado && modo !== "interativo" && (
        <ResultadoLagrange resultado={resultado} modo={modo} />
      )}

      {termos.length > 0 && modo === "interativo" && params && (
        <LagrangeInterativo
          key={chaveInt}
          pontos={params.pontos}
          x_eval={params.x_eval}
          termos={termos}
          resultado={resultado.resultado}
        />
      )}
    </div>
  );
}
