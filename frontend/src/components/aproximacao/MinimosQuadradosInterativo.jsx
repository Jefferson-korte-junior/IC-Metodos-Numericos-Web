import React, { useState, useRef, useEffect } from "react";

const SUB = ["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉"];

function fmt(v, c = 4)  { return parseFloat(Number(v).toFixed(c)); }
function fmtS(v, c = 6) { return Number(v).toFixed(c); }

function checar(digitado, esperado) {
  const raw = String(digitado).trim().replace(",", ".").replace(/\s/g, "");
  const d = parseFloat(raw);
  if (isNaN(d)) return false;
  const diff = Math.abs(d - esperado);
  if (diff < 0.001) return true;
  if (Math.abs(esperado) < 1e-10) return diff < 1e-4;
  return diff / Math.abs(esperado) <= 0.01;
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:           "#f1f5f9",
  bgCard:       "#ffffff",
  bgSection:    "#f8fafc",
  primary:      "#2563eb",
  primaryLight: "#eff6ff",
  primaryBorder:"#bfdbfe",
  green:        "#16a34a",
  greenLight:   "#f0fdf4",
  greenBorder:  "#86efac",
  red:          "#dc2626",
  redLight:     "#fef2f2",
  redBorder:    "#fca5a5",
  yellow:       "#92400e",
  yellowLight:  "#fffbeb",
  yellowBorder: "#fcd34d",
  orange:       "#c2410c",
  orangeLight:  "#fff7ed",
  orangeBorder: "#fed7aa",
  purple:       "#7c3aed",
  purpleLight:  "#f5f3ff",
  purpleBorder: "#ddd6fe",
  teal:         "#0d9488",
  tealLight:    "#f0fdfa",
  tealBorder:   "#99f6e4",
  border:       "#e2e8f0",
  borderMed:    "#cbd5e1",
  text:         "#0f172a",
  textMuted:    "#475569",
  textFaint:    "#94a3b8",
  font:         "'JetBrains Mono', 'Fira Code', monospace",
  fontSans:     "'Inter', 'Segoe UI', sans-serif",
  radius:       "12px",
  radiusSm:     "8px",
  radiusXs:     "5px",
  shadow:       "0 1px 3px rgba(0,0,0,0.07)",
};

// ── Calculadora ───────────────────────────────────────────────────────────────
function Calculadora() {
  const [display, setDisplay] = useState("0");
  const [expr, setExpr] = useState("");
  const [newNum, setNewNum] = useState(true);

  function pressDigit(d) {
    if (newNum) { setDisplay(d === "." ? "0." : d); setNewNum(false); }
    else {
      if (d === "." && display.includes(".")) return;
      setDisplay(display === "0" && d !== "." ? d : display + d);
    }
  }
  function pressOp(op) {
    const lhs = newNum ? expr : expr + display + " ";
    setExpr(lhs + op + " "); setNewNum(true);
  }
  function pressLParen() {
    if (!newNum && display !== "0") { setExpr(expr + display + " * ("); }
    else { setExpr(expr + "("); }
    setDisplay("0"); setNewNum(true);
  }
  function pressRParen() {
    setExpr(expr + (newNum ? "" : display) + ")");
    if (!newNum) setDisplay("0");
    setNewNum(true);
  }
  function calcular() {
    try {
      const fullExpr = (newNum ? expr : expr + display).trim();
      // eslint-disable-next-line no-new-func
      const res = Function(`return (${fullExpr || display})`)();
      setDisplay(isFinite(res) ? String(parseFloat(res.toFixed(12))) : "Erro");
      setExpr(""); setNewNum(true);
    } catch { setDisplay("Erro"); setExpr(""); setNewNum(true); }
  }
  function pressFunc(fn) {
    try {
      const v = parseFloat(display); let res;
      const DEG = Math.PI / 180;
      if      (fn === "sin")  res = Math.sin(v * DEG);
      else if (fn === "cos")  res = Math.cos(v * DEG);
      else if (fn === "tan")  res = Math.tan(v * DEG);
      else if (fn === "√")    res = Math.sqrt(v);
      else if (fn === "log")  res = Math.log10(v);
      else if (fn === "ln")   res = Math.log(v);
      else if (fn === "x²")   res = v * v;
      else if (fn === "1/x")  res = 1 / v;
      else if (fn === "±")    res = -v;
      else if (fn === "π")  { setDisplay(String(Math.PI)); setNewNum(true); return; }
      else if (fn === "e")  { setDisplay(String(Math.E));  setNewNum(true); return; }
      else return;
      setDisplay(isFinite(res) ? String(parseFloat(res.toFixed(12))) : "Erro");
      setNewNum(true);
    } catch { setDisplay("Erro"); setNewNum(true); }
  }
  function limpar()    { setDisplay("0"); setExpr(""); setNewNum(true); }
  function backspace() {
    if (newNum || display.length <= 1) { setDisplay("0"); setNewNum(true); }
    else setDisplay(display.slice(0, -1) || "0");
  }
  const themes = {
    num:{bg:"#f1f5f9",fg:T.text,hov:"#e2e8f0"},
    op:{bg:"#eff6ff",fg:T.primary,hov:"#dbeafe"},
    fn:{bg:"#f8fafc",fg:"#475569",hov:"#e9eef5"},
    eq:{bg:T.primary,fg:"#fff",hov:"#1d4ed8"},
    del:{bg:"#fef2f2",fg:T.red,hov:"#fee2e2"},
  };
  function Btn({ label, onClick, theme = "num", wide = false }) {
    const th = themes[theme];
    const [hov, setHov] = useState(false);
    return (
      <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ background:hov?th.hov:th.bg, color:th.fg, border:"1px solid #e2e8f0", borderRadius:T.radiusXs, fontSize:13, fontFamily:theme==="num"||theme==="op"||theme==="eq"?T.font:T.fontSans, fontWeight:theme==="eq"||theme==="op"?700:400, cursor:"pointer", padding:"8px 4px", gridColumn:wide?"span 2":undefined, transition:"background 0.1s", userSelect:"none" }}
      >{label}</button>
    );
  }
  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:14, boxShadow:T.shadow }}>
      <div style={{ fontSize:11, fontWeight:700, color:T.textFaint, textTransform:"uppercase", letterSpacing:1, marginBottom:10, fontFamily:T.fontSans }}>Calculadora</div>
      <div style={{ background:T.bgSection, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:"8px 12px", marginBottom:10, textAlign:"right", minHeight:60 }}>
        <div style={{ fontSize:11, color:T.textFaint, fontFamily:T.font, minHeight:16, marginBottom:2, overflow:"hidden", whiteSpace:"nowrap" }}>{expr || " "}</div>
        <div style={{ fontSize:display.length>14?13:display.length>10?16:22, fontWeight:700, color:T.text, fontFamily:T.font, wordBreak:"break-all" }}>{display}</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:4 }}>
        <Btn label="sin" onClick={() => pressFunc("sin")} theme="fn" />
        <Btn label="cos" onClick={() => pressFunc("cos")} theme="fn" />
        <Btn label="tan" onClick={() => pressFunc("tan")} theme="fn" />
        <Btn label="√"   onClick={() => pressFunc("√")}   theme="fn" />
        <Btn label="log" onClick={() => pressFunc("log")} theme="fn" />
        <Btn label="ln"  onClick={() => pressFunc("ln")}  theme="fn" />
        <Btn label="x²"  onClick={() => pressFunc("x²")}  theme="fn" />
        <Btn label="1/x" onClick={() => pressFunc("1/x")} theme="fn" />
        <Btn label="π"   onClick={() => pressFunc("π")}   theme="fn" />
        <Btn label="e"   onClick={() => pressFunc("e")}   theme="fn" />
        <Btn label="±"   onClick={() => pressFunc("±")}   theme="fn" />
        <Btn label="⌫"   onClick={backspace}              theme="del" />
        <Btn label="C"   onClick={limpar}                 theme="del" />
        <Btn label="("   onClick={pressLParen}            theme="op" />
        <Btn label=")"   onClick={pressRParen}            theme="op" />
        <Btn label="÷"   onClick={() => pressOp("/")}     theme="op" />
        <Btn label="7"   onClick={() => pressDigit("7")} />
        <Btn label="8"   onClick={() => pressDigit("8")} />
        <Btn label="9"   onClick={() => pressDigit("9")} />
        <Btn label="×"   onClick={() => pressOp("*")}     theme="op" />
        <Btn label="4"   onClick={() => pressDigit("4")} />
        <Btn label="5"   onClick={() => pressDigit("5")} />
        <Btn label="6"   onClick={() => pressDigit("6")} />
        <Btn label="−"   onClick={() => pressOp("-")}     theme="op" />
        <Btn label="1"   onClick={() => pressDigit("1")} />
        <Btn label="2"   onClick={() => pressDigit("2")} />
        <Btn label="3"   onClick={() => pressDigit("3")} />
        <Btn label="+"   onClick={() => pressOp("+")}     theme="op" />
        <Btn label="0"   onClick={() => pressDigit("0")}  wide />
        <Btn label="."   onClick={() => pressDigit(".")} />
        <Btn label="="   onClick={calcular}               theme="eq" />
      </div>
      <div style={{ marginTop:8, fontSize:10, color:T.textFaint, fontFamily:T.fontSans, textAlign:"center" }}>
        sin/cos/tan em graus (DEG)
      </div>
    </div>
  );
}

// ── DicaBox ───────────────────────────────────────────────────────────────────
function DicaBox({ dica, tentativas }) {
  const [aberto, setAberto] = useState(false);
  const completa = tentativas >= 2;
  return (
    <div style={{ marginBottom: 14 }}>
      <button onClick={() => setAberto(v => !v)} style={{ background:"transparent", border:`1px solid ${T.yellowBorder}`, color:T.yellow, borderRadius:T.radiusXs, padding:"5px 14px", fontSize:13, fontFamily:T.fontSans, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
        💡 {aberto ? "Ocultar dica" : "Ver dica"}
      </button>
      {aberto && (
        <div style={{ marginTop:8, background:T.yellowLight, border:`1px solid ${T.yellowBorder}`, borderRadius:T.radiusSm, padding:"10px 14px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.yellow, marginBottom:6, fontFamily:T.fontSans }}>{completa ? "DICA COMPLETA" : "DICA PARCIAL"}</div>
          {completa
            ? <p style={{ margin:0, fontSize:13, color:T.textMuted, lineHeight:1.7, fontFamily:T.font, whiteSpace:"pre-line" }}>{dica}</p>
            : <>
                <p style={{ margin:0, fontSize:13, color:T.textMuted, fontFamily:T.fontSans }}>{dica.split("\n")[0]}</p>
                <p style={{ margin:"6px 0 0", fontSize:12, color:T.textFaint, fontStyle:"italic", fontFamily:T.fontSans }}>Erre mais uma vez para ver o cálculo completo.</p>
              </>
          }
        </div>
      )}
    </div>
  );
}

// ── PainelContexto ────────────────────────────────────────────────────────────
function PainelContexto({ itens }) {
  if (!itens?.length) return null;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
      {itens.map((item, i) => (
        <div key={i} style={{ background:T.primaryLight, border:`1px solid ${T.primaryBorder}`, borderLeft:`3px solid ${T.primary}`, borderRadius:T.radiusSm, padding:"11px 15px" }}>
          {item.titulo && <div style={{ fontSize:12, fontWeight:700, color:T.primary, marginBottom:5, fontFamily:T.fontSans }}>{item.titulo}</div>}
          <p style={{ margin:0, fontSize:13, color:T.textMuted, lineHeight:1.65, fontFamily:T.font, whiteSpace:"pre-line" }}>{item.texto}</p>
        </div>
      ))}
    </div>
  );
}

// ── PainelHistorico ───────────────────────────────────────────────────────────
function PainelHistorico({ historico }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [historico.length]);
  if (!historico.length) return null;
  const grupos = [];
  historico.forEach(item => {
    const ult = grupos[grupos.length - 1];
    if (ult && ult.faseLabel === item.faseLabel) ult.itens.push(item);
    else grupos.push({ faseLabel: item.faseLabel, itens: [item] });
  });
  return (
    <div style={{ marginTop:20 }}>
      <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:700, color:T.textFaint, textTransform:"uppercase", letterSpacing:1, fontFamily:T.fontSans }}>Histórico</p>
      <div ref={ref} style={{ background:T.bgSection, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:14, maxHeight:260, overflowY:"auto", display:"flex", flexDirection:"column", gap:14, boxShadow:"inset 0 1px 3px rgba(0,0,0,0.04)" }}>
        {grupos.map((grupo, gi) => (
          <div key={gi}>
            <div style={{ fontSize:12, fontWeight:700, color:T.primary, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8, paddingBottom:6, borderBottom:`1px solid ${T.primaryBorder}`, fontFamily:T.fontSans }}>{grupo.faseLabel}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px,1fr))", gap:6 }}>
              {grupo.itens.map((item, ii) => (
                <div key={ii} style={{ background:"#fff", border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:"7px 10px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:13, color:T.textMuted, fontFamily:T.font }}>{item.perguntaTexto}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:T.green, fontFamily:T.font }}>✓ {item.resposta}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PainelEstadoMQ — mini painel lateral com somas e coef revelados ───────────
function PainelEstadoMQ({ grau, somas, coeficientes, r2, faseIdx, subIdx, respondido }) {
  const somaEntradas = grau === 1 ? [
    { key: "sum_x",   label: "Σxᵢ"   },
    { key: "sum_y",   label: "Σyᵢ"   },
    { key: "sum_x2",  label: "Σxᵢ²"  },
    { key: "sum_xy",  label: "Σxᵢyᵢ" },
  ] : grau === 2 ? [
    { key: "sum_x",   label: "Σxᵢ"    },
    { key: "sum_y",   label: "Σyᵢ"    },
    { key: "sum_x2",  label: "Σxᵢ²"   },
    { key: "sum_xy",  label: "Σxᵢyᵢ"  },
    { key: "sum_x3",  label: "Σxᵢ³"   },
    { key: "sum_x4",  label: "Σxᵢ⁴"   },
    { key: "sum_x2y", label: "Σxᵢ²yᵢ" },
  ] : [
    { key: "sum_x",   label: "Σxᵢ"    },
    { key: "sum_y",   label: "Σyᵢ"    },
    { key: "sum_x2",  label: "Σxᵢ²"   },
    { key: "sum_xy",  label: "Σxᵢyᵢ"  },
    { key: "sum_x3",  label: "Σxᵢ³"   },
    { key: "sum_x4",  label: "Σxᵢ⁴"   },
    { key: "sum_x2y", label: "Σxᵢ²yᵢ" },
    { key: "sum_x5",  label: "Σxᵢ⁵"   },
    { key: "sum_x6",  label: "Σxᵢ⁶"   },
    { key: "sum_x3y", label: "Σxᵢ³yᵢ" },
  ];

  function isSomaRev(idx) {
    if (faseIdx > 0) return true;
    return subIdx > idx || (subIdx === idx && respondido);
  }
  function isCoefRev(idx) {
    if (faseIdx < 1) return false;
    if (faseIdx > 1) return true;
    return subIdx > idx || (subIdx === idx && respondido);
  }
  const r2Rev = faseIdx > 2 || (faseIdx === 2 && respondido);

  const coefNomes = ["a₀", "a₁", "a₂", "a₃"].slice(0, grau + 1);
  const m = grau;

  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"14px 16px", marginBottom:16, boxShadow:T.shadow }}>
      <div style={{ fontSize:12, fontWeight:600, color:T.textFaint, marginBottom:12, fontFamily:T.fontSans, textTransform:"uppercase", letterSpacing:0.6 }}>
        Construção do Modelo
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {/* Somas */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:T.teal, marginBottom:8, fontFamily:T.fontSans, textTransform:"uppercase", letterSpacing:0.5 }}>Somas</div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontFamily:T.font, color:T.textMuted, padding:"3px 0" }}>
              <span>n</span>
              <span style={{ fontWeight:700, color:T.text }}>{somas.n}</span>
            </div>
            {somaEntradas.map((e, idx) => {
              const rev = isSomaRev(idx);
              return (
                <div key={e.key} style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontFamily:T.font, padding:"3px 6px", borderRadius:4, background: rev ? T.tealLight : "transparent" }}>
                  <span style={{ color: rev ? T.teal : T.textFaint }}>{e.label}</span>
                  <span style={{ fontWeight: rev ? 700 : 400, color: rev ? T.teal : T.textFaint }}>
                    {rev ? fmtS(somas[e.key], 4) : "?"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Coeficientes e equação */}
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:T.purple, marginBottom:8, fontFamily:T.fontSans, textTransform:"uppercase", letterSpacing:0.5 }}>Coeficientes</div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {coefNomes.map((nome, idx) => {
              const rev = isCoefRev(idx);
              return (
                <div key={nome} style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontFamily:T.font, padding:"3px 6px", borderRadius:4, background: rev ? T.purpleLight : "transparent" }}>
                  <span style={{ color: rev ? T.purple : T.textFaint }}>{nome}</span>
                  <span style={{ fontWeight: rev ? 700 : 400, color: rev ? T.purple : T.textFaint }}>
                    {rev ? fmtS(coeficientes[idx], 6) : "?"}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:10, padding:"6px 8px", borderRadius:4, background: r2Rev ? T.greenLight : "transparent", border: r2Rev ? `1px solid ${T.greenBorder}` : "1px solid transparent" }}>
            <div style={{ fontSize:12, fontFamily:T.font, display:"flex", justifyContent:"space-between" }}>
              <span style={{ color: r2Rev ? T.green : T.textFaint, fontWeight: r2Rev ? 700 : 400 }}>R²</span>
              <span style={{ fontWeight:700, color: r2Rev ? T.green : T.textFaint }}>
                {r2Rev ? fmtS(r2, 6) : "?"}
              </span>
            </div>
          </div>
          {/* Equação parcial */}
          {isCoefRev(m) && (
            <div style={{ marginTop:10, padding:"6px 8px", borderRadius:4, background:T.bgSection, border:`1px solid ${T.border}` }}>
              <div style={{ fontSize:11, color:T.textFaint, fontFamily:T.fontSans, marginBottom:3 }}>Equação:</div>
              <div style={{ fontSize:11, fontFamily:T.font, color:T.text, lineHeight:1.5 }}>
                y = {coeficientes[0] >= 0 ? fmtS(coeficientes[0], 4) : `−${fmtS(Math.abs(coeficientes[0]), 4)}`}
                {coeficientes.slice(1).map((c, k) => (
                  <span key={k}>
                    {c >= 0 ? " + " : " − "}
                    {fmtS(Math.abs(c), 4)}·x{k > 0 ? <sup>{k + 1}</sup> : null}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── construirPassos ───────────────────────────────────────────────────────────
function construirPassos(pontos, grau, somasData, coeficientes, r2, ssRes, ssTot) {
  const n   = pontos.length;
  const xs  = pontos.map(p => p[0]);
  const ys  = pontos.map(p => p[1]);
  const fases = [];

  // ── Fase 0: Somas ────────────────────────────────────────────────────────
  const somaSubpassos = [
    {
      id: "sum_x", perguntaTexto: "Σxᵢ",
      pergunta: `Σxᵢ = ${xs.map(x => fmt(x, 4)).join(" + ")} = ?`,
      dica: xs.map((x, i) => `x${SUB[i]} = ${fmt(x, 4)}`).join("\n") + `\nΣxᵢ = ${fmtS(somasData.sum_x, 6)}`,
      esperado: somasData.sum_x,
      contextoSubpasso: "Σxᵢ é a soma simples de todos os valores de x. Aparece em todas as colunas do sistema normal.",
    },
    {
      id: "sum_y", perguntaTexto: "Σyᵢ",
      pergunta: `Σyᵢ = ${ys.map(y => fmt(y, 4)).join(" + ")} = ?`,
      dica: ys.map((y, i) => `y${SUB[i]} = ${fmt(y, 4)}`).join("\n") + `\nΣyᵢ = ${fmtS(somasData.sum_y, 6)}`,
      esperado: somasData.sum_y,
      contextoSubpasso: null,
    },
    {
      id: "sum_x2", perguntaTexto: "Σxᵢ²",
      pergunta: `Σxᵢ² = ${xs.map(x => `(${fmt(x, 4)})²`).join(" + ")} = ?`,
      dica: xs.map((x, i) => `(${fmt(x, 4)})² = ${fmt(x * x, 4)}`).join("\n") + `\nΣxᵢ² = ${fmtS(somasData.sum_x2, 6)}`,
      esperado: somasData.sum_x2,
      contextoSubpasso: null,
    },
    {
      id: "sum_xy", perguntaTexto: "Σxᵢyᵢ",
      pergunta: `Σxᵢyᵢ = ${xs.map((x, i) => `${fmt(x, 4)}·${fmt(ys[i], 4)}`).join(" + ")} = ?`,
      dica: xs.map((x, i) => `${fmt(x, 4)}·${fmt(ys[i], 4)} = ${fmt(x * ys[i], 4)}`).join("\n") + `\nΣxᵢyᵢ = ${fmtS(somasData.sum_xy, 6)}`,
      esperado: somasData.sum_xy,
      contextoSubpasso: null,
    },
  ];

  if (grau >= 2) {
    somaSubpassos.push(
      {
        id: "sum_x3", perguntaTexto: "Σxᵢ³",
        pergunta: `Σxᵢ³ = ${xs.map(x => `(${fmt(x, 4)})³`).join(" + ")} = ?`,
        dica: xs.map((x, i) => `(${fmt(x, 4)})³ = ${fmt(x * x * x, 4)}`).join("\n") + `\nΣxᵢ³ = ${fmtS(somasData.sum_x3, 6)}`,
        esperado: somasData.sum_x3,
        contextoSubpasso: null,
      },
      {
        id: "sum_x4", perguntaTexto: "Σxᵢ⁴",
        pergunta: `Σxᵢ⁴ = ${xs.map(x => `(${fmt(x, 4)})⁴`).join(" + ")} = ?`,
        dica: xs.map((x, i) => `(${fmt(x, 4)})⁴ = ${fmt(x * x * x * x, 4)}`).join("\n") + `\nΣxᵢ⁴ = ${fmtS(somasData.sum_x4, 6)}`,
        esperado: somasData.sum_x4,
        contextoSubpasso: null,
      },
      {
        id: "sum_x2y", perguntaTexto: "Σxᵢ²yᵢ",
        pergunta: `Σxᵢ²yᵢ = ${xs.map((x, i) => `(${fmt(x, 4)})²·${fmt(ys[i], 4)}`).join(" + ")} = ?`,
        dica: xs.map((x, i) => `(${fmt(x, 4)})²·${fmt(ys[i], 4)} = ${fmt(x * x * ys[i], 4)}`).join("\n") + `\nΣxᵢ²yᵢ = ${fmtS(somasData.sum_x2y, 6)}`,
        esperado: somasData.sum_x2y,
        contextoSubpasso: null,
      },
    );
  }

  fases.push({
    faseLabel: "Somas",
    subtitulo: "Cálculo das somas auxiliares",
    contexto: [{
      titulo: grau === 1 ? "Mínimos Quadrados — Ajuste Linear" : `Mínimos Quadrados — Ajuste de Grau ${grau}`,
      texto: grau === 1
        ? `Modelo: y = a₀ + a₁·x\n\nO sistema normal 2×2 precisa de:\n  Σxᵢ,  Σyᵢ,  Σxᵢ²,  Σxᵢyᵢ`
        : grau === 2
        ? `Modelo: y = a₀ + a₁·x + a₂·x²\n\nO sistema normal 3×3 precisa de:\n  Σxᵢ,  Σyᵢ,  Σxᵢ²,  Σxᵢyᵢ,  Σxᵢ³,  Σxᵢ⁴,  Σxᵢ²yᵢ`
        : `Modelo: y = a₀ + a₁·x + a₂·x² + a₃·x³\n\nO sistema normal 4×4 precisa de todas as somas até Σxᵢ⁶.`,
    }],
    subpassos: somaSubpassos,
  });

  // ── Fase 1: Coeficientes ──────────────────────────────────────────────────
  let sistemaTexto;
  const s = somasData;
  if (grau === 1) {
    sistemaTexto =
      `Sistema Normal (2×2):\n` +
      `[${s.n}        ${fmtS(s.sum_x, 4)} ] [a₀]   [${fmtS(s.sum_y, 4)} ]\n` +
      `[${fmtS(s.sum_x, 4)}  ${fmtS(s.sum_x2, 4)}] [a₁] = [${fmtS(s.sum_xy, 4)}]\n\n` +
      `Resolva por eliminação de Gauss para encontrar a₀ e a₁.`;
  } else if (grau === 2) {
    sistemaTexto =
      `Sistema Normal (3×3):\n` +
      `[${s.n}       ${fmtS(s.sum_x, 4)}  ${fmtS(s.sum_x2, 4)}] [a₀]   [${fmtS(s.sum_y, 4)}  ]\n` +
      `[${fmtS(s.sum_x, 4)}  ${fmtS(s.sum_x2, 4)}  ${fmtS(s.sum_x3, 4)}] [a₁] = [${fmtS(s.sum_xy, 4)} ]\n` +
      `[${fmtS(s.sum_x2, 4)}  ${fmtS(s.sum_x3, 4)}  ${fmtS(s.sum_x4, 4)}] [a₂]   [${fmtS(s.sum_x2y, 4)}]\n\n` +
      `Resolva por eliminação de Gauss para encontrar a₀, a₁ e a₂.`;
  } else {
    sistemaTexto = `Sistema Normal (4×4) — resolva por eliminação de Gauss.`;
  }

  const coefSubpassos = coeficientes.map((c, k) => ({
    id: `a${k}`,
    perguntaTexto: `a${SUB[k]}`,
    pergunta: `a${SUB[k]} = ? (do sistema normal acima)`,
    dica: `O sistema normal é resolvido por eliminação de Gauss.\na${SUB[k]} = ${fmtS(c, 8)}\n\n${k === 0 && grau === 1 ? `Fórmula direta:\na₀ = (Σy·Σx² − Σx·Σxy) / (n·Σx² − (Σx)²)` : k === 1 && grau === 1 ? `Fórmula direta:\na₁ = (n·Σxy − Σx·Σy) / (n·Σx² − (Σx)²)` : "Use o resultado do sistema."}`,
    esperado: c,
    contextoSubpasso: null,
  }));

  fases.push({
    faseLabel: "Coeficientes",
    subtitulo: "Resolução do sistema de equações normais",
    contexto: [{ titulo: "Sistema de Equações Normais", texto: sistemaTexto }],
    subpassos: coefSubpassos,
  });

  // ── Fase 2: Ajuste ────────────────────────────────────────────────────────
  const eqPartes = coeficientes.map((c, k) => {
    if (k === 0) return fmtS(c, 4);
    const potStr = k === 1 ? "x" : `x${["²","³","⁴"][k - 2] || `^${k}`}`;
    return c >= 0 ? `+ ${fmtS(c, 4)}·${potStr}` : `− ${fmtS(Math.abs(c), 4)}·${potStr}`;
  }).join(" ");

  fases.push({
    faseLabel: "Ajuste",
    subtitulo: "Avaliação da qualidade do ajuste",
    contexto: [{
      titulo: "Coeficiente de Determinação R²",
      texto:
        `Equação ajustada: y = ${eqPartes}\n\n` +
        `R² = 1 − SS_res / SS_tot\n` +
        `  SS_res = Σ(yᵢ − ŷᵢ)² = ${fmtS(ssRes, 6)}   (soma dos erros quadráticos)\n` +
        `  SS_tot = Σ(yᵢ − ȳ)²  = ${fmtS(ssTot, 6)}   (variância total de y)\n\n` +
        `R² ∈ [0, 1] — quanto mais próximo de 1, melhor o ajuste ao conjunto de dados.`,
    }],
    subpassos: [{
      id: "r2",
      perguntaTexto: "R²",
      pergunta: `R² = 1 − ${fmtS(ssRes, 6)} ÷ ${fmtS(ssTot, 6)} = ?`,
      dica: `R² = 1 − ${fmtS(ssRes, 6)} ÷ ${fmtS(ssTot, 6)}\n    = ${fmtS(1 - ssRes / ssTot, 8)}\n    ≈ ${fmtS(r2, 6)}`,
      esperado: r2,
      contextoSubpasso: "R² mede a fração da variância de y explicada pelo modelo. R² = 1 significa ajuste perfeito.",
    }],
  });

  return fases;
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function MinimosQuadradosInterativo({ pontos, grau, resultado }) {
  const { coeficientes, r_quadrado, somas, ss_res, ss_tot } = resultado;

  const passos = useRef(null);
  if (!passos.current)
    passos.current = construirPassos(pontos, grau, somas, coeficientes, r_quadrado, ss_res, ss_tot);

  const [faseIdx,    setFaseIdx]    = useState(0);
  const [subIdx,     setSubIdx]     = useState(0);
  const [inputVal,   setInputVal]   = useState("");
  const [feedback,   setFeedback]   = useState(null);
  const [respondido, setRespondido] = useState(false);
  const [historico,  setHistorico]  = useState([]);
  const [tentativas, setTentativas] = useState(0);

  const total    = passos.current.length;
  const fase     = passos.current[faseIdx];
  const subpasso = fase?.subpassos[subIdx];

  const totalSub  = passos.current.reduce((s, f) => s + f.subpassos.length, 0);
  const doneCount = passos.current.slice(0, faseIdx).reduce((s, f) => s + f.subpassos.length, 0) + subIdx;
  const progresso = Math.round(((respondido ? doneCount + 1 : doneCount) / totalSub) * 100);

  const concluido =
    faseIdx >= total - 1 &&
    subIdx  >= (fase ? fase.subpassos.length - 1 : 0) &&
    respondido;

  function confirmar(val) {
    const v  = val !== undefined ? val : inputVal;
    const ok = checar(v, subpasso.esperado);
    setFeedback({ ok });
    if (ok) {
      setRespondido(true); setTentativas(0);
      setHistorico(h => [...h, {
        faseLabel:     fase.faseLabel,
        perguntaTexto: subpasso.perguntaTexto,
        resposta:      fmtS(subpasso.esperado, 6),
      }]);
    } else {
      setTentativas(t => t + 1);
    }
  }

  function avancar() {
    setInputVal(""); setFeedback(null); setRespondido(false); setTentativas(0);
    const proxSub = subIdx + 1;
    if (proxSub < fase.subpassos.length) {
      setSubIdx(proxSub);
    } else {
      const proxFase = faseIdx + 1;
      if (proxFase < total) { setFaseIdx(proxFase); setSubIdx(0); }
    }
  }

  // Equação final formatada para exibição no card de conclusão
  const eqFinal = coeficientes.map((c, k) => {
    if (k === 0) return fmtS(c, 6);
    const potStr = k === 1 ? "x" : `x${["²","³","⁴"][k - 2] || `^${k}`}`;
    return c >= 0 ? `+ ${fmtS(c, 6)}·${potStr}` : `− ${fmtS(Math.abs(c), 6)}·${potStr}`;
  }).join(" ");

  return (
    <div style={{ fontFamily:T.fontSans, background:T.bg, minHeight:"100vh", color:T.text, padding:"24px 20px", boxSizing:"border-box" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus { outline: none; border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        button:active { transform: scale(0.97); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"14px 20px", marginBottom:18, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap", boxShadow:T.shadow }}>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:T.text, fontFamily:T.fontSans }}>Mínimos Quadrados — Modo Interativo</div>
            <div style={{ fontSize:13, color:T.textMuted, fontFamily:T.font, marginTop:3 }}>
              {pontos.length} pontos&nbsp;&nbsp;·&nbsp;&nbsp;grau {grau}&nbsp;&nbsp;·&nbsp;&nbsp;
              {grau === 1 ? "y = a₀ + a₁·x" : grau === 2 ? "y = a₀ + a₁·x + a₂·x²" : "y = a₀ + a₁·x + a₂·x² + a₃·x³"}
            </div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12, minWidth:200 }}>
            <div style={{ flex:1, height:7, borderRadius:4, background:T.border, overflow:"hidden" }}>
              <div style={{ height:"100%", width:progresso+"%", background:`linear-gradient(90deg,#0d9488,#2563eb)`, borderRadius:4, transition:"width 0.4s ease" }} />
            </div>
            <span style={{ fontSize:14, color:T.textMuted, fontFamily:T.font, minWidth:38 }}>{progresso}%</span>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 240px", gap:18, alignItems:"start" }}>
          <div>
            {/* Mini painel de estado */}
            <PainelEstadoMQ
              grau={grau}
              somas={somas}
              coeficientes={coeficientes}
              r2={r_quadrado}
              faseIdx={faseIdx}
              subIdx={subIdx}
              respondido={respondido}
            />

            {/* Painel principal */}
            {concluido ? (
              <div style={{ background:T.greenLight, border:`1px solid ${T.greenBorder}`, borderRadius:T.radius, padding:"28px", boxShadow:T.shadow }}>
                <div style={{ fontSize:42, marginBottom:12 }}>🎉</div>
                <h3 style={{ color:T.green, marginBottom:12, fontSize:20, fontFamily:T.fontSans }}>Mínimos Quadrados concluído!</h3>
                <p style={{ fontSize:15, color:T.textMuted, lineHeight:1.7, fontFamily:T.fontSans, marginBottom:16 }}>
                  O polinômio de grau <strong style={{ color:T.text }}>{grau}</strong> que melhor se ajusta aos{" "}
                  <strong style={{ color:T.text }}>{pontos.length}</strong> dados é:
                </p>
                <div style={{ background:"white", border:`2px solid ${T.greenBorder}`, borderRadius:T.radiusSm, padding:"14px 24px", display:"inline-block", marginBottom:16 }}>
                  <span style={{ color:T.textMuted, fontFamily:T.font, fontSize:15 }}>y = </span>
                  <strong style={{ color:T.green, fontFamily:T.font, fontSize:18 }}>{eqFinal}</strong>
                </div>
                <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
                  <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:"10px 16px" }}>
                    <div style={{ fontSize:11, color:T.textFaint, fontFamily:T.fontSans, marginBottom:3 }}>R²</div>
                    <div style={{ fontSize:18, fontWeight:700, color:T.primary, fontFamily:T.font }}>{fmtS(r_quadrado, 6)}</div>
                  </div>
                  <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:"10px 16px" }}>
                    <div style={{ fontSize:11, color:T.textFaint, fontFamily:T.fontSans, marginBottom:3 }}>SS_res</div>
                    <div style={{ fontSize:18, fontWeight:700, color:T.red, fontFamily:T.font }}>{fmtS(ss_res, 6)}</div>
                  </div>
                  <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:"10px 16px" }}>
                    <div style={{ fontSize:11, color:T.textFaint, fontFamily:T.fontSans, marginBottom:3 }}>SS_tot</div>
                    <div style={{ fontSize:18, fontWeight:700, color:T.textMuted, fontFamily:T.font }}>{fmtS(ss_tot, 6)}</div>
                  </div>
                </div>
              </div>
            ) : fase && subpasso ? (
              <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"20px 24px", boxShadow:T.shadow }}>
                {/* Fase header */}
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18, flexWrap:"wrap" }}>
                  <span style={{ fontSize:14, fontWeight:700, background:T.tealLight, color:T.teal, padding:"4px 14px", borderRadius:20, border:`1px solid ${T.tealBorder}`, fontFamily:T.fontSans }}>
                    {fase.faseLabel}
                  </span>
                  <span style={{ fontSize:13, color:T.textMuted, fontFamily:T.font }}>
                    {fase.subtitulo}
                  </span>
                  <span style={{ marginLeft:"auto", fontSize:13, color:T.textFaint, fontFamily:T.font }}>
                    passo {subIdx + 1} / {fase.subpassos.length}
                  </span>
                </div>

                {subIdx === 0 && <PainelContexto itens={fase.contexto} />}

                {subpasso.contextoSubpasso && (
                  <div style={{ background:T.orangeLight, border:`1px solid ${T.orangeBorder}`, borderLeft:`3px solid ${T.orange}`, borderRadius:T.radiusSm, padding:"10px 14px", marginBottom:16, fontSize:13, color:T.textMuted, lineHeight:1.65, fontFamily:T.fontSans }}>
                    {subpasso.contextoSubpasso}
                  </div>
                )}

                <p style={{ fontSize:15, fontWeight:600, color:T.text, marginBottom:16, lineHeight:1.6, fontFamily:T.font }}>
                  {subpasso.pergunta}
                </p>

                {!respondido && <DicaBox dica={subpasso.dica} tentativas={tentativas} />}

                {feedback && !feedback.ok && (
                  <div style={{ background:T.redLight, border:`1px solid ${T.redBorder}`, borderRadius:T.radiusSm, padding:"10px 14px", marginBottom:14, color:T.red, fontSize:14, fontFamily:T.fontSans }}>
                    ✗ Resposta incorreta — tente novamente.{tentativas >= 2 && " Abra a dica para o cálculo completo."}
                  </div>
                )}

                {feedback?.ok && (
                  <div style={{ background:T.greenLight, border:`1px solid ${T.greenBorder}`, borderRadius:T.radiusSm, padding:"10px 14px", marginBottom:14, color:T.green, fontSize:15, fontFamily:T.font, fontWeight:700 }}>
                    ✓ Correto! → <span style={{ color:T.text }}>{fmtS(subpasso.esperado, 6)}</span>
                  </div>
                )}

                {!respondido && (
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <input
                      type="text" value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") confirmar(); }}
                      placeholder="Sua resposta numérica" autoFocus
                      style={{ flex:1, maxWidth:260, background:T.bgSection, border:`1.5px solid ${T.borderMed}`, borderRadius:T.radiusSm, color:T.text, fontSize:16, fontFamily:T.font, padding:"10px 14px" }}
                    />
                    <button onClick={() => confirmar()} style={{ background:T.primary, color:"#fff", border:"none", borderRadius:T.radiusSm, padding:"10px 22px", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:T.fontSans }}>
                      Confirmar
                    </button>
                  </div>
                )}

                {respondido && (
                  <button onClick={avancar} style={{ marginTop:16, background:T.primary, color:"#fff", border:"none", borderRadius:T.radiusSm, padding:"10px 26px", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:T.fontSans }}>
                    Próximo →
                  </button>
                )}
              </div>
            ) : null}

            <PainelHistorico historico={historico} />
          </div>

          {/* Calculadora lateral */}
          <div style={{ position:"sticky", top:20 }}>
            <Calculadora />
          </div>
        </div>
      </div>
    </div>
  );
}
