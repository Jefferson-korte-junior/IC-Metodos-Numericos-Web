import React, { useState, useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// ─── Avalia f(x) ───────────────────────────────────────────────────────────
function avaliar(exprStr, xVal) {
  try {
    const expr = exprStr
      .replace(/\^/g, "**")
      .replace(/\bsin\b/g,  "Math.sin")
      .replace(/\bcos\b/g,  "Math.cos")
      .replace(/\btan\b/g,  "Math.tan")
      .replace(/\bsqrt\b/g, "Math.sqrt")
      .replace(/\blog\b/g,  "Math.log10")
      .replace(/\bln\b/g,   "Math.log")
      .replace(/\bexp\b/g,  "Math.exp")
      .replace(/\babs\b/g,  "Math.abs")
      .replace(/\bpi\b/g,   "Math.PI");
    // eslint-disable-next-line no-new-func
    return Function("x", `return ${expr}`)(xVal);
  } catch {
    return NaN;
  }
}

function fmt(v, casas = 5) {
  return parseFloat(Number(v).toFixed(casas));
}

function checar(digitado, esperado) {
  const raw = String(digitado).trim().replace(",", ".").replace(/\s/g, "");
  const d   = parseFloat(raw);
  if (isNaN(d)) return false;
  const diff = Math.abs(d - esperado);
  if (diff < 0.001) return true;
  if (esperado === 0) return diff < 1e-4;
  return diff / Math.abs(esperado) <= 0.01;
}

// ─── KaTeX ─────────────────────────────────────────────────────────────────
function Latex({ expr, display = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(expr, ref.current, { throwOnError: false, displayMode: display });
      } catch {
        ref.current.textContent = expr;
      }
    }
  }, [expr, display]);
  return <span ref={ref} />;
}

// ─── Design tokens (light theme) ───────────────────────────────────────────
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
  shadowMd:     "0 4px 6px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)",
};

// ─── Gráfico SVG ────────────────────────────────────────────────────────────
function GraficoBissecao({ funcao, aOriginal, bOriginal, iteracaoAtual }) {
  const W = 640, H = 230;
  const PAD = { top: 18, right: 22, bottom: 38, left: 52 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const N = 160;
  const pontos = [];
  for (let i = 0; i <= N; i++) {
    const x = aOriginal + (i / N) * (bOriginal - aOriginal);
    const y = avaliar(funcao, x);
    pontos.push({ x, y });
  }

  const ysValidos = pontos.map(p => p.y).filter(v => isFinite(v) && Math.abs(v) < 1e8);
  if (!ysValidos.length) return null;

  const yMin = Math.min(...ysValidos);
  const yMax = Math.max(...ysValidos);
  const yPad = Math.max((yMax - yMin) * 0.2, 0.5);
  const yLo  = yMin - yPad;
  const yHi  = yMax + yPad;

  const toSvg = (x, y) => ({
    sx: PAD.left + ((x - aOriginal) / (bOriginal - aOriginal)) * plotW,
    sy: PAD.top  + (1 - (y - yLo) / (yHi - yLo)) * plotH,
  });

  const pathD = pontos
    .filter(p => isFinite(p.y) && Math.abs(p.y) < 1e8)
    .map((p, i) => {
      const { sx, sy } = toSvg(p.x, p.y);
      return `${i === 0 ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
    })
    .join(" ");

  const { sy: y0Raw } = toSvg(0, 0);
  const clampedY0 = Math.max(PAD.top, Math.min(PAD.top + plotH, y0Raw));

  const { a, b, m } = iteracaoAtual || { a: aOriginal, b: bOriginal, m: (aOriginal + bOriginal) / 2 };

  const aX  = toSvg(a, 0).sx;
  const bX  = toSvg(b, 0).sx;
  const mX  = toSvg(m, 0).sx;
  const faY = toSvg(a, avaliar(funcao, a)).sy;
  const fbY = toSvg(b, avaliar(funcao, b)).sy;
  const fmY = toSvg(m, avaliar(funcao, m)).sy;

  const tickCount = 5;
  const xTicks = [];
  for (let i = 0; i <= tickCount; i++) {
    const x = aOriginal + (i / tickCount) * (bOriginal - aOriginal);
    xTicks.push({ x, sx: toSvg(x, 0).sx });
  }

  const yTicks = [];
  const yRange = yHi - yLo;
  const magnitude = Math.pow(10, Math.floor(Math.log10(yRange)));
  const niceParts = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10];
  let yStep = magnitude;
  for (const p of niceParts) {
    const step = p * magnitude;
    if (yRange / step <= 6) { yStep = step; break; }
  }
  const yStart = Math.ceil(yLo / yStep) * yStep;
  for (let yv = yStart; yv <= yHi + 1e-9; yv = parseFloat((yv + yStep).toFixed(10))) {
    const { sy } = toSvg(0, yv);
    if (sy >= PAD.top - 2 && sy <= PAD.top + plotH + 2)
      yTicks.push({ yv, sy });
  }

  const pts = [
    { sx: aX, sy: faY, color: "#2563eb", label: "a", val: a },
    { sx: mX, sy: fmY, color: "#d97706", label: "m", val: m },
    { sx: bX, sy: fbY, color: "#dc2626", label: "b", val: b },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <defs>
        <clipPath id="plotClip">
          <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} />
        </clipPath>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Plot background */}
      <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="#fafcff" />

      {/* Área do intervalo atual */}
      <rect x={aX} y={PAD.top} width={Math.max(0, bX - aX)} height={plotH}
        fill="url(#areaGrad)" clipPath="url(#plotClip)" />
      <rect x={aX} y={PAD.top} width={Math.max(0, bX - aX)} height={plotH}
        fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="5,3"
        clipPath="url(#plotClip)" />

      {/* Grid horizontal */}
      {yTicks.map(({ sy }, i) => (
        <line key={i} x1={PAD.left} y1={sy} x2={PAD.left + plotW} y2={sy}
          stroke="#e2e8f0" strokeWidth="1" />
      ))}

      {/* Eixo y=0 */}
      <line x1={PAD.left} y1={clampedY0} x2={PAD.left + plotW} y2={clampedY0}
        stroke="#64748b" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.6" />

      {/* Curva */}
      <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.4"
        strokeLinejoin="round" clipPath="url(#plotClip)" />

      {/* Linhas verticais e pontos */}
      {pts.map(({ sx, sy, color, label }) => (
        <g key={label} clipPath="url(#plotClip)">
          <line x1={sx} y1={clampedY0} x2={sx} y2={sy}
            stroke={color} strokeWidth="1.5" strokeDasharray="4,2" opacity="0.55" />
          <circle cx={sx} cy={sy} r="6" fill="white" stroke={color} strokeWidth="2" />
          <circle cx={sx} cy={sy} r="2.5" fill={color} />
          <circle cx={sx} cy={clampedY0} r="3.5" fill={color} opacity="0.75" />
        </g>
      ))}

      {/* Bordas do plot */}
      <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH}
        fill="none" stroke="#e2e8f0" strokeWidth="1" />

      {/* Ticks X */}
      {xTicks.map(({ x, sx }) => (
        <g key={x}>
          <line x1={sx} y1={PAD.top + plotH} x2={sx} y2={PAD.top + plotH + 5}
            stroke="#94a3b8" strokeWidth="1" />
          <text x={sx} y={PAD.top + plotH + 16} textAnchor="middle"
            fontSize="10" fill="#64748b" fontFamily={T.font}>{fmt(x, 3)}</text>
        </g>
      ))}

      {/* Labels a, m, b no eixo X */}
      {pts.map(({ sx, color, label }) => (
        <text key={label} x={sx} y={PAD.top + plotH + 30} textAnchor="middle"
          fontSize="12" fill={color} fontFamily={T.font} fontWeight="700">
          {label}
        </text>
      ))}

      {/* Ticks Y */}
      {yTicks.map(({ yv, sy }) => (
        <g key={yv}>
          <line x1={PAD.left - 4} y1={sy} x2={PAD.left} y2={sy}
            stroke="#94a3b8" strokeWidth="1" />
          <text x={PAD.left - 8} y={sy + 3.5} textAnchor="end"
            fontSize="10" fill="#64748b" fontFamily={T.font}>{fmt(yv, 2)}</text>
        </g>
      ))}

      {/* Label eixo Y */}
      <text x={13} y={PAD.top + plotH / 2} textAnchor="middle"
        fontSize="10" fill="#94a3b8" fontFamily={T.font}
        transform={`rotate(-90, 13, ${PAD.top + plotH / 2})`}>f(x)</text>
    </svg>
  );
}

// ─── Calculadora científica ─────────────────────────────────────────────────
function Calculadora() {
  const [display, setDisplay] = useState("0");
  const [expr,    setExpr]    = useState("");
  const [newNum,  setNewNum]  = useState(true);

  function pressDigit(d) {
    if (newNum) {
      setDisplay(d === "." ? "0." : d);
      setNewNum(false);
    } else {
      if (d === "." && display.includes(".")) return;
      setDisplay(display === "0" && d !== "." ? d : display + d);
    }
  }

  function pressOp(op) {
    setExpr(display + " " + op + " ");
    setNewNum(true);
  }

  function calcular() {
    try {
      const full = expr + display;
      // eslint-disable-next-line no-new-func
      const res = Function(`return (${full})`)();
      const str = isFinite(res)
        ? String(parseFloat(res.toFixed(12)))
        : "Erro";
      setDisplay(str);
      setExpr("");
      setNewNum(true);
    } catch {
      setDisplay("Erro");
      setExpr("");
      setNewNum(true);
    }
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
      else if (fn === "π")  { setDisplay(String(Math.PI));  setNewNum(true); return; }
      else if (fn === "e")  { setDisplay(String(Math.E));   setNewNum(true); return; }
      else return;
      const str = isFinite(res) ? String(parseFloat(res.toFixed(12))) : "Erro";
      setDisplay(str);
      setNewNum(true);
    } catch {
      setDisplay("Erro");
      setNewNum(true);
    }
  }

  function limpar()    { setDisplay("0"); setExpr(""); setNewNum(true); }
  function backspace() {
    if (newNum || display.length <= 1) { setDisplay("0"); setNewNum(true); }
    else setDisplay(display.slice(0, -1) || "0");
  }

  // Estilo base do botão
  const themes = {
    num:  { bg: "#f1f5f9", fg: T.text,    hov: "#e2e8f0" },
    op:   { bg: "#eff6ff", fg: T.primary, hov: "#dbeafe" },
    fn:   { bg: "#f8fafc", fg: "#475569", hov: "#e9eef5" },
    eq:   { bg: T.primary, fg: "#fff",    hov: "#1d4ed8" },
    del:  { bg: "#fef2f2", fg: T.red,     hov: "#fee2e2" },
  };

  function Btn({ label, onClick, theme = "num", wide = false, tall = false }) {
    const th = themes[theme];
    const [hov, setHov] = useState(false);
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? th.hov : th.bg,
          color: th.fg,
          border: "1px solid #e2e8f0",
          borderRadius: T.radiusXs,
          fontSize: 13,
          fontFamily: theme === "num" || theme === "op" || theme === "eq" ? T.font : T.fontSans,
          fontWeight: theme === "eq" || theme === "op" ? 700 : 400,
          cursor: "pointer",
          padding: tall ? "10px 4px" : "8px 4px",
          gridColumn: wide ? "span 2" : undefined,
          transition: "background 0.1s",
          userSelect: "none",
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.border}`,
      borderRadius: T.radius,
      padding: 14,
      boxShadow: T.shadow,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: T.textFaint,
        textTransform: "uppercase", letterSpacing: 1,
        marginBottom: 10, fontFamily: T.fontSans,
      }}>
        Calculadora
      </div>

      {/* Display */}
      <div style={{
        background: T.bgSection,
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusSm,
        padding: "8px 12px",
        marginBottom: 10,
        textAlign: "right",
        minHeight: 60,
      }}>
        <div style={{
          fontSize: 11, color: T.textFaint,
          fontFamily: T.font, minHeight: 16, marginBottom: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {expr || "\u00a0"}
        </div>
        <div style={{
          fontSize: display.length > 14 ? 13 : display.length > 10 ? 16 : 22,
          fontWeight: 700, color: T.text,
          fontFamily: T.font, wordBreak: "break-all", lineHeight: 1.2,
        }}>
          {display}
        </div>
      </div>

      {/* Grid de botões */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
        <Btn label="sin" onClick={() => pressFunc("sin")} theme="fn" />
        <Btn label="cos" onClick={() => pressFunc("cos")} theme="fn" />
        <Btn label="tan" onClick={() => pressFunc("tan")} theme="fn" />
        <Btn label="√"   onClick={() => pressFunc("√")}  theme="fn" />

        <Btn label="log" onClick={() => pressFunc("log")} theme="fn" />
        <Btn label="ln"  onClick={() => pressFunc("ln")}  theme="fn" />
        <Btn label="x²"  onClick={() => pressFunc("x²")}  theme="fn" />
        <Btn label="1/x" onClick={() => pressFunc("1/x")} theme="fn" />

        <Btn label="π"   onClick={() => pressFunc("π")}  theme="fn" />
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

      <div style={{
        marginTop: 8, fontSize: 11, color: T.textFaint,
        fontFamily: T.fontSans,
      }}>
        sin/cos/tan em graus (DEG)
      </div>
    </div>
  );
}

// ─── Gerador de passos ──────────────────────────────────────────────────────
function gerarPassos(funcao, a, b, tol) {
  a = +a; b = +b; tol = +tol;
  const passos = [];

  const logBA  = Math.log10(b - a);
  const logTol = Math.log10(tol);
  const nExato = (logBA - logTol) / Math.log10(2);
  const nMin   = Math.ceil(nExato);

  passos.push({
    faseLabel:    "Nº de iterações",
    subtitulo:    "Estimativa do número mínimo de iterações",
    ehEstimativa: true,
    contexto: [
      {
        titulo: "Por que calcular antes de começar?",
        texto:  "O método da bisseção tem convergência previsível. Podemos calcular antecipadamente quantas iterações são necessárias para atingir a tolerância ε desejada.",
      },
      {
        titulo: "⚠️ Esse é o número MÍNIMO garantido",
        texto:  `Vamos calcular n = ${nMin} como garantia. Porém, a raiz pode ser encontrada antes — se f(m) = 0 exatamente, ou se o erro já ficou abaixo de ε antes de completar todas as iterações. O n calculado garante a convergência; não significa que sempre serão necessárias exatamente n iterações.`,
      },
    ],
    subpassos: [
      {
        id:              "est_ba",
        perguntaTexto:   "b − a",
        pergunta:        "Calcule o comprimento inicial do intervalo: b − a",
        dica:            `Subtraia os extremos: ${b} − ${a}`,
        esperado:        b - a,
        tipo:            "numero",
        contextoSubpasso: "O comprimento inicial do intervalo define o ponto de partida do erro máximo.",
      },
      {
        id:            "est_logba",
        perguntaTexto: `log₁₀(b−a) = log₁₀(${fmt(b-a,5)})`,
        pergunta:      `Calcule log₁₀(b−a) = log₁₀(${fmt(b-a,5)})`,
        dica:          `Use o botão "log" da calculadora ao lado com o valor ${fmt(b-a,5)}`,
        esperado:      logBA,
        tipo:          "numero",
        contextoSubpasso: null,
      },
      {
        id:            "est_logtol",
        perguntaTexto: `log₁₀(ε) = log₁₀(${tol})`,
        pergunta:      `Calcule log₁₀(ε) = log₁₀(${tol})`,
        dica:          `Use o botão "log" da calculadora ao lado com o valor ${tol}`,
        esperado:      logTol,
        tipo:          "numero",
        contextoSubpasso: "ε (epsilon) é o erro máximo tolerado na resposta final.",
      },
      {
        id:            "est_num",
        perguntaTexto: "log(b−a) − log(ε)",
        pergunta:      "Calcule o numerador: log(b−a) − log(ε)",
        dica:          `Subtraia: ${fmt(logBA,5)} − (${fmt(logTol,5)})`,
        esperado:      logBA - logTol,
        tipo:          "numero",
        contextoSubpasso: null,
      },
      {
        id:            "est_nexato",
        perguntaTexto: "n = numerador ÷ log₁₀(2)",
        pergunta:      "Divida pelo log₁₀(2) ≈ 0,30103. Qual o valor de n?",
        dica:          `${fmt(logBA-logTol,5)} ÷ 0,30103`,
        esperado:      nExato,
        tipo:          "numero",
        contextoSubpasso: null,
      },
      {
        id:            "est_nmin",
        perguntaTexto: "⌈n⌉ = número mínimo de iterações",
        pergunta:      "Arredonde para cima (⌈n⌉). Qual o número mínimo de iterações necessárias?",
        dica:          `⌈${fmt(nExato,4)}⌉ — arredonde para o inteiro imediatamente acima`,
        esperado:      nMin,
        inteiro:       true,
        tipo:          "numero",
        contextoSubpasso: `Esse valor garante erro < ε = ${tol}. Na prática, pode convergir antes se f(m) = 0 ou se o erro atingir ε antecipadamente.`,
      },
    ],
  });

  let ai = a, bi = b;

  for (let iter = 1; iter <= nMin + 2; iter++) {
    const fa  = avaliar(funcao, ai);
    const fb  = avaliar(funcao, bi);
    const med = (ai + bi) / 2;
    const fm  = avaliar(funcao, med);
    const mesmoSinal = Math.sign(fa) === Math.sign(fm);
    const substituiu = mesmoSinal ? "a" : "b";
    const novoA      = mesmoSinal ? med : ai;
    const novoB      = mesmoSinal ? bi  : med;
    const erroAbs    = Math.abs(bi - ai) / 2;
    const convergiu  = erroAbs < tol || Math.abs(fm) < tol;

    passos.push({
      faseLabel:    "Iteração " + iter,
      subtitulo:    "Iteração " + iter,
      ehEstimativa: false,
      estadoA:      ai,
      estadoB:      bi,
      mediaFinal:   med,
      erroAbs,
      convergiu,
      contexto: [
        {
          titulo: "Intervalo atual",
          texto:  `a = ${fmt(ai,6)},   b = ${fmt(bi,6)}\nComprimento = ${fmt(bi-ai,6)}.   Erro máximo possível nesta iteração = ${fmt(erroAbs,6)}.`,
        },
      ],
      subpassos: [
        {
          id:            `i${iter}_fa`,
          perguntaTexto: `f(a) = f(${fmt(ai,6)})`,
          pergunta:      `Avalie f(a): calcule f(${fmt(ai,6)})`,
          dica:          `Substitua x = ${fmt(ai,6)} na função: f(x) = ${funcao}`,
          esperado:      fa,
          tipo:          "numero",
          contextoSubpasso: iter === 1
            ? "Pelo Teorema de Bolzano: se f(a) · f(b) < 0, existe pelo menos uma raiz em [a, b]."
            : null,
        },
        {
          id:            `i${iter}_fb`,
          perguntaTexto: `f(b) = f(${fmt(bi,6)})`,
          pergunta:      `Avalie f(b): calcule f(${fmt(bi,6)})`,
          dica:          `Substitua x = ${fmt(bi,6)} na função: f(x) = ${funcao}`,
          esperado:      fb,
          tipo:          "numero",
          contextoSubpasso: null,
        },
        {
          id:            `i${iter}_med`,
          perguntaTexto: `m = (${fmt(ai,6)} + ${fmt(bi,6)}) / 2`,
          pergunta:      `Calcule o ponto médio m = (a + b) / 2`,
          dica:          `(${fmt(ai,6)} + ${fmt(bi,6)}) ÷ 2`,
          esperado:      med,
          tipo:          "numero",
          contextoSubpasso: "O ponto médio m é a estimativa atual da raiz. Avaliaremos f(m) para decidir qual metade do intervalo contém a raiz.",
        },
        {
          id:            `i${iter}_fm`,
          perguntaTexto: `f(m) = f(${fmt(med,6)})`,
          pergunta:      `Avalie f(m): calcule f(${fmt(med,6)})`,
          dica:          `Substitua x = ${fmt(med,6)} na função: f(x) = ${funcao}`,
          esperado:      fm,
          tipo:          "numero",
          contextoSubpasso: null,
        },
        {
          id:            `i${iter}_sinal`,
          perguntaTexto: "f(a) e f(m) mesmo sinal?",
          pergunta:      `f(a) = ${fmt(fa,5)} e f(m) = ${fmt(fm,5)} têm o mesmo sinal?`,
          dica:          `f(a) = ${fmt(fa,5)} é ${fa >= 0 ? "positivo (+)" : "negativo (−)"};  f(m) = ${fmt(fm,5)} é ${fm >= 0 ? "positivo (+)" : "negativo (−)"}.\nSinais ${mesmoSinal ? "IGUAIS → raiz está entre m e b" : "OPOSTOS → raiz está entre a e m"}.`,
          esperado:      mesmoSinal ? "Sim" : "Não",
          mesmoSinal,
          tipo:          "simnao",
          contextoSubpasso: "A comparação de sinais determina em qual metade do intervalo a raiz se encontra. Essa é a essência do método da bisseção!",
        },
        {
          id:            `i${iter}_sub`,
          perguntaTexto: `m substitui extremo "${substituiu}"`,
          pergunta:      "O ponto médio m substitui qual extremo do intervalo?",
          dica:          mesmoSinal
            ? `f(a) e f(m) têm o mesmo sinal → raiz está entre m e b → m se torna o novo "a"`
            : `f(a) e f(m) têm sinais opostos → raiz está entre a e m → m se torna o novo "b"`,
          esperado:      substituiu,
          tipo:          "escolha",
          opcoes:        ["a", "b"],
          contextoSubpasso: null,
        },
      ],
    });

    if (convergiu) break;
    ai = novoA;
    bi = novoB;
  }

  return passos;
}

// ─── Dica ───────────────────────────────────────────────────────────────────
function DicaBox({ dica, tentativas }) {
  const [aberto, setAberto] = useState(false);
  const completa = tentativas >= 2;

  return (
    <div style={{ marginBottom: 14 }}>
      <button
        onClick={() => setAberto(v => !v)}
        style={{
          background: "transparent",
          border: `1px solid ${T.yellowBorder}`,
          color: T.yellow,
          borderRadius: T.radiusXs,
          padding: "5px 14px",
          fontSize: 13, fontFamily: T.fontSans,
          cursor: "pointer", display: "flex",
          alignItems: "center", gap: 6,
        }}
      >
        💡 {aberto ? "Ocultar dica" : "Ver dica"}
      </button>

      {aberto && (
        <div style={{
          marginTop: 8,
          background: T.yellowLight,
          border: `1px solid ${T.yellowBorder}`,
          borderRadius: T.radiusSm,
          padding: "10px 14px",
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: T.yellow,
            marginBottom: 6, fontFamily: T.fontSans,
          }}>
            {completa ? "DICA COMPLETA" : "DICA PARCIAL"}
          </div>
          {completa ? (
            <p style={{ margin: 0, fontSize: 14, color: T.textMuted, lineHeight: 1.7, fontFamily: T.fontSans, whiteSpace: "pre-line" }}>
              {dica}
            </p>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 14, color: T.textMuted, lineHeight: 1.7, fontFamily: T.fontSans }}>
                {dica.split("→")[0].split(":")[0].trim()}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: T.textFaint, fontStyle: "italic", fontFamily: T.fontSans }}>
                Erre mais uma vez para ver o cálculo detalhado.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Contexto didático ──────────────────────────────────────────────────────
function PainelContexto({ itens }) {
  if (!itens?.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
      {itens.map((item, i) => (
        <div key={i} style={{
          background: T.primaryLight,
          border: `1px solid ${T.primaryBorder}`,
          borderLeft: `3px solid ${T.primary}`,
          borderRadius: T.radiusSm,
          padding: "11px 15px",
        }}>
          {item.titulo && (
            <div style={{
              fontSize: 12, fontWeight: 700, color: T.primary,
              marginBottom: 5, fontFamily: T.fontSans,
            }}>
              {item.titulo}
            </div>
          )}
          <p style={{ margin: 0, fontSize: 14, color: T.textMuted, lineHeight: 1.65, fontFamily: T.fontSans }}>
            {item.texto}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Histórico ──────────────────────────────────────────────────────────────
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
    else grupos.push({
      faseLabel: item.faseLabel,
      itens:     [item],
      estadoA:   item.estadoA,
      estadoB:   item.estadoB,
    });
  });

  return (
    <div style={{ marginTop: 20 }}>
      <p style={{
        margin: "0 0 8px", fontSize: 11, fontWeight: 700,
        color: T.textFaint, textTransform: "uppercase", letterSpacing: 1,
        fontFamily: T.fontSans,
      }}>
        Histórico
      </p>
      <div ref={ref} style={{
        background: T.bgSection,
        border: `1px solid ${T.border}`,
        borderRadius: T.radius,
        padding: 14,
        maxHeight: 320,
        overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 16,
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
      }}>
        {grupos.map((grupo, gi) => (
          <div key={gi}>
            {/* Label da fase */}
            <div style={{
              fontSize: 12, fontWeight: 700, color: T.primary,
              textTransform: "uppercase", letterSpacing: 0.5,
              marginBottom: 8, paddingBottom: 6,
              borderBottom: `1px solid ${T.primaryBorder}`,
              fontFamily: T.fontSans,
              display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            }}>
              <span>{grupo.faseLabel}</span>
              {/* Intervalo [a=..., b=...] explícito */}
              {grupo.estadoA !== undefined && grupo.estadoB !== undefined && (
                <span style={{
                  fontWeight: 500, color: T.textMuted,
                  fontSize: 12, fontFamily: T.font,
                }}>
                  [a = {fmt(grupo.estadoA, 6)},&nbsp;&nbsp;b = {fmt(grupo.estadoB, 6)}]
                </span>
              )}
            </div>

            {/* Cards dos subpassos */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: 6,
            }}>
              {grupo.itens.map((item, ii) => (
                <div key={ii} style={{
                  background: T.bgWhite,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusSm,
                  padding: "8px 12px",
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", gap: 8,
                }}>
                  <span style={{
                    fontSize: 13, color: T.textMuted,
                    lineHeight: 1.3, fontFamily: T.font,
                  }}>
                    {item.perguntaTexto}
                  </span>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: T.green, whiteSpace: "nowrap",
                    fontFamily: T.font,
                  }}>
                    ✓ {item.resposta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function BissecaoInterativa({ funcao, a, b, tolerancia }) {
  const an  = +a;
  const bn  = +b;
  const tol = +tolerancia;

  const passos = useRef(null);
  if (!passos.current) passos.current = gerarPassos(funcao, an, bn, tol);

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

  const iteracaoGrafico = fase?.ehEstimativa
    ? { a: an, b: bn, m: (an + bn) / 2 }
    : { a: fase?.estadoA ?? an, b: fase?.estadoB ?? bn, m: fase?.mediaFinal ?? (an + bn) / 2 };

  function validarSubpasso(sp, val) {
    val = String(val).trim();
    if (sp.tipo === "numero") {
      if (sp.inteiro) return parseInt(val) === sp.esperado;
      return checar(val, sp.esperado);
    }
    if (sp.tipo === "simnao") {
      const r = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const disseSim = r === "sim" || r === "s";
      const disseNao = r === "nao" || r === "n";
      if (!disseSim && !disseNao) return false;
      return sp.mesmoSinal ? disseSim : disseNao;
    }
    if (sp.tipo === "escolha") return val.toLowerCase() === sp.esperado;
    return false;
  }

  function confirmar(valorOverride) {
    const val = valorOverride !== undefined ? valorOverride : inputVal;
    const ok  = validarSubpasso(subpasso, val);
    setFeedback({ ok });
    if (ok) {
      setRespondido(true);
      setTentativas(0);
      const respostaExibida = subpasso.tipo === "numero"
        ? fmt(subpasso.esperado, 6)
        : subpasso.esperado;
      setHistorico(h => [...h, {
        faseLabel:     fase.faseLabel,
        perguntaTexto: subpasso.perguntaTexto,
        resposta:      String(respostaExibida),
        estadoA:       fase.estadoA,
        estadoB:       fase.estadoB,
      }]);
    } else {
      setTentativas(t => t + 1);
    }
  }

  function avancar() {
    setInputVal("");
    setFeedback(null);
    setRespondido(false);
    setTentativas(0);
    const proxSub = subIdx + 1;
    if (proxSub < fase.subpassos.length) {
      setSubIdx(proxSub);
    } else {
      const proxFase = faseIdx + 1;
      if (proxFase < total) {
        setFaseIdx(proxFase);
        setSubIdx(0);
      }
    }
  }

  return (
    <div style={{
      fontFamily: T.fontSans,
      background: T.bg,
      minHeight: "100vh",
      color: T.text,
      padding: "24px 20px",
      boxSizing: "border-box",
      alignSelf: "flex-start",
      marginLeft: 0,
      marginRight: "auto",
    }}>
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
        <div style={{
          background: T.bgCard, border: `1px solid ${T.border}`,
          borderRadius: T.radius, padding: "14px 20px",
          marginBottom: 18, display: "flex",
          alignItems: "center", gap: 16, flexWrap: "wrap",
          boxShadow: T.shadow,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: T.fontSans }}>
              Método da Bisseção
            </div>
            <div style={{ fontSize: 14, color: T.textMuted, fontFamily: T.font, marginTop: 3 }}>
              f(x) = {funcao}&nbsp;&nbsp;·&nbsp;&nbsp;[{an}, {bn}]&nbsp;&nbsp;·&nbsp;&nbsp;ε = {tol}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, minWidth: 220 }}>
            <div style={{ flex: 1, height: 7, borderRadius: 4, background: T.border, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: progresso + "%",
                background: `linear-gradient(90deg, ${T.primary}, #60a5fa)`,
                borderRadius: 4, transition: "width 0.4s ease",
              }} />
            </div>
            <span style={{ fontSize: 14, color: T.textMuted, fontFamily: T.font, minWidth: 38 }}>
              {progresso}%
            </span>
          </div>
        </div>

        {/* Duas colunas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 240px",
          gap: 18,
          alignItems: "start",
        }}>
          {/* Coluna esquerda */}
          <div>
            {/* Gráfico */}
            <div style={{
              background: T.bgCard, border: `1px solid ${T.border}`,
              borderRadius: T.radius, padding: "14px 16px",
              marginBottom: 16, boxShadow: T.shadow,
            }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: T.textFaint,
                marginBottom: 10, fontFamily: T.fontSans,
                textTransform: "uppercase", letterSpacing: 0.6,
              }}>
                Gráfico — f(x) = {funcao}
              </div>
              <GraficoBissecao
                funcao={funcao} aOriginal={an} bOriginal={bn}
                iteracaoAtual={iteracaoGrafico}
              />
              <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
                {[
                  { cor: "#2563eb", label: "a — extremo esquerdo" },
                  { cor: "#d97706", label: "m — ponto médio" },
                  { cor: "#dc2626", label: "b — extremo direito" },
                ].map(({ cor, label }) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 13, color: T.textMuted, fontFamily: T.fontSans,
                  }}>
                    <div style={{
                      width: 11, height: 11, borderRadius: "50%",
                      background: cor, border: "2px solid white",
                      boxShadow: `0 0 0 1.5px ${cor}`,
                    }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Painel principal */}
            {concluido ? (
              <div style={{
                background: T.greenLight, border: `1px solid ${T.greenBorder}`,
                borderRadius: T.radius, padding: "30px 28px",
                boxShadow: T.shadow,
              }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>🎉</div>
                <h3 style={{ color: T.green, marginBottom: 12, fontSize: 22, fontFamily: T.fontSans }}>
                  Bisseção concluída!
                </h3>
                <p style={{ fontSize: 16, color: T.textMuted, lineHeight: 1.7, fontFamily: T.fontSans }}>
                  Após{" "}
                  <strong style={{ color: T.text }}>{total - 1}</strong> iteração(ões),
                  a raiz aproximada é{" "}
                  <strong style={{ color: T.green, fontFamily: T.font, fontSize: 18 }}>
                    x ≈ {fmt(ultimaFase.mediaFinal, 6)}
                  </strong>{" "}
                  com erro &lt; <strong>{tol}</strong>.
                </p>
                <p style={{
                  fontSize: 14, color: T.textMuted, marginTop: 12,
                  fontFamily: T.fontSans, fontStyle: "italic",
                  lineHeight: 1.6,
                }}>
                  Calculamos que seriam necessárias até {passos.current.length - 1} iterações como garantia,
                  mas a convergência ocorreu {total - 1 < passos.current.length - 1
                    ? `em apenas ${total - 1} — antes do limite máximo!`
                    : "exatamente no limite calculado."
                  }
                </p>
              </div>
            ) : fase && subpasso ? (
              <div style={{
                background: T.bgCard, border: `1px solid ${T.border}`,
                borderRadius: T.radius, padding: "20px 24px",
                boxShadow: T.shadow,
              }}>
                {/* Cabeçalho */}
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: 10, marginBottom: 18, flexWrap: "wrap",
                }}>
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    background: T.primaryLight, color: T.primary,
                    padding: "4px 14px", borderRadius: 20,
                    border: `1px solid ${T.primaryBorder}`,
                    fontFamily: T.fontSans,
                  }}>
                    {fase.subtitulo}
                  </span>
                  {!fase.ehEstimativa && (
                    <span style={{ fontSize: 14, color: T.textMuted, fontFamily: T.font }}>
                      a = {fmt(fase.estadoA, 6)}&nbsp;&nbsp;&nbsp;b = {fmt(fase.estadoB, 6)}
                    </span>
                  )}
                  <span style={{
                    marginLeft: "auto", fontSize: 13, color: T.textFaint,
                    fontFamily: T.font,
                  }}>
                    passo {subIdx + 1} / {fase.subpassos.length}
                  </span>
                </div>

                {/* Contexto da fase */}
                {subIdx === 0 && <PainelContexto itens={fase.contexto} />}

                {/* Contexto do subpasso */}
                {subpasso.contextoSubpasso && (
                  <div style={{
                    background: T.orangeLight,
                    border: `1px solid ${T.orangeBorder}`,
                    borderLeft: `3px solid ${T.orange}`,
                    borderRadius: T.radiusSm,
                    padding: "10px 14px", marginBottom: 16,
                    fontSize: 14, color: T.textMuted, lineHeight: 1.65,
                    fontFamily: T.fontSans,
                  }}>
                    {subpasso.contextoSubpasso}
                  </div>
                )}

                {/* Pergunta */}
                <p style={{
                  fontSize: 16, fontWeight: 600, color: T.text,
                  marginBottom: 16, lineHeight: 1.5,
                  fontFamily: T.fontSans,
                }}>
                  {subpasso.pergunta}
                </p>

                {/* Dica */}
                {!respondido && (
                  <DicaBox dica={subpasso.dica} tentativas={tentativas} />
                )}

                {/* Feedback erro */}
                {feedback && !feedback.ok && (
                  <div style={{
                    background: T.redLight, border: `1px solid ${T.redBorder}`,
                    borderRadius: T.radiusSm, padding: "10px 14px", marginBottom: 14,
                    color: T.red, fontSize: 14, fontFamily: T.fontSans,
                  }}>
                    ✗ Resposta incorreta — tente novamente.
                    {tentativas >= 2 && " Abra a dica para ver o cálculo detalhado."}
                  </div>
                )}

                {/* Feedback acerto */}
                {feedback?.ok && (
                  <div style={{
                    background: T.greenLight, border: `1px solid ${T.greenBorder}`,
                    borderRadius: T.radiusSm, padding: "10px 14px", marginBottom: 14,
                    color: T.green, fontSize: 15, fontFamily: T.font, fontWeight: 700,
                  }}>
                    ✓ Correto! →{" "}
                    <span style={{ color: T.text }}>
                      {subpasso.tipo === "numero"
                        ? fmt(subpasso.esperado, 6)
                        : subpasso.esperado}
                    </span>
                  </div>
                )}

                {/* Input */}
                {!respondido && (
                  subpasso.tipo === "simnao" ? (
                    <div style={{ display: "flex", gap: 10 }}>
                      {["Sim", "Não"].map(op => (
                        <button key={op} onClick={() => confirmar(op)} style={{
                          background: op === "Sim" ? T.greenLight : T.redLight,
                          color:      op === "Sim" ? T.green      : T.red,
                          border:    `1.5px solid ${op === "Sim" ? T.greenBorder : T.redBorder}`,
                          borderRadius: T.radiusSm,
                          padding: "10px 30px", fontSize: 15, fontWeight: 700,
                          cursor: "pointer", fontFamily: T.fontSans,
                        }}>{op}</button>
                      ))}
                    </div>
                  ) : subpasso.tipo === "escolha" ? (
                    <div style={{ display: "flex", gap: 10 }}>
                      {subpasso.opcoes.map(op => (
                        <button key={op} onClick={() => confirmar(op)} style={{
                          background: T.primaryLight, color: T.primary,
                          border: `1.5px solid ${T.primaryBorder}`,
                          borderRadius: T.radiusSm,
                          padding: "10px 36px", fontSize: 17,
                          fontWeight: 700, cursor: "pointer",
                          fontFamily: T.font,
                        }}>{op}</button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <input
                        type="text"
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") confirmar(); }}
                        placeholder="Sua resposta numérica"
                        autoFocus
                        style={{
                          flex: 1, maxWidth: 260,
                          background: T.bgSection,
                          border: `1.5px solid ${T.borderMed}`,
                          borderRadius: T.radiusSm,
                          color: T.text, fontSize: 16,
                          fontFamily: T.font,
                          padding: "10px 14px",
                          transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                      />
                      <button onClick={() => confirmar()} style={{
                        background: T.primary, color: "#fff",
                        border: "none", borderRadius: T.radiusSm,
                        padding: "10px 22px", fontSize: 15, fontWeight: 700,
                        cursor: "pointer", fontFamily: T.fontSans,
                      }}>
                        Confirmar
                      </button>
                    </div>
                  )
                )}

                {/* Próximo */}
                {respondido && (
                  <button onClick={avancar} style={{
                    marginTop: 16,
                    background: T.primary, color: "#fff",
                    border: "none", borderRadius: T.radiusSm,
                    padding: "10px 26px", fontSize: 15, fontWeight: 700,
                    cursor: "pointer", fontFamily: T.fontSans,
                  }}>
                    Próximo →
                  </button>
                )}
              </div>
            ) : null}

            {/* Histórico */}
            <PainelHistorico historico={historico} />
          </div>

          {/* Coluna direita: calculadora fixa */}
          <div style={{ position: "sticky", top: 20 }}>
            <Calculadora />
          </div>
        </div>
      </div>
    </div>
  );
}
