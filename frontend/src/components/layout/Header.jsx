// ─── Banner SVG matemático ────────────────────────────────────────────────────
// Cobre TODO o header como fundo. As curvas vão de x=0 até x=900 (viewBox).
// O "textVeil" é um gradiente suave que clareia levemente o lado esquerdo
// para garantir a legibilidade do texto sobreposto.
function MathBanner() {
  // Grade de pontos — 16 colunas × 5 linhas cobrindo a largura total
  const dots = [];
  for (let i = 0; i <= 16; i++) {
    for (let j = 0; j <= 4; j++) {
      dots.push({ cx: 16 + i * 56, cy: 14 + j * 26, key: `${i}-${j}` });
    }
  }

  // Pontos destacados sobre a curva principal
  const pontosCurva = [
    [200, 44],
    [385, 54],
    [545, 28],
    [705, 50],
    [860, 36],
  ];

  return (
    <svg
      viewBox="0 0 900 130"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        {/* Fundo degradê */}
        <linearGradient id="bannerBg" x1="0" y1="0" x2="900" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#eeedfe" />
          <stop offset="100%" stopColor="#dddcf8" />
        </linearGradient>

        {/* Curva principal: começa quase invisível à esquerda, intensa à direita */}
        <linearGradient id="waveMain" x1="0" y1="0" x2="900" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#5c54c8" stopOpacity="0.08" />
          <stop offset="30%"  stopColor="#5c54c8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3c3489" stopOpacity="0.9"  />
        </linearGradient>

        {/* Curva secundária */}
        <linearGradient id="wave2" x1="0" y1="0" x2="900" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#5c54c8" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#5c54c8" stopOpacity="0.38" />
        </linearGradient>

        {/*
          Véu de legibilidade: camada levíssima sobre o lado esquerdo.
          Clareia o fundo onde o texto fica — sem tirar a identidade do SVG.
        */}
        <linearGradient id="textVeil" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#f0effe" stopOpacity="0.6"  />
          <stop offset="28%"  stopColor="#eeedfe" stopOpacity="0.28" />
          <stop offset="52%"  stopColor="#eeedfe" stopOpacity="0.0"  />
        </linearGradient>
      </defs>

      {/* ── Fundo base ──────────────────────────────────────────────────────── */}
      <rect width="900" height="130" fill="url(#bannerBg)" />

      {/* ── Grade de pontos ─────────────────────────────────────────────────── */}
      {dots.map(({ cx, cy, key }) => (
        <circle key={key} cx={cx} cy={cy} r="1.4" fill="#3c3489" opacity="0.09" />
      ))}

      {/* ── Área sombreada (conceito de integral) ───────────────────────────── */}
      <path
        d="M345 130 L345 54 C362 44 375 36 385 28 L400 130 Z"
        fill="#3c3489"
        fillOpacity="0.04"
      />

      {/* ── Curva principal – interpolação – de ponta a ponta ───────────────── */}
      <path
        d="M-5 95 C80 95 140 22 200 44 S295 88 385 54 S462 16 545 28 S632 74 705 50 S792 26 910 58"
        stroke="url(#waveMain)"
        strokeWidth="2.5"
        fill="none"
      />

      {/* ── Curva secundária ────────────────────────────────────────────────── */}
      <path
        d="M-5 68 C90 68 152 98 242 88 S360 44 462 66 S572 98 682 72 S792 54 910 78"
        stroke="url(#wave2)"
        strokeWidth="1.5"
        fill="none"
      />

      {/* ── Curva terciária ─────────────────────────────────────────────────── */}
      <path
        d="M-5 112 C102 112 162 58 262 74 S392 96 502 64 S622 30 732 46 S822 78 910 52"
        stroke="#7c74e0"
        strokeWidth="1"
        fill="none"
        opacity="0.18"
      />

      {/* ── Pontos destacados sobre a curva principal ───────────────────────── */}
      {pontosCurva.map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="4.5" fill="#3c3489" opacity="0.62" />
          <circle cx={cx} cy={cy} r="8"   fill="none" stroke="#3c3489" strokeWidth="1" opacity="0.16" />
        </g>
      ))}

      {/* ── Rótulos matemáticos (concentrados no lado direito) ──────────────── */}
      <text x="205" y="34"  fill="#3c3489" fontSize="9" fontFamily="serif" opacity="0.45">f(x₀)</text>
      <text x="390" y="43"  fill="#3c3489" fontSize="9" fontFamily="serif" opacity="0.50">L(x)</text>
      <text x="550" y="18"  fill="#3c3489" fontSize="9" fontFamily="serif" opacity="0.50">f(xₙ)</text>

      {/* ── Fórmulas decorativas de fundo ───────────────────────────────────── */}
      <text x="490" y="120" fill="#3c3489" fontSize="8" fontFamily="serif" opacity="0.11"
        transform="rotate(-3, 490, 120)">
        P(x) = Σ yᵢ Lᵢ(x)
      </text>
      <text x="660" y="22"  fill="#3c3489" fontSize="8" fontFamily="serif" opacity="0.11">
        ∫f(x) dx
      </text>
      <text x="770" y="112" fill="#3c3489" fontSize="8" fontFamily="serif" opacity="0.10">
        |f(b)−f(a)| &lt; ε
      </text>
      <text x="52" y="118"  fill="#3c3489" fontSize="8" fontFamily="serif" opacity="0.09"
        transform="rotate(-2, 52, 118)">
        xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)
      </text>

      {/* ── Véu suave na área do texto para garantir legibilidade ───────────── */}
      <rect width="900" height="130" fill="url(#textVeil)" />
    </svg>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
export default function Header({ categoriaSelecionada }) {
  return (
    <div style={{
      position: "relative",      /* container de referência para o SVG absoluto */
      borderRadius: 16,
      marginBottom: 20,
      boxShadow: "0 2px 16px rgba(60,52,137,0.07), 0 1px 4px rgba(0,0,0,0.04)",
      border: "1px solid rgba(197,194,240,0.4)",
      overflow: "hidden",        /* clips o SVG nos cantos arredondados          */
      minHeight: 130,
    }}>

      {/* ── SVG: cobre 100% do header como plano de fundo ──────────────────── */}
      <div style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}>
        <MathBanner />
      </div>

      {/* ── Conteúdo textual: card glassmorphism sobreposto ao SVG ─────────── */}
      <div style={{
        position: "relative",
        zIndex: 1,
        padding: "20px 24px",
        /* Garante que o card não tome mais espaço do que precisa */
        alignSelf: "center",
        display: "inline-block",
      }}>
        {/* ── Glass Card ──────────────────────────────────────────────────── */}
        <div style={{
          background:    "rgba(255, 255, 255, 0.55)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",       /* suporte Safari/Chrome */
          border:        "1px solid rgba(255, 255, 255, 0.75)",
          borderRadius:  14,
          padding:       "18px 24px",
          boxShadow: [
            "0 4px 24px rgba(60, 52, 137, 0.10)",  /* sombra roxa suave     */
            "0 1px 4px  rgba(0, 0, 0, 0.06)",       /* sombra base           */
            "inset 0 1px 0 rgba(255,255,255,0.9)",  /* brilho superior       */
          ].join(", "),
        }}>
          <h1 style={{
            margin: 0,
            fontSize: 23,
            fontWeight: 700,
            color: "#1a1a2e",
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
          }}>
            Projeto IC – Métodos Numéricos
          </h1>

          <p style={{
            margin: "4px 0 2px",
            fontSize: 14,
            color: "#5a5880",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
          }}>
            Plataforma de Cálculo Numérico e Pesquisa Acadêmica
          </p>

          <p style={{
            margin: "0 0 14px",
            fontSize: 13,
            color: "#8a86aa",
            fontFamily: "'Inter', sans-serif",
          }}>
            Bem-vindo ao seu ambiente de trabalho.
          </p>

          {categoriaSelecionada ? (
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(92, 84, 200, 0.12)",
              border: "1px solid rgba(92, 84, 200, 0.25)",
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: 13,
              fontWeight: 500,
              color: "#3c3489",
              fontFamily: "'Inter', sans-serif",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#4ade80", flexShrink: 0, display: "inline-block",
              }} />
              Categoria Selecionada: {categoriaSelecionada}
            </div>
          ) : (
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255, 255, 255, 0.5)",
              border: "1px solid rgba(60, 52, 137, 0.14)",
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: 13,
              color: "#7a76a0",
              fontFamily: "'Inter', sans-serif",
            }}>
              Selecione uma categoria no menu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
