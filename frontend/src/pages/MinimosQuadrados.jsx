import { useState } from "react";
import { useMinimosQuadrados } from "../hooks/useMinimosQuadrados";
import MinimosQuadradosInterativo from "../components/aproximacao/MinimosQuadradosInterativo";

const MODOS = [
  { value: "basico",        label: "Básico"        },
  { value: "intermediario", label: "Intermediário"  },
  { value: "avancado",      label: "Avançado"       },
  { value: "interativo",    label: "Interativo"     },
];

const SUB = ["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉"];

function fmt6(v) {
  if (v === null || v === undefined) return "-";
  return typeof v === "number" ? v.toFixed(6) : v;
}

function fmtCoef(c, casas = 6) {
  return Number(c).toFixed(casas);
}

// Exemplos pré-carregados por grau
function gerarExemplo(n, grau) {
  if (grau === 1) {
    const base = [
      ["1", "2.1"], ["2", "4.0"], ["3", "5.9"], ["4", "8.1"], ["5", "9.9"],
      ["6", "12.1"], ["7", "14.0"], ["8", "15.9"], ["9", "18.1"], ["10", "20.0"],
    ];
    return base.slice(0, n);
  }
  if (grau === 2) {
    const base = [
      ["0", "1.0"], ["1", "2.1"], ["2", "5.0"], ["3", "10.1"], ["4", "17.0"],
      ["5", "26.0"], ["6", "37.2"], ["7", "50.1"], ["8", "65.0"], ["9", "82.0"],
    ];
    return base.slice(0, n);
  }
  // grau 3
  const base = [
    ["0", "1.0"], ["1", "1.0"], ["2", "3.1"], ["3", "13.0"], ["4", "33.0"],
    ["5", "71.0"], ["6", "133.0"], ["7", "225.0"], ["8", "353.0"], ["9", "523.0"],
  ];
  return base.slice(0, n);
}

// ── Input de célula ──────────────────────────────────────────────────────────
function CelulaInput({ value, onChange, placeholder, largura = 80 }) {
  return (
    <input
      type="number" value={value}
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

// ── Card de resultado básico ──────────────────────────────────────────────────
function ResultadoBasico({ resultado }) {
  const { coeficientes, grau, r_quadrado, rmse, n_pontos, equacao } = resultado;

  const nomesMod = ["a₀", "a₁", "a₂", "a₃"].slice(0, grau + 1);
  const varLabel = grau === 1
    ? "y = a₀ + a₁·x"
    : grau === 2
    ? "y = a₀ + a₁·x + a₂·x²"
    : "y = a₀ + a₁·x + a₂·x² + a₃·x³";

  return (
    <div style={{ maxWidth: 660 }}>
      {/* Equação */}
      <div style={{ background: "#f0f0fc", border: "1px solid #c5c2f0", borderRadius: 10, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#3c3489", marginBottom: 10 }}>Modelo Ajustado</div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>{varLabel}</div>
        <div style={{ fontFamily: "monospace", fontSize: 16, color: "#1a1a4e", fontWeight: 700, marginBottom: 12 }}>
          {equacao.replace("·", "·")}
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {coeficientes.map((c, k) => (
            <div key={k}>
              <span style={{ fontSize: 12, color: "#888" }}>{nomesMod[k]} = </span>
              <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#3c3489", fontSize: 15 }}>{fmtCoef(c)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <MetricaCard label="R²" valor={fmt6(r_quadrado)} cor="#16a34a"
          desc="Coeficiente de determinação (0–1)" />
        <MetricaCard label="RMSE" valor={fmt6(rmse)} cor="#2563eb"
          desc="Raiz do erro quadrático médio" />
        <MetricaCard label="Pontos" valor={n_pontos} cor="#7c3aed"
          desc={`Grau do polinômio: ${grau}`} />
      </div>
    </div>
  );
}

function MetricaCard({ label, valor, cor, desc }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5f0", borderRadius: 10, padding: "14px 18px", minWidth: 140 }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace", color: cor }}>{valor}</div>
      <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{desc}</div>
    </div>
  );
}

// ── Resultado intermediário ───────────────────────────────────────────────────
function ResultadoIntermediario({ resultado }) {
  const { coeficientes, grau, r_quadrado, rmse, somas, matriz_A, vetor_b, equacao } = resultado;
  const s = somas;
  const m = grau;

  const somaLinhas = [
    { label: "n",       val: s.n     },
    { label: "Σxᵢ",    val: s.sum_x  },
    { label: "Σyᵢ",    val: s.sum_y  },
    { label: "Σxᵢ²",   val: s.sum_x2 },
    { label: "Σxᵢyᵢ",  val: s.sum_xy },
    ...(m >= 2 ? [
      { label: "Σxᵢ³",   val: s.sum_x3  },
      { label: "Σxᵢ⁴",   val: s.sum_x4  },
      { label: "Σxᵢ²yᵢ", val: s.sum_x2y },
    ] : []),
    ...(m >= 3 ? [
      { label: "Σxᵢ⁵",   val: s.sum_x5  },
      { label: "Σxᵢ⁶",   val: s.sum_x6  },
      { label: "Σxᵢ³yᵢ", val: s.sum_x3y },
    ] : []),
  ];

  const thS = { padding: "7px 14px", textAlign: "left", fontWeight: 600, color: "#3c3489", borderBottom: "2px solid #c5c2f0", fontSize: 13 };
  const tdS = { padding: "7px 14px", fontFamily: "monospace", fontSize: 13 };

  return (
    <div style={{ maxWidth: 820 }}>
      <ResultadoBasico resultado={resultado} />

      {/* Somas */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Somas Auxiliares
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f0fc" }}>
                {somaLinhas.map(l => (
                  <th key={l.label} style={thS}>{l.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {somaLinhas.map((l, i) => (
                  <td key={i} style={tdS}>{typeof l.val === "number" ? fmt6(l.val) : l.val}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sistema Normal */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Sistema de Equações Normais ({m + 1}×{m + 1})
        </div>
        <div style={{ background: "#f8f8fc", border: "1px solid #e0e0f0", borderRadius: 10, padding: 16, display: "inline-block" }}>
          <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 13 }}>
            <tbody>
              {matriz_A.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: "4px 8px", color: "#888" }}>[</td>
                  {row.map((val, j) => (
                    <td key={j} style={{ padding: "4px 10px", textAlign: "right", color: "#3c3489", fontWeight: 500 }}>
                      {fmt6(val)}
                    </td>
                  ))}
                  <td style={{ padding: "4px 8px", color: "#888" }}>]</td>
                  <td style={{ padding: "4px 8px", color: "#3c3489", fontWeight: 700 }}>[a{SUB[i]}]</td>
                  <td style={{ padding: "4px 8px", color: "#888" }}>{i === Math.floor((m + 1) / 2) ? "=" : " "}</td>
                  <td style={{ padding: "4px 8px", color: "#888" }}>[</td>
                  <td style={{ padding: "4px 10px", textAlign: "right", color: "#1a7a4a", fontWeight: 600 }}>
                    {fmt6(vetor_b[i])}
                  </td>
                  <td style={{ padding: "4px 8px", color: "#888" }}>]</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Resultado avançado ────────────────────────────────────────────────────────
function ResultadoAvancado({ resultado }) {
  const { coeficientes, grau, r_quadrado, rmse, tabela, ss_res, ss_tot, y_medio } = resultado;

  const thS = { padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#3c3489", borderBottom: "2px solid #c5c2f0", fontSize: 13, whiteSpace: "nowrap" };
  const tdS = { padding: "7px 12px", fontFamily: "monospace", fontSize: 13, color: "#333" };

  return (
    <div style={{ maxWidth: 1000 }}>
      <ResultadoIntermediario resultado={resultado} />

      {/* Tabela de erros */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Tabela de Resíduos
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr style={{ background: "#f0f0fc" }}>
                {["i", "xᵢ", "yᵢ (obs.)", "ŷᵢ (calc.)", "eᵢ = yᵢ − ŷᵢ", "eᵢ²"].map(h => (
                  <th key={h} style={thS}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabela.map((row, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? "white" : "#f8f8fc" }}>
                  <td style={{ ...tdS, color: "#666" }}>{row.i}</td>
                  <td style={tdS}>{fmt6(row.xi)}</td>
                  <td style={{ ...tdS, fontWeight: 600 }}>{fmt6(row.yi)}</td>
                  <td style={{ ...tdS, color: "#3c3489" }}>{fmt6(row.yi_calc)}</td>
                  <td style={{ ...tdS, color: Math.abs(row.erro) < 0.1 ? "#16a34a" : "#c2410c" }}>{fmt6(row.erro)}</td>
                  <td style={{ ...tdS, color: "#666" }}>{fmt6(row.erro2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#e8e8f8", borderTop: "2px solid #c5c2f0" }}>
                <td colSpan={2} style={{ ...tdS, fontWeight: 700, color: "#3c3489" }}>Somas / Médias</td>
                <td style={{ ...tdS, fontWeight: 700 }}>ȳ = {fmt6(y_medio)}</td>
                <td style={tdS}></td>
                <td style={{ ...tdS, fontWeight: 700 }}>—</td>
                <td style={{ ...tdS, fontWeight: 700, color: "#dc2626" }}>SS_res = {fmt6(ss_res)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Análise de ajuste */}
        <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 16px" }}>
            <div style={{ fontSize: 12, color: "#555" }}>SS_res</div>
            <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#dc2626", fontSize: 15 }}>{fmt6(ss_res)}</div>
            <div style={{ fontSize: 11, color: "#888" }}>Σ(yᵢ − ŷᵢ)²</div>
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px" }}>
            <div style={{ fontSize: 12, color: "#555" }}>SS_tot</div>
            <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#3c3489", fontSize: 15 }}>{fmt6(ss_tot)}</div>
            <div style={{ fontSize: 11, color: "#888" }}>Σ(yᵢ − ȳ)²</div>
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 16px" }}>
            <div style={{ fontSize: 12, color: "#555" }}>R² = 1 − SS_res/SS_tot</div>
            <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#16a34a", fontSize: 17 }}>{fmt6(r_quadrado)}</div>
            <div style={{ fontSize: 11, color: "#888" }}>
              {r_quadrado >= 0.99 ? "Excelente ajuste" : r_quadrado >= 0.95 ? "Bom ajuste" : r_quadrado >= 0.80 ? "Ajuste razoável" : "Ajuste fraco"}
            </div>
          </div>
          <div style={{ background: "#faf5ff", border: "1px solid #ddd6fe", borderRadius: 8, padding: "10px 16px" }}>
            <div style={{ fontSize: 12, color: "#555" }}>RMSE</div>
            <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#7c3aed", fontSize: 15 }}>{fmt6(rmse)}</div>
            <div style={{ fontSize: 11, color: "#888" }}>√(SS_res/n)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function MinimosQuadrados() {
  const [numPontos, setNumPontos] = useState(5);
  const [grau,      setGrau]      = useState(1);
  const [pontos,    setPontos]    = useState(() => gerarExemplo(5, 1));
  const [modo,      setModo]      = useState("basico");
  const [erroVal,   setErroVal]   = useState("");
  const [chaveInt,  setChaveInt]  = useState(0);
  const [params,    setParams]    = useState(null);

  const { calcular, resultado, erro: erroApi, carregando, limpar } = useMinimosQuadrados();

  function mudarNumPontos(n) {
    setNumPontos(n);
    setPontos(gerarExemplo(n, grau));
    limpar(); setErroVal("");
  }

  function mudarGrau(g) {
    setGrau(g);
    setPontos(gerarExemplo(numPontos, g));
    limpar(); setErroVal("");
  }

  function setPonto(i, col, v) {
    setPontos(prev => prev.map((p, pi) =>
      pi === i ? (col === 0 ? [v, p[1]] : [p[0], v]) : p
    ));
  }

  function validar() {
    for (let i = 0; i < numPontos; i++) {
      if (pontos[i][0] === "" || isNaN(parseFloat(pontos[i][0])))
        return `Preencha x${SUB[i]}.`;
      if (pontos[i][1] === "" || isNaN(parseFloat(pontos[i][1])))
        return `Preencha y${SUB[i]}.`;
    }
    if (numPontos <= grau)
      return `Mínimos Quadrados de grau ${grau} requer pelo menos ${grau + 1} pontos.`;
    return null;
  }

  async function handleCalcular() {
    limpar(); setErroVal("");
    const msg = validar();
    if (msg) { setErroVal(msg); return; }

    const pts = pontos.map(p => [parseFloat(p[0]), parseFloat(p[1])]);
    setParams({ pontos: pts, grau });
    await calcular({ pontos: pts, grau });
    setChaveInt(k => k + 1);
  }

  const erroExibido = erroVal || erroApi;

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 8 }}>Aproximação por Mínimos Quadrados</h2>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.6 }}>
        Dado um conjunto de <em>n</em> pontos, encontra o polinômio de grau <em>m</em> que minimiza a
        soma dos quadrados dos erros Σ(yᵢ − ŷᵢ)². O sistema de equações normais A·a = b
        é montado com as somas auxiliares e resolvido por eliminação de Gauss.
      </p>

      {/* Grau */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#444", marginRight: 10 }}>Grau do polinômio:</span>
        {[1, 2, 3].map(g => (
          <button key={g} onClick={() => mudarGrau(g)} disabled={numPontos <= g} style={{
            marginRight: 6, padding: "5px 13px", borderRadius: 6, cursor: numPontos <= g ? "not-allowed" : "pointer",
            fontSize: 13, opacity: numPontos <= g ? 0.4 : 1,
            border: grau === g ? "2px solid #3c3489" : "1px solid #ccc",
            background: grau === g ? "#eeedfe" : "#fff",
            color: grau === g ? "#3c3489" : "#555",
            fontWeight: grau === g ? 700 : 400,
          }}>
            {g}
          </button>
        ))}
        <span style={{ fontSize: 12, color: "#aaa", marginLeft: 8 }}>
          {grau === 1 ? "y = a₀ + a₁·x" : grau === 2 ? "y = a₀ + a₁·x + a₂·x²" : "y = a₀ + a₁·x + a₂·x² + a₃·x³"}
        </span>
      </div>

      {/* Número de pontos */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#444", marginRight: 10 }}>Número de pontos:</span>
        {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <button key={n} onClick={() => mudarNumPontos(n)} disabled={n <= grau} style={{
            marginRight: 4, padding: "5px 11px", borderRadius: 6,
            cursor: n <= grau ? "not-allowed" : "pointer",
            fontSize: 13, opacity: n <= grau ? 0.4 : 1,
            border: numPontos === n ? "2px solid #3c3489" : "1px solid #ccc",
            background: numPontos === n ? "#eeedfe" : "#fff",
            color: numPontos === n ? "#3c3489" : "#555",
            fontWeight: numPontos === n ? 700 : 400,
          }}>{n}</button>
        ))}
      </div>

      {/* Tabela de pontos */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Dados observados
        </div>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0fc" }}>
              <th style={{ padding: "6px 12px", fontSize: 12, color: "#3c3489", fontWeight: 600, borderBottom: "2px solid #c5c2f0" }}>i</th>
              <th style={{ padding: "6px 12px", fontSize: 12, color: "#3c3489", fontWeight: 600, borderBottom: "2px solid #c5c2f0" }}>xᵢ</th>
              <th style={{ padding: "6px 12px", fontSize: 12, color: "#3c3489", fontWeight: 600, borderBottom: "2px solid #c5c2f0" }}>yᵢ</th>
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

      {/* Botão + modos */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 24, maxWidth: 760 }}>
        <button onClick={handleCalcular} disabled={carregando} style={{
          background: carregando ? "#9b98c9" : "#3c3489", color: "#fff",
          border: "none", borderRadius: 7, padding: "9px 22px",
          fontSize: 14, fontWeight: 600, cursor: carregando ? "not-allowed" : "pointer", whiteSpace: "nowrap",
        }}>
          {carregando ? "Calculando…" : "Calcular Ajuste"}
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
              <input type="radio" name="modoMQ" value={value} checked={modo === value}
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

      {resultado && modo === "basico" && <ResultadoBasico resultado={resultado} />}
      {resultado && modo === "intermediario" && <ResultadoIntermediario resultado={resultado} />}
      {resultado && modo === "avancado" && <ResultadoAvancado resultado={resultado} />}

      {resultado && modo === "interativo" && params && (
        <MinimosQuadradosInterativo
          key={chaveInt}
          pontos={params.pontos}
          grau={params.grau}
          resultado={resultado}
        />
      )}
    </div>
  );
}
