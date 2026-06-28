// components/interpolacao/NewtonInterpolacaoInterativo.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modo interativo passo-a-passo para a Interpolação de Newton.
//
// Para cada termo k do polinômio de Newton, o aluno calcula:
//   1. Produto base ωₖ = Π_{j<k}(x_eval − xⱼ)   [apenas para k ≥ 1]
//   2. Contribuição  = cₖ × ωₖ
// Fase final: P(x_eval) = Σ contribuições
//
// Props:
//   pontos       : [x, y][]  — pontos de interpolação
//   x_eval       : number    — ponto onde avaliar
//   coeficientes : number[]  — [c0, c1, ..., cn-1]
//   termos       : object[]  — resposta do backend por termo
//   resultado    : number    — P(x_eval) final
// ─────────────────────────────────────────────────────────────────────────────

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

// ── Dica ─────────────────────────────────────────────────────────────────────
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

// ── Contexto ──────────────────────────────────────────────────────────────────
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

// ── Histórico ─────────────────────────────────────────────────────────────────
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
      <div ref={ref} style={{ background:T.bgSection, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:14, maxHeight:280, overflowY:"auto", display:"flex", flexDirection:"column", gap:14, boxShadow:"inset 0 1px 3px rgba(0,0,0,0.04)" }}>
        {grupos.map((grupo, gi) => (
          <div key={gi}>
            <div style={{ fontSize:12, fontWeight:700, color:T.primary, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8, paddingBottom:6, borderBottom:`1px solid ${T.primaryBorder}`, fontFamily:T.fontSans }}>{grupo.faseLabel}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:6 }}>
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

// ── Painel de estado dos termos de Newton ─────────────────────────────────────
function PainelEstadoNewton({ faseIdx, subIdx, respondido, termos, resultado }) {
  const n = termos.length;
  const isSomaFase = faseIdx >= n;

  function isContribuicaoRevelada(k) {
    const temProduto = k > 0;
    const idxContrib = temProduto ? 1 : 0;
    if (faseIdx > k) return true;
    if (faseIdx === k && (subIdx > idxContrib || (subIdx === idxContrib && respondido))) return true;
    return false;
  }
  const somaRevelada = isSomaFase && subIdx === 0 && respondido;

  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"14px 16px", marginBottom:16, boxShadow:T.shadow }}>
      <div style={{ fontSize:12, fontWeight:600, color:T.textFaint, marginBottom:10, fontFamily:T.fontSans, textTransform:"uppercase", letterSpacing:0.6 }}>
        Construção do Polinômio
      </div>
      <table style={{ borderCollapse:"collapse", fontSize:13, width:"100%" }}>
        <thead>
          <tr style={{ background:T.bgSection }}>
            {["k", "cₖ", "ωₖ(x)", "Contribuição"].map(h => (
              <th key={h} style={{ padding:"7px 10px", textAlign:"left", fontWeight:600, color:T.primary, fontFamily:T.font, borderBottom:`2px solid ${T.primaryBorder}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {termos.map((t, k) => {
            const contribRev = isContribuicaoRevelada(k);
            const ativo = faseIdx === k;
            return (
              <tr key={k} style={{ background: ativo ? T.primaryLight : k % 2 === 0 ? "white" : T.bgSection }}>
                <td style={{ padding:"8px 10px", fontFamily:T.font, fontWeight:700, color:T.primary }}>{k}</td>
                <td style={{ padding:"8px 10px", fontFamily:T.font, color:T.textMuted }}>{fmtS(t.coef, 6)}</td>
                <td style={{ padding:"8px 10px", fontFamily:T.font, color:T.textMuted }}>
                  {k === 0 ? "1" : fmtS(t.produto_bases, 6)}
                </td>
                <td style={{ padding:"8px 10px", fontFamily:T.font, fontWeight: contribRev ? 700 : 400, color: contribRev ? T.green : T.textFaint }}>
                  {contribRev ? fmtS(t.contribuicao, 6) : ativo ? "…" : "?"}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: isSomaFase ? T.greenLight : T.bgSection, borderTop:`2px solid ${T.border}` }}>
            <td colSpan={3} style={{ padding:"8px 10px", fontFamily:T.font, fontWeight:700, color:T.textMuted, textAlign:"right" }}>
              P(x) =
            </td>
            <td style={{ padding:"8px 10px", fontFamily:T.font, fontWeight:700, color: somaRevelada ? T.green : T.textFaint, fontSize: somaRevelada ? 15 : 13 }}>
              {somaRevelada ? fmtS(resultado, 6) : "?"}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ── Expressão do produto ωₖ para exibição ────────────────────────────────────
function exprProduto(bases_xs, x_eval) {
  if (!bases_xs.length) return "1";
  return bases_xs.map(xj => `(${fmt(x_eval, 4)} − ${fmt(xj, 4)})`).join(" × ");
}

function dicaProduto(bases_xs, x_eval, produto) {
  if (!bases_xs.length) return "ω₀ = 1 (termo constante)";
  const linhas = bases_xs.map(xj => `(${fmt(x_eval, 4)} − ${fmt(xj, 4)}) = ${fmtS(x_eval - xj, 6)}`);
  linhas.push(`Produto = ${fmtS(produto, 8)}`);
  return linhas.join("\n");
}

// ── Construção dos passos didáticos ───────────────────────────────────────────
function construirPassos(pontos, x_eval, coeficientes, termos, resultado) {
  const n = pontos.length;
  const fases = [];

  termos.forEach((t, k) => {
    const temProduto = k > 0;
    const subpassos = [];

    if (temProduto) {
      subpassos.push({
        id: `t${k}_omega`,
        perguntaTexto: `ω${SUB[k]}`,
        pergunta: `ω${SUB[k]}(${fmt(x_eval, 4)}) = ${exprProduto(t.bases_xs, x_eval)} = ?`,
        dica: dicaProduto(t.bases_xs, x_eval, t.produto_bases),
        esperado: t.produto_bases,
        contextoSubpasso: k === 1
          ? "ω₁ = (x_eval − x₀). Para k ≥ 2, o produto acumula um fator adicional a cada etapa."
          : null,
      });
    }

    subpassos.push({
      id: `t${k}_contrib`,
      perguntaTexto: `Contrib${SUB[k]}`,
      pergunta: temProduto
        ? `Contribuição${SUB[k]} = c${SUB[k]} × ω${SUB[k]} = ${fmtS(t.coef, 6)} × ${fmtS(t.produto_bases, 6)} = ?`
        : `Contribuição${SUB[k]} = c${SUB[k]} = ${fmtS(t.coef, 6)} (k=0: ω₀ = 1)`,
      dica: temProduto
        ? `${fmtS(t.coef, 6)} × ${fmtS(t.produto_bases, 6)} = ${fmtS(t.contribuicao, 8)}`
        : `Contribuição₀ = c₀ = f[x₀] = ${fmtS(t.coef, 8)}`,
      esperado: t.contribuicao,
      contextoSubpasso: k === 0
        ? "O primeiro termo do polinômio de Newton é simplesmente c₀ = f[x₀] = y₀, o valor da função no primeiro ponto."
        : null,
    });

    fases.push({
      faseLabel: `Termo ${SUB[k]}`,
      subtitulo: `c${SUB[k]} × ω${SUB[k]}(x) — coeficiente f[x${SUB[0]}${k > 0 ? "…x" + SUB[k] : ""}]`,
      contexto: [{
        titulo: `Coeficiente c${SUB[k]} = f[x${SUB[0]}${k > 0 ? ", …, x" + SUB[k] : ""}]`,
        texto:
          `c${SUB[k]} = ${fmtS(t.coef, 8)}\n` +
          (temProduto
            ? `ω${SUB[k]}(x) = ${exprProduto(t.bases_xs, x_eval)}`
            : "ω₀ = 1  (sem produto para k = 0)"),
      }],
      subpassos,
    });
  });

  const somaExpr = termos.map((t, k) => fmtS(t.contribuicao, 4)).join(" + ");
  fases.push({
    faseLabel: "Resultado",
    subtitulo: "Soma Final — P(x_eval)",
    contexto: [{
      titulo: "Todas as contribuições calculadas",
      texto: termos.map((t, k) => `Contrib${SUB[k]} = ${fmtS(t.contribuicao, 6)}`).join("\n"),
    }],
    subpassos: [{
      id: "soma",
      perguntaTexto: "P(x)",
      pergunta: `P(${fmt(x_eval, 4)}) = ${somaExpr} = ?`,
      dica: `Soma de todas as contribuições:\n${termos.map((t, k) => `Contrib${SUB[k]} = ${fmtS(t.contribuicao, 6)}`).join("\n")}\nTotal = ${fmtS(resultado, 8)}`,
      esperado: resultado,
      contextoSubpasso: "O polinômio de Newton P(x) é a soma de todos os termos cₖ·ωₖ(x). O resultado é o valor interpolado no ponto solicitado.",
    }],
  });

  return fases;
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function NewtonInterpolacaoInterativo({ pontos, x_eval, coeficientes, termos, resultado }) {
  const passos = useRef(null);
  if (!passos.current) passos.current = construirPassos(pontos, x_eval, coeficientes, termos, resultado);

  const [faseIdx,    setFaseIdx]    = useState(0);
  const [subIdx,     setSubIdx]     = useState(0);
  const [inputVal,   setInputVal]   = useState("");
  const [feedback,   setFeedback]   = useState(null);
  const [respondido, setRespondido] = useState(false);
  const [historico,  setHistorico]  = useState([]);
  const [tentativas, setTentativas] = useState(0);

  const n        = pontos.length;
  const total    = passos.current.length;
  const fase     = passos.current[faseIdx];
  const subpasso = fase?.subpassos[subIdx];

  const totalSub  = passos.current.reduce((s, f) => s + f.subpassos.length, 0);
  const doneCount = passos.current.slice(0, faseIdx).reduce((s, f) => s + f.subpassos.length, 0) + subIdx;
  const progresso = Math.round(((respondido ? doneCount + 1 : doneCount) / totalSub) * 100);

  const concluido = faseIdx >= total - 1 &&
                    subIdx  >= (fase ? fase.subpassos.length - 1 : 0) &&
                    respondido;

  function confirmar(val) {
    const v = val !== undefined ? val : inputVal;
    const ok = checar(v, subpasso.esperado);
    setFeedback({ ok });
    if (ok) {
      setRespondido(true); setTentativas(0);
      setHistorico(h => [...h, {
        faseLabel: fase.faseLabel,
        perguntaTexto: subpasso.perguntaTexto,
        resposta: fmtS(subpasso.esperado, 6),
      }]);
    } else {
      setTentativas(t => t + 1);
    }
  }

  function avancar() {
    setInputVal(""); setFeedback(null); setRespondido(false); setTentativas(0);
    const proxSub = subIdx + 1;
    if (proxSub < fase.subpassos.length) { setSubIdx(proxSub); }
    else {
      const proxFase = faseIdx + 1;
      if (proxFase < total) { setFaseIdx(proxFase); setSubIdx(0); }
    }
  }

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
            <div style={{ fontSize:18, fontWeight:700, color:T.text, fontFamily:T.fontSans }}>Interpolação de Newton — Interativo</div>
            <div style={{ fontSize:13, color:T.textMuted, fontFamily:T.font, marginTop:3 }}>
              {n} pontos&nbsp;&nbsp;·&nbsp;&nbsp;grau {n - 1}&nbsp;&nbsp;·&nbsp;&nbsp;P({fmt(x_eval, 4)}) = ?
            </div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12, minWidth:200 }}>
            <div style={{ flex:1, height:7, borderRadius:4, background:T.border, overflow:"hidden" }}>
              <div style={{ height:"100%", width:progresso+"%", background:`linear-gradient(90deg,${T.primary},#60a5fa)`, borderRadius:4, transition:"width 0.4s ease" }} />
            </div>
            <span style={{ fontSize:14, color:T.textMuted, fontFamily:T.font, minWidth:38 }}>{progresso}%</span>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 240px", gap:18, alignItems:"start" }}>
          <div>
            <PainelEstadoNewton
              faseIdx={faseIdx} subIdx={subIdx}
              respondido={respondido} termos={termos} resultado={resultado}
            />

            {concluido ? (
              <div style={{ background:T.greenLight, border:`1px solid ${T.greenBorder}`, borderRadius:T.radius, padding:"28px", boxShadow:T.shadow }}>
                <div style={{ fontSize:42, marginBottom:12 }}>🎉</div>
                <h3 style={{ color:T.green, marginBottom:12, fontSize:20, fontFamily:T.fontSans }}>Newton concluído!</h3>
                <p style={{ fontSize:15, color:T.textMuted, lineHeight:1.7, fontFamily:T.fontSans, marginBottom:16 }}>
                  O polinômio de grau <strong style={{ color:T.text }}>{n - 1}</strong> avaliado no ponto{" "}
                  <strong style={{ color:T.text, fontFamily:T.font }}>x = {fmt(x_eval, 4)}</strong> vale:
                </p>
                <div style={{ background:"white", border:`2px solid ${T.greenBorder}`, borderRadius:T.radiusSm, padding:"14px 24px", display:"inline-block" }}>
                  <span style={{ color:T.textMuted, fontFamily:T.font, fontSize:15 }}>P({fmt(x_eval, 4)}) = </span>
                  <strong style={{ color:T.green, fontFamily:T.font, fontSize:22 }}>{fmtS(resultado, 6)}</strong>
                </div>
                <p style={{ marginTop:16, fontSize:13, color:T.textFaint, fontFamily:T.fontSans }}>
                  Construído com {n} termos cₖ·ωₖ(x) e coeficientes de diferenças divididas.
                </p>
              </div>
            ) : fase && subpasso ? (
              <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"20px 24px", boxShadow:T.shadow }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18, flexWrap:"wrap" }}>
                  <span style={{ fontSize:14, fontWeight:700, background:T.purpleLight, color:T.purple, padding:"4px 14px", borderRadius:20, border:`1px solid ${T.purpleBorder}`, fontFamily:T.fontSans }}>
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
                    <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
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

          <div style={{ position:"sticky", top:20 }}>
            <Calculadora />
          </div>
        </div>
      </div>
    </div>
  );
}
