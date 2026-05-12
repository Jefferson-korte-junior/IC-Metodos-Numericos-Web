// components/secante/SecanteInterativa.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modo interativo passo-a-passo para o Método da Secante.
// Os valores de f(xₙ₋₁), f(xₙ), denominador, xₙ₊₁ e erro vêm do backend.
//
// Props:
//   funcao          : string  — expressão original
//   x0              : number  — primeiro ponto inicial
//   x1              : number  — segundo ponto inicial
//   criterio        : string  — "absoluto" | "relativo" | "funcao"
//   tolerancia      : number  — ε
//   iteracoesBackend: Array   — [{ iteracao, x_anterior, x, fx_anterior, fx, x_novo, erro }, ...]
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from "react";

function fmt(v, casas = 5) {
  return parseFloat(Number(v).toFixed(casas));
}

function checar(digitado, esperado) {
  const raw = String(digitado).trim().replace(",", ".").replace(/\s/g, "");
  const d = parseFloat(raw);
  if (isNaN(d)) return false;
  const diff = Math.abs(d - esperado);
  if (diff < 0.001) return true;
  if (esperado === 0) return diff < 1e-4;
  return diff / Math.abs(esperado) <= 0.01;
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:           "#f1f5f9",
  bgWhite:      "#ffffff",
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
  shadow:       "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
};

// ── Calculadora científica ────────────────────────────────────────────────────
function Calculadora() {
  const [display, setDisplay] = useState("0");
  const [expr,    setExpr]    = useState("");
  const [newNum,  setNewNum]  = useState(true);

  function pressDigit(d) {
    if (newNum) { setDisplay(d === "." ? "0." : d); setNewNum(false); }
    else {
      if (d === "." && display.includes(".")) return;
      setDisplay(display === "0" && d !== "." ? d : display + d);
    }
  }
  function pressOp(op) { setExpr(display + " " + op + " "); setNewNum(true); }
  function calcular() {
    try {
      const full = expr + display;
      // eslint-disable-next-line no-new-func
      const res = Function(`return (${full})`)();
      setDisplay(isFinite(res) ? String(parseFloat(res.toFixed(12))) : "Erro");
      setExpr(""); setNewNum(true);
    } catch { setDisplay("Erro"); setExpr(""); setNewNum(true); }
  }
  function pressFunc(fn) {
    try {
      const v = parseFloat(display);
      let res;
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
    num: { bg:"#f1f5f9", fg:T.text,    hov:"#e2e8f0" },
    op:  { bg:"#eff6ff", fg:T.primary, hov:"#dbeafe" },
    fn:  { bg:"#f8fafc", fg:"#475569", hov:"#e9eef5" },
    eq:  { bg:T.primary, fg:"#fff",    hov:"#1d4ed8"  },
    del: { bg:"#fef2f2", fg:T.red,     hov:"#fee2e2"  },
  };
  function Btn({ label, onClick, theme = "num", wide = false }) {
    const th = themes[theme];
    const [hov, setHov] = useState(false);
    return (
      <button onClick={onClick}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? th.hov : th.bg, color: th.fg,
          border: "1px solid #e2e8f0", borderRadius: T.radiusXs,
          fontSize: 13,
          fontFamily: theme === "num" || theme === "op" || theme === "eq" ? T.font : T.fontSans,
          fontWeight: theme === "eq" || theme === "op" ? 700 : 400,
          cursor: "pointer", padding: "8px 4px",
          gridColumn: wide ? "span 2" : undefined,
          transition: "background 0.1s", userSelect: "none",
        }}>
        {label}
      </button>
    );
  }

  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:14, boxShadow:T.shadow }}>
      <div style={{ fontSize:11, fontWeight:700, color:T.textFaint, textTransform:"uppercase", letterSpacing:1, marginBottom:10, fontFamily:T.fontSans }}>
        Calculadora
      </div>
      <div style={{ background:T.bgSection, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:"8px 12px", marginBottom:10, textAlign:"right", minHeight:60 }}>
        <div style={{ fontSize:11, color:T.textFaint, fontFamily:T.font, minHeight:16, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{expr || " "}</div>
        <div style={{ fontSize: display.length > 14 ? 13 : display.length > 10 ? 16 : 22, fontWeight:700, color:T.text, fontFamily:T.font, wordBreak:"break-all", lineHeight:1.2 }}>{display}</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:4 }}>
        <Btn label="sin" onClick={() => pressFunc("sin")} theme="fn" />
        <Btn label="cos" onClick={() => pressFunc("cos")} theme="fn" />
        <Btn label="tan" onClick={() => pressFunc("tan")} theme="fn" />
        <Btn label="√"   onClick={() => pressFunc("√")}  theme="fn" />
        <Btn label="log" onClick={() => pressFunc("log")} theme="fn" />
        <Btn label="ln"  onClick={() => pressFunc("ln")}  theme="fn" />
        <Btn label="x²"  onClick={() => pressFunc("x²")}  theme="fn" />
        <Btn label="1/x" onClick={() => pressFunc("1/x")} theme="fn" />
        <Btn label="π"   onClick={() => pressFunc("π")}   theme="fn" />
        <Btn label="e"   onClick={() => pressFunc("e")}   theme="fn" />
        <Btn label="±"   onClick={() => pressFunc("±")}   theme="fn" />
        <Btn label="⌫"   onClick={backspace}              theme="del" />
        <Btn label="C"   onClick={limpar}                 theme="del" />
        <Btn label="("   onClick={() => { setExpr(expr + "("); setNewNum(true); }} theme="op" />
        <Btn label=")"   onClick={() => { setExpr(expr + display + ")"); setDisplay("0"); setNewNum(true); }} theme="op" />
        <Btn label="÷"   onClick={() => pressOp("/")}     theme="op" />
        <Btn label="7"   onClick={() => pressDigit("7")} />
        <Btn label="8"   onClick={() => pressDigit("8")} />
        <Btn label="9"   onClick={() => pressDigit("9")} />
        <Btn label="×"   onClick={() => pressOp("*")}    theme="op" />
        <Btn label="4"   onClick={() => pressDigit("4")} />
        <Btn label="5"   onClick={() => pressDigit("5")} />
        <Btn label="6"   onClick={() => pressDigit("6")} />
        <Btn label="−"   onClick={() => pressOp("-")}    theme="op" />
        <Btn label="1"   onClick={() => pressDigit("1")} />
        <Btn label="2"   onClick={() => pressDigit("2")} />
        <Btn label="3"   onClick={() => pressDigit("3")} />
        <Btn label="+"   onClick={() => pressOp("+")}    theme="op" />
        <Btn label="0"   onClick={() => pressDigit("0")} wide />
        <Btn label="."   onClick={() => pressDigit(".")} />
        <Btn label="="   onClick={calcular}              theme="eq" />
      </div>
      <div style={{ marginTop:8, fontSize:11, color:T.textFaint, fontFamily:T.fontSans }}>
        sin/cos/tan em graus (DEG)
      </div>
    </div>
  );
}

// ── Painel de dica ────────────────────────────────────────────────────────────
function DicaBox({ dica, tentativas }) {
  const [aberto, setAberto] = useState(false);
  const completa = tentativas >= 2;
  return (
    <div style={{ marginBottom: 14 }}>
      <button onClick={() => setAberto(v => !v)} style={{
        background:"transparent", border:`1px solid ${T.yellowBorder}`,
        color:T.yellow, borderRadius:T.radiusXs,
        padding:"5px 14px", fontSize:13, fontFamily:T.fontSans,
        cursor:"pointer", display:"flex", alignItems:"center", gap:6,
      }}>
        💡 {aberto ? "Ocultar dica" : "Ver dica"}
      </button>
      {aberto && (
        <div style={{ marginTop:8, background:T.yellowLight, border:`1px solid ${T.yellowBorder}`, borderRadius:T.radiusSm, padding:"10px 14px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.yellow, marginBottom:6, fontFamily:T.fontSans }}>
            {completa ? "DICA COMPLETA" : "DICA PARCIAL"}
          </div>
          {completa ? (
            <p style={{ margin:0, fontSize:14, color:T.textMuted, lineHeight:1.7, fontFamily:T.fontSans, whiteSpace:"pre-line" }}>{dica}</p>
          ) : (
            <>
              <p style={{ margin:0, fontSize:14, color:T.textMuted, lineHeight:1.7, fontFamily:T.fontSans }}>{dica.split("=")[0].trim()}</p>
              <p style={{ margin:"6px 0 0", fontSize:12, color:T.textFaint, fontStyle:"italic", fontFamily:T.fontSans }}>Erre mais uma vez para ver o cálculo detalhado.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Painel de contexto ────────────────────────────────────────────────────────
function PainelContexto({ itens }) {
  if (!itens?.length) return null;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
      {itens.map((item, i) => (
        <div key={i} style={{ background:T.primaryLight, border:`1px solid ${T.primaryBorder}`, borderLeft:`3px solid ${T.primary}`, borderRadius:T.radiusSm, padding:"11px 15px" }}>
          {item.titulo && <div style={{ fontSize:12, fontWeight:700, color:T.primary, marginBottom:5, fontFamily:T.fontSans }}>{item.titulo}</div>}
          <p style={{ margin:0, fontSize:14, color:T.textMuted, lineHeight:1.65, fontFamily:T.fontSans, whiteSpace:"pre-line" }}>{item.texto}</p>
        </div>
      ))}
    </div>
  );
}

// ── Painel de histórico ───────────────────────────────────────────────────────
function PainelHistorico({ historico }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [historico.length]);

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
      <div ref={ref} style={{ background:T.bgSection, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:14, maxHeight:320, overflowY:"auto", display:"flex", flexDirection:"column", gap:16, boxShadow:"inset 0 1px 3px rgba(0,0,0,0.04)" }}>
        {grupos.map((grupo, gi) => (
          <div key={gi}>
            <div style={{ fontSize:12, fontWeight:700, color:T.primary, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8, paddingBottom:6, borderBottom:`1px solid ${T.primaryBorder}`, fontFamily:T.fontSans }}>
              {grupo.faseLabel}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(210px, 1fr))", gap:6 }}>
              {grupo.itens.map((item, ii) => (
                <div key={ii} style={{ background:T.bgWhite, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:13, color:T.textMuted, lineHeight:1.3, fontFamily:T.font }}>{item.perguntaTexto}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:T.green, whiteSpace:"nowrap", fontFamily:T.font }}>✓ {item.resposta}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Painel "estado da iteração atual" — mini-tabela com valores revelados ─────
// subpassos Secante: [0]=fx_ant, [1]=fx, [2]=denominador, [3]=x_novo, [4]=erro
function PainelEstadoSecante({ fase, subIdx, respondido }) {
  if (!fase) return null;

  const numRevelados = subIdx + (respondido ? 1 : 0);
  const sp = fase.subpassos;

  const colunas = [
    { header: "xₙ₋₁",     value: fase.xAnterior,     revelaEm: 0 },
    { header: "xₙ",        value: fase.xAtual,         revelaEm: 0 },
    { header: "f(xₙ₋₁)",  value: sp[0]?.esperado,    revelaEm: 1 },
    { header: "f(xₙ)",    value: sp[1]?.esperado,    revelaEm: 2 },
    { header: "xₙ₊₁",    value: sp[3]?.esperado,    revelaEm: 4 },
    { header: "erro",     value: sp[4]?.esperado,    revelaEm: 5 },
  ];

  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"14px 16px", marginBottom:16, boxShadow:T.shadow }}>
      <div style={{ fontSize:12, fontWeight:600, color:T.textFaint, marginBottom:10, fontFamily:T.fontSans, textTransform:"uppercase", letterSpacing:0.6 }}>
        Iteração atual — {fase.faseLabel}
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ borderCollapse:"collapse", fontSize:13, width:"100%" }}>
          <thead>
            <tr style={{ background:T.bgSection }}>
              {colunas.map(c => (
                <th key={c.header} style={{ padding:"7px 14px", textAlign:"left", fontWeight:600, color:T.primary, fontFamily:T.font, borderBottom:`2px solid ${T.primaryBorder}`, whiteSpace:"nowrap" }}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {colunas.map(c => {
                const revelado = numRevelados >= c.revelaEm;
                return (
                  <td key={c.header} style={{ padding:"9px 14px", fontFamily:T.font, color: revelado ? T.text : T.textFaint, background: revelado ? "white" : T.bgSection, fontWeight: revelado ? 600 : 400 }}>
                    {revelado
                      ? (typeof c.value === "number" ? fmt(c.value, 6) : c.value)
                      : "?"}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      {/* Denominador (passo intermediário) — revelado quando subpasso 2 concluído */}
      {numRevelados >= 3 && sp[2] && (
        <div style={{ marginTop:10, fontSize:13, fontFamily:T.font, color:T.textMuted }}>
          Denominador: f(xₙ) − f(xₙ₋₁) ={" "}
          <strong style={{ color:T.text }}>{fmt(sp[2].esperado, 6)}</strong>
        </div>
      )}
    </div>
  );
}

// ── Construção dos passos didáticos ───────────────────────────────────────────
function construirPassos(funcao, criterio, tolerancia, iteracoesBackend) {
  return iteracoesBackend.map(it => {
    const { iteracao, x_anterior, x, fx_anterior, fx, x_novo, erro } = it;
    const denominador = fx - fx_anterior;

    const erroSubpasso = (() => {
      if (criterio === "relativo") {
        return {
          perguntaTexto: "erro relativo",
          pergunta: `Calcule o erro relativo: |xₙ₊₁ − xₙ| / |xₙ₊₁|`,
          dica: `|${fmt(x_novo,6)} − ${fmt(x,6)}| / |${fmt(x_novo,6)}| = ${fmt(Math.abs(x_novo - x) / Math.abs(x_novo), 8)}`,
          contextoSubpasso: "O erro relativo normaliza a diferença pelo valor atual.",
        };
      }
      if (criterio === "funcao") {
        return {
          perguntaTexto: "erro = |f(xₙ)|",
          pergunta: `Calcule o erro: |f(xₙ)| = |${fmt(fx, 6)}|`,
          dica: `|${fmt(fx, 6)}|`,
          contextoSubpasso: "|f(xₙ)| mede diretamente quão perto estamos de f(x) = 0.",
        };
      }
      return {
        perguntaTexto: "erro = |xₙ₊₁ − xₙ|",
        pergunta: `Calcule o erro absoluto: |xₙ₊₁ − xₙ| = |${fmt(x_novo,6)} − ${fmt(x,6)}|`,
        dica: `|${fmt(x_novo,6)} − ${fmt(x,6)}| = |${fmt(x_novo - x, 6)}|`,
        contextoSubpasso: null,
      };
    })();

    return {
      faseLabel:  `Iteração ${iteracao}`,
      subtitulo:  `Iteração ${iteracao}`,
      xAnterior:  x_anterior,
      xAtual:     x,
      xNovo:      x_novo,
      convergiu:  erro <= tolerancia,
      contexto: [
        {
          titulo: "Pontos atuais",
          texto: `xₙ₋₁ = ${fmt(x_anterior, 6)},   xₙ = ${fmt(x, 6)}\n\nFórmula da Secante:\n  xₙ₊₁ = (xₙ₋₁ · f(xₙ) − xₙ · f(xₙ₋₁)) / (f(xₙ) − f(xₙ₋₁))`,
        },
      ],
      subpassos: [
        {
          id: `i${iteracao}_fxant`,
          perguntaTexto: `f(xₙ₋₁) = f(${fmt(x_anterior, 6)})`,
          pergunta: `Avalie f(xₙ₋₁): calcule f(${fmt(x_anterior, 6)})`,
          dica: `Substitua x = ${fmt(x_anterior, 6)} na função: f(x) = ${funcao}`,
          esperado: fx_anterior,
          tipo: "numero",
          contextoSubpasso: iteracao === 1
            ? "Este é f(x₀) — o valor da função no primeiro ponto inicial."
            : null,
        },
        {
          id: `i${iteracao}_fx`,
          perguntaTexto: `f(xₙ) = f(${fmt(x, 6)})`,
          pergunta: `Avalie f(xₙ): calcule f(${fmt(x, 6)})`,
          dica: `Substitua x = ${fmt(x, 6)} na função: f(x) = ${funcao}`,
          esperado: fx,
          tipo: "numero",
          contextoSubpasso: null,
        },
        {
          id: `i${iteracao}_denom`,
          perguntaTexto: `f(xₙ) − f(xₙ₋₁)`,
          pergunta: `Calcule o denominador: f(xₙ) − f(xₙ₋₁) = ${fmt(fx, 6)} − (${fmt(fx_anterior, 6)})`,
          dica: `${fmt(fx, 6)} − (${fmt(fx_anterior, 6)}) = ${fmt(denominador, 8)}`,
          esperado: denominador,
          tipo: "numero",
          contextoSubpasso: "Se o denominador for zero, o método falha — os dois pontos têm o mesmo valor de f.",
        },
        {
          id: `i${iteracao}_xnovo`,
          perguntaTexto: `xₙ₊₁ (fórmula da secante)`,
          pergunta: `Aplique a fórmula: xₙ₊₁ = (${fmt(x_anterior,6)}·(${fmt(fx,6)}) − ${fmt(x,6)}·(${fmt(fx_anterior,6)})) / (${fmt(denominador,6)})`,
          dica: `Numerador: ${fmt(x_anterior,6)} × ${fmt(fx,6)} − ${fmt(x,6)} × ${fmt(fx_anterior,6)}\nDenominador: ${fmt(denominador,6)}\nResultado: ${fmt(x_novo, 8)}`,
          esperado: x_novo,
          tipo: "numero",
          contextoSubpasso: "xₙ₊₁ é onde a reta secante pelos pontos (xₙ₋₁, f(xₙ₋₁)) e (xₙ, f(xₙ)) cruza o eixo x.",
        },
        {
          id: `i${iteracao}_erro`,
          ...erroSubpasso,
          esperado: erro,
          tipo: "numero",
        },
      ],
    };
  });
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function SecanteInterativa({ funcao, x0, x1, criterio, tolerancia, iteracoesBackend = [] }) {
  const tol = +tolerancia;

  const passos = useRef(null);
  if (!passos.current) {
    passos.current = construirPassos(funcao, criterio, tol, iteracoesBackend);
  }

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

  const concluido = faseIdx >= total - 1 &&
                    subIdx  >= (fase ? fase.subpassos.length - 1 : 0) &&
                    respondido;

  const ultimaFase = passos.current[total - 1];

  function confirmar(valorOverride) {
    const val = valorOverride !== undefined ? valorOverride : inputVal;
    const ok  = checar(val, subpasso.esperado);
    setFeedback({ ok });
    if (ok) {
      setRespondido(true);
      setTentativas(0);
      setHistorico(h => [...h, {
        faseLabel:     fase.faseLabel,
        perguntaTexto: subpasso.perguntaTexto,
        resposta:      String(fmt(subpasso.esperado, 6)),
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

  return (
    <div style={{ fontFamily:T.fontSans, background:T.bg, minHeight:"100vh", color:T.text, padding:"24px 20px", boxSizing:"border-box" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #94a3b8; }
        input:focus { outline: none; border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        button:active { transform: scale(0.97); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 1120 }}>

        {/* Header */}
        <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"14px 20px", marginBottom:18, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap", boxShadow:T.shadow }}>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:T.text, fontFamily:T.fontSans }}>Método da Secante</div>
            <div style={{ fontSize:14, color:T.textMuted, fontFamily:T.font, marginTop:3 }}>
              f(x) = {funcao}&nbsp;&nbsp;·&nbsp;&nbsp;x₀ = {fmt(x0, 6)}&nbsp;&nbsp;·&nbsp;&nbsp;x₁ = {fmt(x1, 6)}&nbsp;&nbsp;·&nbsp;&nbsp;ε = {tol}
            </div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12, minWidth:220 }}>
            <div style={{ flex:1, height:7, borderRadius:4, background:T.border, overflow:"hidden" }}>
              <div style={{ height:"100%", width:progresso+"%", background:`linear-gradient(90deg, ${T.primary}, #60a5fa)`, borderRadius:4, transition:"width 0.4s ease" }} />
            </div>
            <span style={{ fontSize:14, color:T.textMuted, fontFamily:T.font, minWidth:38 }}>{progresso}%</span>
          </div>
        </div>

        {/* Duas colunas */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 240px", gap:18, alignItems:"start" }}>

          {/* Coluna esquerda */}
          <div>
            {/* Mini-tabela de estado da iteração atual */}
            {fase && <PainelEstadoSecante fase={fase} subIdx={subIdx} respondido={respondido} />}

            {/* Painel principal */}
            {concluido ? (
              <div style={{ background:T.greenLight, border:`1px solid ${T.greenBorder}`, borderRadius:T.radius, padding:"30px 28px", boxShadow:T.shadow }}>
                <div style={{ fontSize:48, marginBottom:14 }}>🎉</div>
                <h3 style={{ color:T.green, marginBottom:12, fontSize:22, fontFamily:T.fontSans }}>Método da Secante concluído!</h3>
                <p style={{ fontSize:16, color:T.textMuted, lineHeight:1.7, fontFamily:T.fontSans }}>
                  Após <strong style={{ color:T.text }}>{total}</strong> iteração(ões), a raiz aproximada é{" "}
                  <strong style={{ color:T.green, fontFamily:T.font, fontSize:18 }}>
                    x ≈ {fmt(ultimaFase?.xNovo, 6)}
                  </strong>{" "}
                  com erro &lt; <strong>{tol}</strong>.
                </p>
              </div>
            ) : fase && subpasso ? (
              <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"20px 24px", boxShadow:T.shadow }}>
                {/* Cabeçalho */}
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18, flexWrap:"wrap" }}>
                  <span style={{ fontSize:14, fontWeight:700, background:T.primaryLight, color:T.primary, padding:"4px 14px", borderRadius:20, border:`1px solid ${T.primaryBorder}`, fontFamily:T.fontSans }}>
                    {fase.subtitulo}
                  </span>
                  <span style={{ fontSize:14, color:T.textMuted, fontFamily:T.font }}>
                    xₙ₋₁ = {fmt(fase.xAnterior, 6)}&nbsp;&nbsp;xₙ = {fmt(fase.xAtual, 6)}
                  </span>
                  <span style={{ marginLeft:"auto", fontSize:13, color:T.textFaint, fontFamily:T.font }}>
                    passo {subIdx + 1} / {fase.subpassos.length}
                  </span>
                </div>

                {subIdx === 0 && <PainelContexto itens={fase.contexto} />}

                {subpasso.contextoSubpasso && (
                  <div style={{ background:T.orangeLight, border:`1px solid ${T.orangeBorder}`, borderLeft:`3px solid ${T.orange}`, borderRadius:T.radiusSm, padding:"10px 14px", marginBottom:16, fontSize:14, color:T.textMuted, lineHeight:1.65, fontFamily:T.fontSans }}>
                    {subpasso.contextoSubpasso}
                  </div>
                )}

                <p style={{ fontSize:16, fontWeight:600, color:T.text, marginBottom:16, lineHeight:1.5, fontFamily:T.fontSans }}>
                  {subpasso.pergunta}
                </p>

                {!respondido && <DicaBox dica={subpasso.dica} tentativas={tentativas} />}

                {feedback && !feedback.ok && (
                  <div style={{ background:T.redLight, border:`1px solid ${T.redBorder}`, borderRadius:T.radiusSm, padding:"10px 14px", marginBottom:14, color:T.red, fontSize:14, fontFamily:T.fontSans }}>
                    ✗ Resposta incorreta — tente novamente.
                    {tentativas >= 2 && " Abra a dica para ver o cálculo detalhado."}
                  </div>
                )}

                {feedback?.ok && (
                  <div style={{ background:T.greenLight, border:`1px solid ${T.greenBorder}`, borderRadius:T.radiusSm, padding:"10px 14px", marginBottom:14, color:T.green, fontSize:15, fontFamily:T.font, fontWeight:700 }}>
                    ✓ Correto! → <span style={{ color:T.text }}>{fmt(subpasso.esperado, 6)}</span>
                  </div>
                )}

                {!respondido && (
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <input
                      type="text"
                      value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") confirmar(); }}
                      placeholder="Sua resposta numérica"
                      autoFocus
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

          {/* Coluna direita: calculadora fixa */}
          <div style={{ position:"sticky", top:20 }}>
            <Calculadora />
          </div>
        </div>
      </div>
    </div>
  );
}
