import React, { useState, useRef, useEffect } from "react";

const SUB = ["₀","₁","₂","₃","₄","₅","₆","₇","₈","₉"];
function subStr(n) { return String(n).split("").map(d => SUB[+d] ?? d).join(""); }
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
  bg:"#f1f5f9", bgCard:"#ffffff", bgSection:"#f8fafc",
  primary:"#2563eb", primaryLight:"#eff6ff", primaryBorder:"#bfdbfe",
  green:"#16a34a", greenLight:"#f0fdf4", greenBorder:"#86efac",
  red:"#dc2626", redLight:"#fef2f2", redBorder:"#fca5a5",
  yellow:"#92400e", yellowLight:"#fffbeb", yellowBorder:"#fcd34d",
  orange:"#c2410c", orangeLight:"#fff7ed", orangeBorder:"#fed7aa",
  teal:"#0d9488", tealLight:"#f0fdfa", tealBorder:"#99f6e4",
  purple:"#7c3aed", purpleLight:"#f5f3ff", purpleBorder:"#ddd6fe",
  border:"#e2e8f0", borderMed:"#cbd5e1",
  text:"#0f172a", textMuted:"#475569", textFaint:"#94a3b8",
  font:"'JetBrains Mono','Fira Code',monospace",
  fontSans:"'Inter','Segoe UI',sans-serif",
  radius:"12px", radiusSm:"8px", radiusXs:"5px",
  shadow:"0 1px 3px rgba(0,0,0,0.07)",
};

function Calculadora() {
  const [display, setDisplay] = useState("0");
  const [expr, setExpr] = useState("");
  const [newNum, setNewNum] = useState(true);
  function pressDigit(d) { if(newNum){setDisplay(d==="."?"0.":d);setNewNum(false);}else{if(d==="."&&display.includes("."))return;setDisplay(display==="0"&&d!=="."?d:display+d);} }
  function pressOp(op) { setExpr((newNum?expr:expr+display+" ")+op+" ");setNewNum(true); }
  function pressLParen() { setExpr(expr+(!newNum&&display!=="0"?display+" * (":"("));setDisplay("0");setNewNum(true); }
  function pressRParen() { setExpr(expr+(newNum?"":display)+")");if(!newNum)setDisplay("0");setNewNum(true); }
  function calcular() { try { const full=(newNum?expr:expr+display).trim(); // eslint-disable-next-line no-new-func
    const res=Function(`return (${full||display})`)();setDisplay(isFinite(res)?String(parseFloat(res.toFixed(12))):"Erro");setExpr("");setNewNum(true);}catch{setDisplay("Erro");setExpr("");setNewNum(true);} }
  function pressFunc(fn) { try { const v=parseFloat(display);let res;
    if(fn==="sin")res=Math.sin(v*Math.PI/180);else if(fn==="cos")res=Math.cos(v*Math.PI/180);else if(fn==="tan")res=Math.tan(v*Math.PI/180);else if(fn==="√")res=Math.sqrt(v);else if(fn==="log")res=Math.log10(v);else if(fn==="ln")res=Math.log(v);else if(fn==="x²")res=v*v;else if(fn==="1/x")res=1/v;else if(fn==="±")res=-v;else if(fn==="π"){setDisplay(String(Math.PI));setNewNum(true);return;}else if(fn==="e"){setDisplay(String(Math.E));setNewNum(true);return;}else return;
    setDisplay(isFinite(res)?String(parseFloat(res.toFixed(12))):"Erro");setNewNum(true);}catch{setDisplay("Erro");setNewNum(true);} }
  function limpar() { setDisplay("0");setExpr("");setNewNum(true); }
  function backspace() { if(newNum||display.length<=1){setDisplay("0");setNewNum(true);}else setDisplay(display.slice(0,-1)||"0"); }
  const th={num:{bg:"#f1f5f9",fg:T.text,hov:"#e2e8f0"},op:{bg:"#eff6ff",fg:T.primary,hov:"#dbeafe"},fn:{bg:"#f8fafc",fg:"#475569",hov:"#e9eef5"},eq:{bg:T.primary,fg:"#fff",hov:"#1d4ed8"},del:{bg:"#fef2f2",fg:T.red,hov:"#fee2e2"}};
  function Btn({label,onClick,theme="num",wide=false}){const t=th[theme];const[hov,setHov]=useState(false);return(<button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:hov?t.hov:t.bg,color:t.fg,border:"1px solid #e2e8f0",borderRadius:T.radiusXs,fontSize:13,fontFamily:(theme==="num"||theme==="op"||theme==="eq")?T.font:T.fontSans,fontWeight:(theme==="eq"||theme==="op")?700:400,cursor:"pointer",padding:"8px 4px",gridColumn:wide?"span 2":undefined,transition:"background 0.1s",userSelect:"none"}}>{label}</button>);}
  return (<div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:T.radius,padding:14,boxShadow:T.shadow}}>
    <div style={{fontSize:11,fontWeight:700,color:T.textFaint,textTransform:"uppercase",letterSpacing:1,marginBottom:10,fontFamily:T.fontSans}}>Calculadora</div>
    <div style={{background:T.bgSection,border:`1px solid ${T.border}`,borderRadius:T.radiusSm,padding:"8px 12px",marginBottom:10,textAlign:"right",minHeight:60}}>
      <div style={{fontSize:11,color:T.textFaint,fontFamily:T.font,minHeight:16,marginBottom:2,overflow:"hidden",whiteSpace:"nowrap"}}>{expr||" "}</div>
      <div style={{fontSize:display.length>14?13:display.length>10?16:22,fontWeight:700,color:T.text,fontFamily:T.font,wordBreak:"break-all"}}>{display}</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
      <Btn label="sin" onClick={()=>pressFunc("sin")} theme="fn"/><Btn label="cos" onClick={()=>pressFunc("cos")} theme="fn"/><Btn label="tan" onClick={()=>pressFunc("tan")} theme="fn"/><Btn label="√" onClick={()=>pressFunc("√")} theme="fn"/>
      <Btn label="log" onClick={()=>pressFunc("log")} theme="fn"/><Btn label="ln" onClick={()=>pressFunc("ln")} theme="fn"/><Btn label="x²" onClick={()=>pressFunc("x²")} theme="fn"/><Btn label="1/x" onClick={()=>pressFunc("1/x")} theme="fn"/>
      <Btn label="π" onClick={()=>pressFunc("π")} theme="fn"/><Btn label="e" onClick={()=>pressFunc("e")} theme="fn"/><Btn label="±" onClick={()=>pressFunc("±")} theme="fn"/><Btn label="⌫" onClick={backspace} theme="del"/>
      <Btn label="C" onClick={limpar} theme="del"/><Btn label="(" onClick={pressLParen} theme="op"/><Btn label=")" onClick={pressRParen} theme="op"/><Btn label="÷" onClick={()=>pressOp("/")} theme="op"/>
      <Btn label="7" onClick={()=>pressDigit("7")}/><Btn label="8" onClick={()=>pressDigit("8")}/><Btn label="9" onClick={()=>pressDigit("9")}/><Btn label="×" onClick={()=>pressOp("*")} theme="op"/>
      <Btn label="4" onClick={()=>pressDigit("4")}/><Btn label="5" onClick={()=>pressDigit("5")}/><Btn label="6" onClick={()=>pressDigit("6")}/><Btn label="−" onClick={()=>pressOp("-")} theme="op"/>
      <Btn label="1" onClick={()=>pressDigit("1")}/><Btn label="2" onClick={()=>pressDigit("2")}/><Btn label="3" onClick={()=>pressDigit("3")}/><Btn label="+" onClick={()=>pressOp("+")} theme="op"/>
      <Btn label="0" onClick={()=>pressDigit("0")} wide/><Btn label="." onClick={()=>pressDigit(".")}/><Btn label="=" onClick={calcular} theme="eq"/>
    </div>
    <div style={{marginTop:8,fontSize:10,color:T.textFaint,fontFamily:T.fontSans,textAlign:"center"}}>sin/cos/tan em graus (DEG)</div>
  </div>);
}

function DicaBox({ dica, tentativas }) {
  const [aberto, setAberto] = useState(false);
  const completa = tentativas >= 2;
  return (
    <div style={{marginBottom:14}}>
      <button onClick={()=>setAberto(v=>!v)} style={{background:"transparent",border:`1px solid ${T.yellowBorder}`,color:T.yellow,borderRadius:T.radiusXs,padding:"5px 14px",fontSize:13,fontFamily:T.fontSans,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
        💡 {aberto?"Ocultar dica":"Ver dica"}
      </button>
      {aberto && (
        <div style={{marginTop:8,background:T.yellowLight,border:`1px solid ${T.yellowBorder}`,borderRadius:T.radiusSm,padding:"10px 14px"}}>
          <div style={{fontSize:11,fontWeight:700,color:T.yellow,marginBottom:6,fontFamily:T.fontSans}}>{completa?"DICA COMPLETA":"DICA PARCIAL"}</div>
          {completa
            ? <p style={{margin:0,fontSize:13,color:T.textMuted,lineHeight:1.7,fontFamily:T.font,whiteSpace:"pre-line"}}>{dica}</p>
            : <><p style={{margin:0,fontSize:13,color:T.textMuted,fontFamily:T.fontSans}}>{dica.split("\n")[0]}</p><p style={{margin:"6px 0 0",fontSize:12,color:T.textFaint,fontStyle:"italic",fontFamily:T.fontSans}}>Erre mais uma vez para ver o cálculo completo.</p></>}
        </div>
      )}
    </div>
  );
}

function PainelContexto({ itens }) {
  if (!itens?.length) return null;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
      {itens.map((item,i) => (
        <div key={i} style={{background:T.primaryLight,border:`1px solid ${T.primaryBorder}`,borderLeft:`3px solid ${T.primary}`,borderRadius:T.radiusSm,padding:"11px 15px"}}>
          {item.titulo && <div style={{fontSize:12,fontWeight:700,color:T.primary,marginBottom:5,fontFamily:T.fontSans}}>{item.titulo}</div>}
          <p style={{margin:0,fontSize:13,color:T.textMuted,lineHeight:1.65,fontFamily:T.font,whiteSpace:"pre-line"}}>{item.texto}</p>
        </div>
      ))}
    </div>
  );
}

function PainelHistorico({ historico }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop=ref.current.scrollHeight; }, [historico.length]);
  if (!historico.length) return null;
  const grupos = [];
  historico.forEach(item => { const ult=grupos[grupos.length-1]; if(ult&&ult.faseLabel===item.faseLabel)ult.itens.push(item); else grupos.push({faseLabel:item.faseLabel,itens:[item]}); });
  return (
    <div style={{marginTop:20}}>
      <p style={{margin:"0 0 8px",fontSize:11,fontWeight:700,color:T.textFaint,textTransform:"uppercase",letterSpacing:1,fontFamily:T.fontSans}}>Histórico</p>
      <div ref={ref} style={{background:T.bgSection,border:`1px solid ${T.border}`,borderRadius:T.radius,padding:14,maxHeight:240,overflowY:"auto",display:"flex",flexDirection:"column",gap:12}}>
        {grupos.map((g,gi) => (
          <div key={gi}>
            <div style={{fontSize:12,fontWeight:700,color:T.primary,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6,paddingBottom:4,borderBottom:`1px solid ${T.primaryBorder}`,fontFamily:T.fontSans}}>{g.faseLabel}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:5}}>
              {g.itens.map((item,ii) => (
                <div key={ii} style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:T.radiusSm,padding:"6px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                  <span style={{fontSize:13,color:T.textMuted,fontFamily:T.font}}>{item.perguntaTexto}</span>
                  <span style={{fontSize:13,fontWeight:700,color:T.green,fontFamily:T.font}}>✓ {item.resposta}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Painel de estado — pesos 1/4/2/4/.../4/1 revelados progressivamente ──────
function PainelEstadoSimpson({ pontos, h, resultado, faseIdx, subIdx, respondido }) {
  const hRev   = faseIdx > 0 || (faseIdx === 0 && respondido);
  const resRev = faseIdx > 2 || (faseIdx === 2 && respondido);

  function isFiRev(i) {
    if (faseIdx > 1) return true;
    if (faseIdx < 1) return false;
    return subIdx > i || (subIdx === i && respondido);
  }

  function pesoColor(peso) {
    if (peso === 1) return T.teal;
    if (peso === 4) return T.purple;
    return T.primary;
  }

  return (
    <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"14px 16px",marginBottom:16,boxShadow:T.shadow}}>
      <div style={{fontSize:12,fontWeight:600,color:T.textFaint,marginBottom:12,fontFamily:T.fontSans,textTransform:"uppercase",letterSpacing:0.6}}>
        Construção da Integral
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:16,alignItems:"start"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:T.font}}>
            <thead>
              <tr style={{background:T.bgSection}}>
                {["i","xᵢ","f(xᵢ)","peso","peso·f(xᵢ)"].map(h_ => (
                  <th key={h_} style={{padding:"5px 8px",textAlign:"center",color:T.textFaint,fontWeight:600,borderBottom:`1px solid ${T.border}`}}>{h_}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pontos.map((p,i) => {
                const rev = isFiRev(i);
                const pc  = pesoColor(p.peso);
                return (
                  <tr key={i} style={{background: rev ? (p.peso===1?"#f0fdfa":p.peso===4?"#f5f3ff":"#eff6ff") : "transparent"}}>
                    <td style={{padding:"5px 8px",textAlign:"center",color:T.textFaint}}>{p.i}</td>
                    <td style={{padding:"5px 8px",textAlign:"right",color:T.textMuted}}>{fmtS(p.xi,4)}</td>
                    <td style={{padding:"5px 8px",textAlign:"right",fontWeight:rev?700:400,color:rev?pc:T.textFaint}}>{rev?fmtS(p.fi,6):"?"}</td>
                    <td style={{padding:"5px 8px",textAlign:"center",color:pc,fontWeight:700}}>{p.peso}</td>
                    <td style={{padding:"5px 8px",textAlign:"right",color:rev?T.text:T.textFaint}}>{rev?fmtS(p.fi*p.peso,6):"?"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,minWidth:130}}>
          <div style={{padding:"8px 12px",borderRadius:T.radiusSm,background:hRev?T.tealLight:"#f8fafc",border:`1px solid ${hRev?T.tealBorder:T.border}`}}>
            <div style={{fontSize:10,color:T.textFaint,fontFamily:T.fontSans,marginBottom:2}}>h</div>
            <div style={{fontSize:15,fontWeight:700,color:hRev?T.teal:T.textFaint,fontFamily:T.font}}>{hRev?fmtS(h,6):"?"}</div>
          </div>
          <div style={{padding:"8px 12px",borderRadius:T.radiusSm,background:resRev?T.greenLight:"#f8fafc",border:`1px solid ${resRev?T.greenBorder:T.border}`}}>
            <div style={{fontSize:10,color:T.textFaint,fontFamily:T.fontSans,marginBottom:2}}>I ≈</div>
            <div style={{fontSize:15,fontWeight:700,color:resRev?T.green:T.textFaint,fontFamily:T.font}}>{resRev?fmtS(resultado,8):"?"}</div>
          </div>
          <div style={{padding:"6px 8px",borderRadius:T.radiusXs,background:T.bgSection,fontSize:11,fontFamily:T.font,color:T.textFaint,lineHeight:1.6}}>
            <span style={{color:T.teal}}>1</span>: extremos<br/>
            <span style={{color:T.purple}}>4</span>: ímpares<br/>
            <span style={{color:T.primary}}>2</span>: pares
          </div>
        </div>
      </div>
    </div>
  );
}

function construirPassos(dadosBE) {
  const { h, n, a, b, pontos, soma_ponderada, resultado } = dadosBE;
  const fases = [];

  fases.push({
    faseLabel: "Passo h",
    subtitulo: "Calcule o tamanho do subintervalo",
    contexto: [{
      titulo: "Regra de Simpson 1/3 Composta",
      texto:
        `I ≈ (h/3) × [f(x₀) + 4f(x₁) + 2f(x₂) + 4f(x₃) + ... + 4f(xₙ₋₁) + f(xₙ)]\n\n` +
        `Pesos: extremos → 1 | nós ímpares → 4 | nós pares internos → 2\n` +
        `h = (b − a) / n = (${b} − ${a}) / ${n}`,
    }],
    subpassos: [{
      id: "h",
      perguntaTexto: "h",
      pergunta: `h = (${b} − ${a}) / ${n} = ?`,
      dica: `h = (b − a) / n = (${b} − ${a}) / ${n}\n  = ${b - a} / ${n}\n  = ${fmtS(h, 8)}`,
      esperado: h,
      contextoSubpasso: "A regra de Simpson usa grupos de 2 subintervalos por vez — por isso n deve ser par.",
    }],
  });

  const subpassosAval = pontos.map((p, i) => {
    let dica_ =
      `x${subStr(i)} = a + ${i}·h = ${fmtS(a,4)} + ${i}·${fmtS(h,4)}\n` +
      `       = ${fmtS(p.xi,6)}\n` +
      `f(x${subStr(i)}) = f(${fmtS(p.xi,6)}) = ${fmtS(p.fi,8)}`;
    let ctx =
      i === 0 ? `x₀ = a = ${fmtS(a,4)} — ponto inicial, peso 1.`
      : i === n ? `xₙ = b = ${fmtS(b,4)} — ponto final, peso 1.`
      : i % 2 === 1 ? `x${subStr(i)} é um nó de índice ímpar — recebe peso 4 (o maior peso).`
      : `x${subStr(i)} é um nó de índice par interno — recebe peso 2.`;
    return {
      id: `f${i}`,
      perguntaTexto: `f(x${subStr(i)})`,
      pergunta: `f(x${subStr(i)}) = f(${fmtS(p.xi,4)}) = ?`,
      dica: dica_,
      esperado: p.fi,
      contextoSubpasso: ctx,
    };
  });

  fases.push({
    faseLabel: "Avaliações",
    subtitulo: "Avalie f(xᵢ) em cada nó da partição",
    contexto: [{
      titulo: "Nós com seus pesos",
      texto: pontos.map((p,i) => {
        const pc = p.peso===1?"(extremo)":p.peso===4?"(ímpar) ":"(par)   ";
        return `x${subStr(i)} = ${fmtS(p.xi,4)}  peso ${p.peso} ${pc}`;
      }).join("\n"),
    }],
    subpassos: subpassosAval,
  });

  const termos = pontos.map((p,i) => p.peso===1?fmtS(p.fi,4):`${p.peso}·${fmtS(p.fi,4)}`);
  fases.push({
    faseLabel: "Resultado",
    subtitulo: "Calcule o valor da integral",
    contexto: [{
      titulo: "Aplicando a fórmula",
      texto:
        `Σ = ${termos.join(" + ")}\n` +
        `  = ${fmtS(soma_ponderada,8)}\n\n` +
        `I ≈ (h/3) × Σ = (${fmtS(h,4)}/3) × ${fmtS(soma_ponderada,6)}`,
    }],
    subpassos: [{
      id: "resultado",
      perguntaTexto: "I",
      pergunta: `I ≈ (${fmtS(h,4)}/3) × ${fmtS(soma_ponderada,6)} = ?`,
      dica:
        `I = (h/3) × Σpeso·f(xᵢ)\n` +
        `  = (${fmtS(h,6)}/3) × ${fmtS(soma_ponderada,6)}\n` +
        `  = ${fmtS(h/3,6)} × ${fmtS(soma_ponderada,6)}\n` +
        `  = ${fmtS(resultado,8)}`,
      esperado: resultado,
      contextoSubpasso: "Simpson 1/3 ajusta parábolas a cada grupo de 3 pontos — por isso é mais preciso que os trapézios.",
    }],
  });

  return fases;
}

export default function SimpsonInterativo({ dadosBE }) {
  const passos = useRef(null);
  if (!passos.current) passos.current = construirPassos(dadosBE);

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

  const totalSub  = passos.current.reduce((s,f) => s+f.subpassos.length, 0);
  const doneCount = passos.current.slice(0,faseIdx).reduce((s,f) => s+f.subpassos.length, 0)+subIdx;
  const progresso = Math.round(((respondido?doneCount+1:doneCount)/totalSub)*100);
  const concluido = faseIdx>=total-1 && subIdx>=(fase?fase.subpassos.length-1:0) && respondido;

  function confirmar(val) {
    const v=val!==undefined?val:inputVal;
    const ok=checar(v,subpasso.esperado);
    setFeedback({ok});
    if(ok){setRespondido(true);setTentativas(0);setHistorico(h=>[...h,{faseLabel:fase.faseLabel,perguntaTexto:subpasso.perguntaTexto,resposta:fmtS(subpasso.esperado,6)}]);}
    else setTentativas(t=>t+1);
  }
  function avancar() {
    setInputVal("");setFeedback(null);setRespondido(false);setTentativas(0);
    const ps=subIdx+1;
    if(ps<fase.subpassos.length)setSubIdx(ps);
    else{const pf=faseIdx+1;if(pf<total){setFaseIdx(pf);setSubIdx(0);}}
  }
  function handleKey(e){if(e.key==="Enter"){if(respondido)avancar();else confirmar();}}

  return (
    <div style={{fontFamily:T.fontSans,background:T.bg,color:T.text,padding:"24px 20px",boxSizing:"border-box"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; }
        input:focus{outline:none;border-color:#2563eb!important;box-shadow:0 0 0 3px rgba(37,99,235,0.1);}
        button:active{transform:scale(0.97);}
        ::-webkit-scrollbar{width:6px;}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;}
      `}</style>

      <div style={{maxWidth:1100}}>
        <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"14px 20px",marginBottom:18,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",boxShadow:T.shadow}}>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:T.text,fontFamily:T.fontSans}}>Simpson 1/3 — Modo Interativo</div>
            <div style={{fontSize:13,color:T.textMuted,fontFamily:T.font,marginTop:3}}>
              n = {dadosBE.n} subintervalos&nbsp;&nbsp;·&nbsp;&nbsp;h = {fmtS(dadosBE.h,6)}&nbsp;&nbsp;·&nbsp;&nbsp;[{dadosBE.a}, {dadosBE.b}]
            </div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12,minWidth:200}}>
            <div style={{flex:1,height:7,borderRadius:4,background:T.border,overflow:"hidden"}}>
              <div style={{height:"100%",width:progresso+"%",background:"linear-gradient(90deg,#7c3aed,#2563eb)",borderRadius:4,transition:"width 0.4s ease"}}/>
            </div>
            <span style={{fontSize:14,color:T.textMuted,fontFamily:T.font,minWidth:38}}>{progresso}%</span>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 240px",gap:18,alignItems:"start"}}>
          <div>
            <PainelEstadoSimpson
              pontos={dadosBE.pontos}
              h={dadosBE.h}
              resultado={dadosBE.resultado}
              faseIdx={faseIdx}
              subIdx={subIdx}
              respondido={respondido}
            />

            {concluido ? (
              <div style={{background:T.greenLight,border:`1px solid ${T.greenBorder}`,borderRadius:T.radius,padding:"28px",boxShadow:T.shadow}}>
                <div style={{fontSize:40,marginBottom:12}}>🎉</div>
                <h3 style={{color:T.green,marginBottom:12,fontSize:20,fontFamily:T.fontSans}}>Integral calculada!</h3>
                <p style={{fontSize:15,color:T.textMuted,lineHeight:1.7,fontFamily:T.fontSans,marginBottom:16}}>
                  A Regra de Simpson 1/3 com <strong style={{color:T.text}}>{dadosBE.n}</strong> subintervalos resultou em:
                </p>
                <div style={{background:"white",border:`2px solid ${T.greenBorder}`,borderRadius:T.radiusSm,padding:"14px 24px",display:"inline-block",marginBottom:16}}>
                  <span style={{color:T.textMuted,fontFamily:T.font,fontSize:15}}>I ≈ </span>
                  <strong style={{color:T.green,fontFamily:T.font,fontSize:22}}>{fmtS(dadosBE.resultado,8)}</strong>
                </div>
                <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                  <div style={{background:"white",border:`1px solid ${T.border}`,borderRadius:T.radiusSm,padding:"10px 16px"}}>
                    <div style={{fontSize:11,color:T.textFaint,fontFamily:T.fontSans,marginBottom:3}}>h</div>
                    <div style={{fontSize:16,fontWeight:700,color:T.teal,fontFamily:T.font}}>{fmtS(dadosBE.h,6)}</div>
                  </div>
                  <div style={{background:"white",border:`1px solid ${T.border}`,borderRadius:T.radiusSm,padding:"10px 16px"}}>
                    <div style={{fontSize:11,color:T.textFaint,fontFamily:T.fontSans,marginBottom:3}}>Σ ponderada</div>
                    <div style={{fontSize:16,fontWeight:700,color:T.purple,fontFamily:T.font}}>{fmtS(dadosBE.soma_ponderada,6)}</div>
                  </div>
                  <div style={{background:"white",border:`1px solid ${T.border}`,borderRadius:T.radiusSm,padding:"10px 16px"}}>
                    <div style={{fontSize:11,color:T.textFaint,fontFamily:T.fontSans,marginBottom:3}}>n (par)</div>
                    <div style={{fontSize:16,fontWeight:700,color:T.textMuted,fontFamily:T.font}}>{dadosBE.n}</div>
                  </div>
                </div>
              </div>
            ) : fase && subpasso ? (
              <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"20px 24px",boxShadow:T.shadow}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,flexWrap:"wrap"}}>
                  <span style={{fontSize:14,fontWeight:700,background:T.purpleLight,color:T.purple,padding:"4px 14px",borderRadius:20,border:`1px solid ${T.purpleBorder}`,fontFamily:T.fontSans}}>{fase.faseLabel}</span>
                  <span style={{fontSize:13,color:T.textMuted,fontFamily:T.font}}>{fase.subtitulo}</span>
                  <span style={{marginLeft:"auto",fontSize:13,color:T.textFaint,fontFamily:T.font}}>passo {subIdx+1} / {fase.subpassos.length}</span>
                </div>

                {subIdx===0 && <PainelContexto itens={fase.contexto}/>}
                {subpasso.contextoSubpasso && (
                  <div style={{background:"#fff7ed",border:"1px solid #fed7aa",borderLeft:"3px solid #c2410c",borderRadius:T.radiusSm,padding:"10px 14px",marginBottom:16,fontSize:13,color:T.textMuted,lineHeight:1.65,fontFamily:T.fontSans}}>
                    {subpasso.contextoSubpasso}
                  </div>
                )}
                <p style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:16,lineHeight:1.6,fontFamily:T.font}}>{subpasso.pergunta}</p>
                {!respondido && <DicaBox dica={subpasso.dica} tentativas={tentativas}/>}
                {feedback && !feedback.ok && (
                  <div style={{background:T.redLight,border:`1px solid ${T.redBorder}`,borderRadius:T.radiusSm,padding:"10px 14px",marginBottom:14,color:T.red,fontSize:14,fontFamily:T.fontSans}}>
                    ✗ Resposta incorreta — tente novamente.{tentativas>=2&&" Abra a dica para o cálculo completo."}
                  </div>
                )}
                {feedback && feedback.ok && (
                  <div style={{background:T.greenLight,border:`1px solid ${T.greenBorder}`,borderRadius:T.radiusSm,padding:"10px 14px",marginBottom:14,color:T.green,fontSize:14,fontFamily:T.fontSans}}>
                    ✓ Correto! {fmtS(subpasso.esperado,6)}
                  </div>
                )}
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
                  <input type="number" step="any" value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={handleKey} disabled={respondido} placeholder="Digite sua resposta..."
                    style={{flex:1,padding:"10px 14px",border:`1px solid ${T.borderMed}`,borderRadius:T.radiusSm,fontSize:15,fontFamily:T.font,background:respondido?T.bgSection:"white"}}/>
                  {!respondido
                    ? <button onClick={()=>confirmar()} style={{padding:"10px 22px",background:T.purple,color:"white",border:"none",borderRadius:T.radiusSm,fontSize:15,fontFamily:T.fontSans,fontWeight:600,cursor:"pointer"}}>Verificar</button>
                    : <button onClick={avancar} style={{padding:"10px 22px",background:T.green,color:"white",border:"none",borderRadius:T.radiusSm,fontSize:15,fontFamily:T.fontSans,fontWeight:600,cursor:"pointer"}}>
                        {faseIdx>=total-1&&subIdx>=fase.subpassos.length-1?"Concluir 🎉":"Próximo →"}
                      </button>}
                </div>
                <PainelHistorico historico={historico}/>
              </div>
            ) : null}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <Calculadora/>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:T.radius,padding:"12px 14px",boxShadow:T.shadow}}>
              <div style={{fontSize:11,fontWeight:700,color:T.textFaint,textTransform:"uppercase",letterSpacing:1,marginBottom:10,fontFamily:T.fontSans}}>Fórmula</div>
              <div style={{fontSize:12,fontFamily:T.font,color:T.textMuted,lineHeight:2}}>
                <div>I ≈ (h/3) × [</div>
                <div style={{paddingLeft:14}}>f(x₀) +</div>
                <div style={{paddingLeft:14}}>4f(x₁) + 2f(x₂) +</div>
                <div style={{paddingLeft:14}}>4f(x₃) + ... +</div>
                <div style={{paddingLeft:14}}>4f(xₙ₋₁) + f(xₙ)]</div>
              </div>
              <div style={{marginTop:10,padding:"8px 10px",background:T.purpleLight,borderRadius:T.radiusXs,fontSize:12,fontFamily:T.font,color:T.purple}}>
                h = (b−a)/n = {fmtS(dadosBE.h,4)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
