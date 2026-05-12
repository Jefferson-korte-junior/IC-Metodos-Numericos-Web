import { useState } from "react";
import { useJacobi } from "../hooks/useJacobi";
import JacobiInterativo from "../components/sistemasLineares/JacobiInterativo";

const MODOS = [
  { value: "basico",        label: "Básico"        },
  { value: "intermediario", label: "Intermediário"  },
  { value: "completo",      label: "Completo"       },
  { value: "interativo",    label: "Interativo"     },
];

const SUB = ["₁","₂","₃","₄","₅"];

function gerarMatriz(n) { return Array.from({ length: n }, () => Array(n).fill("")); }
function gerarVetor(n)  { return Array(n).fill(""); }

function fmt6(v) {
  if (v === null || v === undefined) return "-";
  return typeof v === "number" ? v.toFixed(6) : v;
}

// ── Componente de entrada numérica para células ───────────────────────────────
function CelulaInput({ value, onChange, placeholder, destaque = false, largura = 58 }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: largura, padding: "6px 4px", textAlign: "center",
        border: destaque ? "2px solid #3c3489" : "1px solid #ddd",
        borderRadius: 6, fontSize: 13, fontFamily: "monospace",
        background: "#f8f8fc", outline: "none", boxSizing: "border-box",
      }}
    />
  );
}

// ── Tabela de resultado (Intermediário / Completo) ────────────────────────────
function TabelaIteracoes({ iteracoes, modo, n }) {
  const exibir = (() => {
    if (modo === "completo" || iteracoes.length <= 6) return iteracoes;
    return [...iteracoes.slice(0, 3), { _sep: true }, ...iteracoes.slice(-3)];
  })();

  const tdS = { padding: "7px 10px", fontFamily: "monospace", fontSize: 13, color: "#333" };

  return (
    <div style={{ overflowX: "auto", marginTop: 12 }}>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
        {modo === "intermediario" ? "Primeiras e últimas iterações" : `Todas as iterações (${iteracoes.length})`}
      </p>
      <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
        <thead>
          <tr style={{ background: "#f0f0fc" }}>
            {["Iteração", ...Array.from({ length: n }, (_, i) => `x${SUB[i]}`)].map(h => (
              <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#3c3489", borderBottom: "2px solid #c5c2f0", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exibir.map((it, idx) =>
            it._sep ? (
              <tr key={`sep-${idx}`}>
                <td colSpan={n + 1} style={{ textAlign: "center", padding: "4px", color: "#aaa" }}>⋮</td>
              </tr>
            ) : (
              <tr key={idx} style={{ background: idx % 2 === 0 ? "white" : "#f8f8fc" }}>
                <td style={tdS}>{it.iteracao + 1}</td>
                {it.valores.map((v, vi) => <td key={vi} style={tdS}>{fmt6(v)}</td>)}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Resultado completo ─────────────────────────────────────────────────────────
function ResultadoJacobi({ resultado, modo }) {
  const iteracoes = resultado.iteracoes ?? [];
  const solucao   = resultado.resultado ?? [];
  const n = solucao.length;

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ background: "#f0f0fc", border: "1px solid #c5c2f0", borderRadius: 10, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#3c3489", marginBottom: 10 }}>Solução encontrada</div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 10 }}>
          {solucao.map((v, i) => (
            <div key={i} style={{ fontSize: 15 }}>
              <span style={{ color: "#555" }}>x{SUB[i]} =</span>{" "}
              <strong style={{ fontFamily: "monospace", color: "#3c3489" }}>{fmt6(v)}</strong>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "#666" }}>
          Iterações realizadas: <strong>{iteracoes.length}</strong>
        </div>
      </div>

      {(modo === "intermediario" || modo === "completo") && iteracoes.length > 0 && (
        <TabelaIteracoes iteracoes={iteracoes} modo={modo} n={n} />
      )}
    </div>
  );
}

// ── Aviso de diagonal dominante ───────────────────────────────────────────────
function AvisoDomDiag({ A }) {
  const n = A.length;
  let dominante = true;
  for (let i = 0; i < n; i++) {
    const diag = Math.abs(parseFloat(A[i][i]) || 0);
    const soma = A[i].reduce((s, v, j) => j !== i ? s + Math.abs(parseFloat(v) || 0) : s, 0);
    if (diag < soma) { dominante = false; break; }
  }
  if (dominante) return null;
  return (
    <div style={{ padding: "8px 12px", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 7, fontSize: 12, color: "#92400e", marginBottom: 12, maxWidth: 640 }}>
      ⚠️ A matriz não é estritamente diagonal dominante — convergência não garantida.
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Jacobi() {
  const [tamanho,  setTamanho]  = useState(3);
  const [matrizA,  setMatrizA]  = useState(gerarMatriz(3));
  const [vetorB,   setVetorB]   = useState(gerarVetor(3));
  const [vetorX0,  setVetorX0]  = useState(gerarVetor(3));
  const [tolerancia, setTolerancia] = useState("");
  const [modo,     setModo]     = useState("basico");
  const [erroVal,  setErroVal]  = useState("");
  const [chaveInt, setChaveInt] = useState(0);
  const [params,   setParams]   = useState(null);

  const { calcular, resultado, erro: erroApi, carregando, limpar } = useJacobi();

  function mudarTamanho(n) {
    setTamanho(n);
    setMatrizA(gerarMatriz(n));
    setVetorB(gerarVetor(n));
    setVetorX0(gerarVetor(n));
    limpar(); setErroVal("");
  }

  function setA(i, j, v) {
    setMatrizA(prev => prev.map((row, ri) => row.map((c, ci) => ri === i && ci === j ? v : c)));
  }
  function setB(i, v)  { setVetorB(prev => prev.map((c, ci) => ci === i ? v : c)); }
  function setX0(i, v) { setVetorX0(prev => prev.map((c, ci) => ci === i ? v : c)); }

  function validar() {
    for (let i = 0; i < tamanho; i++) {
      for (let j = 0; j < tamanho; j++) {
        if (matrizA[i][j] === "" || isNaN(parseFloat(matrizA[i][j])))
          return `Preencha A[${i+1}][${j+1}].`;
      }
      if (parseFloat(matrizA[i][i]) === 0) return `Diagonal A[${i+1}][${i+1}] não pode ser zero.`;
      if (vetorB[i] === ""  || isNaN(parseFloat(vetorB[i])))  return `Preencha b${SUB[i]}.`;
      if (vetorX0[i] === "" || isNaN(parseFloat(vetorX0[i]))) return `Preencha o chute x${SUB[i]}⁰.`;
    }
    const tol = parseFloat(tolerancia);
    if (isNaN(tol) || tol <= 0) return "Informe uma tolerância válida (ex: 0.001).";
    return null;
  }

  async function handleCalcular() {
    limpar(); setErroVal("");
    const msg = validar();
    if (msg) { setErroVal(msg); return; }

    const A    = matrizA.map(row => row.map(v => parseFloat(v)));
    const b    = vetorB.map(v => parseFloat(v));
    const x0   = vetorX0.map(v => parseFloat(v));
    const tol  = parseFloat(tolerancia);
    setParams({ A, b, chute: x0, tolerancia: tol });
    await calcular({ A, b, chute: x0, tolerancia: tol });
    setChaveInt(k => k + 1);
  }

  const erroExibido  = erroVal || erroApi;
  const iteracoes    = resultado?.iteracoes ?? [];
  const matrizParcial = matrizA.every(row => row.every(v => v !== ""));

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 8 }}>Método de Jacobi</h2>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.5 }}>
        Resolve sistemas lineares <strong>Ax = b</strong> iterativamente. Em cada iteração,
        todos os x<sub>i</sub> são calculados usando os valores da iteração <em>anterior</em> simultaneamente.
      </p>

      {/* Tamanho */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#444", marginRight: 10 }}>Tamanho do sistema:</span>
        {[2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => mudarTamanho(n)} style={{
            marginRight: 6, padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13,
            border: tamanho === n ? "2px solid #3c3489" : "1px solid #ccc",
            background: tamanho === n ? "#eeedfe" : "#fff",
            color: tamanho === n ? "#3c3489" : "#555",
            fontWeight: tamanho === n ? 700 : 400,
          }}>{n}×{n}</button>
        ))}
      </div>

      {/* Entradas */}
      <div style={{ display: "flex", gap: 28, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* Matriz A */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Matriz A</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {matrizA.map((row, i) => (
              <div key={i} style={{ display: "flex", gap: 4 }}>
                {row.map((v, j) => (
                  <CelulaInput key={j} value={v} onChange={val => setA(i, j, val)}
                    placeholder={`a${i+1}${j+1}`} destaque={i === j} />
                ))}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10, color: "#aaa", marginTop: 4 }}>Diagonal em destaque</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: 20, color: "#bbb", paddingTop: 22 }}>·</div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 16, color: "#888", paddingTop: 22 }}>x =</div>

        {/* Vetor b */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Vetor b</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {vetorB.map((v, i) => (
              <CelulaInput key={i} value={v} onChange={val => setB(i, val)} placeholder={`b${SUB[i]}`} largura={64} />
            ))}
          </div>
        </div>

        <div style={{ width: 1, background: "#e0e0e0", alignSelf: "stretch", marginTop: 22 }} />

        {/* Chute inicial */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Chute inicial x⁰</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {vetorX0.map((v, i) => (
              <CelulaInput key={i} value={v} onChange={val => setX0(i, val)} placeholder={`x${SUB[i]}⁰`} largura={64} />
            ))}
          </div>
        </div>

        {/* Tolerância */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Tolerância</div>
          <input type="number" value={tolerancia} onChange={e => setTolerancia(e.target.value)}
            placeholder="ex: 0.001" step="0.0001"
            style={{ width: 90, padding: "6px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, fontFamily: "monospace", background: "#f8f8fc", outline: "none" }}
          />
        </div>
      </div>

      {/* Aviso diagonal dominante */}
      {matrizParcial && <AvisoDomDiag A={matrizA} />}

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
              color: modo === value ? "#3c3489" : "#555",
              fontWeight: modo === value ? 600 : 400,
              background: modo === value ? "#eeedfe" : "transparent",
              border: modo === value ? "1px solid #c5c2f0" : "1px solid transparent",
            }}>
              <input type="radio" name="modoJacobi" value={value} checked={modo === value}
                onChange={e => { setModo(e.target.value); limpar(); setErroVal(""); }}
                style={{ accentColor: "#3c3489", margin: 0 }} />
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
      {resultado && modo !== "interativo" && (
        <ResultadoJacobi resultado={resultado} modo={modo} />
      )}

      {iteracoes.length > 0 && modo === "interativo" && params && (
        <JacobiInterativo
          key={chaveInt}
          A={params.A} b={params.b}
          chute={params.chute} tolerancia={params.tolerancia}
          iteracoesBackend={iteracoes}
        />
      )}
    </div>
  );
}
