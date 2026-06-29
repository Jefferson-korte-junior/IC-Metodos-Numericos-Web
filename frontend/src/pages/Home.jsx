import { useState } from "react";

// ─── Ícones das categorias ────────────────────────────────────────────────────
function IconZeros({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 11 Q5.5 4 9 11 Q12.5 18 16 11 Q17.5 7.5 20 11" />
      <line x1="2" y1="11" x2="20" y2="11" strokeWidth="0.6" strokeDasharray="2,2" opacity="0.5" />
    </svg>
  );
}
function IconSistemas({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3"    y="3"    width="6.5" height="6.5" rx="1.5" />
      <rect x="12.5" y="3"    width="6.5" height="6.5" rx="1.5" />
      <rect x="3"    y="12.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="12.5" y="12.5" width="6.5" height="6.5" rx="1.5" />
    </svg>
  );
}
function IconInterpolacao({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 17 C5 17 7 7 11 10 S16 15 20 9" />
      <circle cx="2"  cy="17" r="2" fill="currentColor" stroke="none" />
      <circle cx="11" cy="10" r="2" fill="currentColor" stroke="none" />
      <circle cx="20" cy="9"  r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconAproximacao({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="3"  cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="7"  cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="11" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7"  r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="5"  r="1.5" fill="currentColor" stroke="none" />
      <line x1="2" y1="17" x2="20" y2="4" strokeDasharray="3,2" opacity="0.7" />
    </svg>
  );
}
function IconIntegrais({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 18 C6.5 18 6 17.5 6 17 V5 C6 4.5 6.5 4 7 4" />
      <path d="M15 4 C15.5 4 16 4.5 16 5 V17 C16 17.5 15.5 18 15 18" />
    </svg>
  );
}

// ─── SVG de fundo do hero ────────────────────────────────────────────────────
function HeroBanner() {
  const dots = [];
  for (let i = 0; i <= 22; i++) {
    for (let j = 0; j <= 8; j++) {
      dots.push({ cx: 8 + i * 46, cy: 12 + j * 28, key: `${i}-${j}` });
    }
  }
  return (
    <svg viewBox="0 0 1020 250" preserveAspectRatio="xMidYMid slice" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <linearGradient id="heroBg" x1="0" y1="0" x2="1020" y2="250" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#ecebfd" />
          <stop offset="55%"  stopColor="#e2e0fb" />
          <stop offset="100%" stopColor="#d8d5f9" />
        </linearGradient>
        <linearGradient id="heroW1" x1="0" y1="0" x2="1020" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#5c54c8" stopOpacity="0.04" />
          <stop offset="35%"  stopColor="#5c54c8" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#3c3489" stopOpacity="0.72" />
        </linearGradient>
        <linearGradient id="heroW2" x1="0" y1="0" x2="1020" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#5c54c8" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#5c54c8" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id="heroVeil" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#f0effe" stopOpacity="0.72" />
          <stop offset="38%"  stopColor="#eeedfe" stopOpacity="0.28" />
          <stop offset="62%"  stopColor="#eeedfe" stopOpacity="0.0"  />
        </linearGradient>
      </defs>

      <rect width="1020" height="250" fill="url(#heroBg)" />

      {dots.map(({ cx, cy, key }) => (
        <circle key={key} cx={cx} cy={cy} r="1.3" fill="#3c3489" opacity="0.07" />
      ))}

      {/* Área de integral sombreada */}
      <path d="M620 250 L620 95 C642 82 658 64 675 52 L695 250 Z"
        fill="#3c3489" fillOpacity="0.04" />
      <path d="M695 250 L695 52 C712 60 728 80 745 72 L765 250 Z"
        fill="#3c3489" fillOpacity="0.025" />

      {/* Onda principal */}
      <path d="M-5 170 C80 170 155 45 240 72 S348 148 460 104 S565 32 668 58 S768 118 878 74 S960 46 1025 88"
        stroke="url(#heroW1)" strokeWidth="2.8" fill="none" />

      {/* Onda secundária */}
      <path d="M-5 128 C90 128 175 192 295 168 S430 88 560 128 S688 178 808 138 S908 106 1025 148"
        stroke="url(#heroW2)" strokeWidth="1.8" fill="none" />

      {/* Onda terciária */}
      <path d="M-5 208 C128 208 210 118 338 138 S472 190 608 148 S748 82 868 106 S950 146 1025 118"
        stroke="#7c74e0" strokeWidth="1.1" fill="none" opacity="0.16" />

      {/* Pontos sobre a curva principal */}
      {[[240,72],[460,104],[668,58],[878,74]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="5.5" fill="#3c3489" opacity="0.52" />
          <circle cx={cx} cy={cy} r="11"  fill="none" stroke="#3c3489" strokeWidth="1.1" opacity="0.11" />
        </g>
      ))}

      {/* Rótulos matemáticos */}
      <text x="246" y="58"  fill="#3c3489" fontSize="10" fontFamily="serif" opacity="0.42">f(x₀)</text>
      <text x="466" y="90"  fill="#3c3489" fontSize="10" fontFamily="serif" opacity="0.46">L(x)</text>
      <text x="674" y="44"  fill="#3c3489" fontSize="10" fontFamily="serif" opacity="0.46">f(xₙ)</text>

      {/* Fórmulas decorativas de fundo */}
      <text x="620" y="232" fill="#3c3489" fontSize="9" fontFamily="serif" opacity="0.09"
        transform="rotate(-2, 620, 232)">P(x) = Σ yᵢ Lᵢ(x)</text>
      <text x="770" y="30"  fill="#3c3489" fontSize="9" fontFamily="serif" opacity="0.09">∫ₐᵇ f(x) dx ≈ h/2·[f(a)+f(b)]</text>
      <text x="880" y="218" fill="#3c3489" fontSize="9" fontFamily="serif" opacity="0.08">|f(b)−f(a)| &lt; ε</text>
      <text x="48"  y="234" fill="#3c3489" fontSize="9" fontFamily="serif" opacity="0.08"
        transform="rotate(-2, 48, 234)">xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)</text>
      <text x="370" y="28"  fill="#3c3489" fontSize="9" fontFamily="serif" opacity="0.07">
        Aₙ ≈ h/3 · [f(x₀) + 4Σf(x₂ᵢ₋₁) + 2Σf(x₂ᵢ) + f(xₙ)]
      </text>
      <text x="800" y="188" fill="#3c3489" fontSize="9" fontFamily="serif" opacity="0.07">
        eᵣₑₗ = |xₙ₊₁ − xₙ| / |xₙ₊₁|
      </text>

      <rect width="1020" height="250" fill="url(#heroVeil)" />
    </svg>
  );
}

// ─── Dados das categorias ─────────────────────────────────────────────────────
const CATEGORIAS = [
  {
    categoria:  "Zero de Funções",
    label:      "Zeros de Funções",
    descricao:  "Encontre raízes de equações não lineares com precisão controlada",
    metodos:    [{ nome: "Bisseção", icone: "∩" }, { nome: "Newton", icone: "∂" }, { nome: "Secante", icone: "⟋" }],
    Icon:       IconZeros,
  },
  {
    categoria:  "Sistemas Lineares",
    label:      "Sistemas Lineares",
    descricao:  "Resolva sistemas de equações lineares por métodos iterativos",
    metodos:    [{ nome: "Jacobi", icone: "⊕" }, { nome: "Gauss-Seidel", icone: "⊗" }],
    Icon:       IconSistemas,
  },
  {
    categoria:  "Interpolação",
    label:      "Interpolação",
    descricao:  "Estime valores entre pontos conhecidos com polinômios exatos",
    metodos:    [{ nome: "Lagrange", icone: "∿" }, { nome: "Newton Interpolação", icone: "Δ" }],
    Icon:       IconInterpolacao,
  },
  {
    categoria:  "Aproximação",
    label:      "Aproximação",
    descricao:  "Ajuste curvas a conjuntos de dados pelo método dos mínimos quadrados",
    metodos:    [{ nome: "Mínimos Quadrados", icone: "≈" }],
    Icon:       IconAproximacao,
  },
  {
    categoria:  "Integrais",
    label:      "Integrais Numéricas",
    descricao:  "Calcule integrais definidas com regras compostas de alta precisão",
    metodos:    [{ nome: "Trapézio", icone: "◺" }, { nome: "Simpson", icone: "∫" }],
    Icon:       IconIntegrais,
  },
];

// ─── Card de categoria ────────────────────────────────────────────────────────
function CardCategoria({ categoria, label, descricao, metodos, Icon, aoSelecionarCategoria, aoSelecionarMetodo }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:    "#ffffff",
        borderRadius:  16,
        border:        hovered
          ? "1.5px solid rgba(92,84,200,0.38)"
          : "1.5px solid rgba(197,194,240,0.45)",
        boxShadow:     hovered
          ? "0 12px 40px rgba(60,52,137,0.13), 0 2px 8px rgba(0,0,0,0.05)"
          : "0 2px 12px rgba(60,52,137,0.06), 0 1px 3px rgba(0,0,0,0.03)",
        padding:       "24px 22px 20px",
        display:       "flex",
        flexDirection: "column",
        gap:           14,
        cursor:        "pointer",
        transform:     hovered ? "translateY(-5px)" : "translateY(0)",
        transition:    "all 0.22s ease",
        flex:          1,
        minWidth:      0,
      }}
      onClick={() => aoSelecionarCategoria(categoria)}
    >
      {/* Cabeçalho do card */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Ícone */}
        <div style={{
          width:          48,
          height:         48,
          borderRadius:   14,
          background:     hovered
            ? "linear-gradient(135deg, #3c3489, #6258d0)"
            : "linear-gradient(135deg, rgba(92,84,200,0.12), rgba(98,88,208,0.18))",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
          color:          hovered ? "#ffffff" : "#5c54c8",
          boxShadow:      hovered ? "0 4px 16px rgba(92,84,200,0.35)" : "none",
          transition:     "all 0.22s ease",
        }}>
          <Icon size={22} />
        </div>

        {/* Título e contagem */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize:     15,
            fontWeight:   700,
            color:        "#1a1a2e",
            fontFamily:   "'Inter', sans-serif",
            lineHeight:   1.25,
            marginBottom: 3,
          }}>
            {label}
          </div>
          <div style={{
            display:      "inline-flex",
            alignItems:   "center",
            gap:          4,
            background:   "rgba(92,84,200,0.08)",
            borderRadius: 20,
            padding:      "2px 8px",
            fontSize:     11,
            fontWeight:   600,
            color:        "#5c54c8",
            fontFamily:   "'Inter', sans-serif",
          }}>
            {metodos.length} {metodos.length === 1 ? "método" : "métodos"}
          </div>
        </div>
      </div>

      {/* Descrição */}
      <p style={{
        margin:     0,
        fontSize:   13,
        color:      "#6b6890",
        fontFamily: "'Inter', sans-serif",
        lineHeight: 1.55,
        flexGrow:   1,
      }}>
        {descricao}
      </p>

      {/* Pills dos métodos */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {metodos.map(({ nome, icone }) => (
          <button
            key={nome}
            onClick={e => {
              e.stopPropagation();
              aoSelecionarCategoria(categoria);
              aoSelecionarMetodo(nome);
            }}
            style={{
              display:    "inline-flex",
              alignItems: "center",
              gap:        5,
              background: "rgba(92,84,200,0.07)",
              border:     "1px solid rgba(92,84,200,0.15)",
              borderRadius: 8,
              padding:    "4px 10px",
              fontSize:   12,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              color:      "#4a44a0",
              cursor:     "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(92,84,200,0.16)";
              e.currentTarget.style.color      = "#3c3489";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(92,84,200,0.07)";
              e.currentTarget.style.color      = "#4a44a0";
            }}
          >
            <span style={{ fontSize: 13 }}>{icone}</span>
            {nome}
          </button>
        ))}
      </div>

      {/* Rodapé do card */}
      <div style={{
        display:     "flex",
        alignItems:  "center",
        justifyContent: "flex-end",
        paddingTop:  8,
        borderTop:   "1px solid rgba(197,194,240,0.3)",
      }}>
        <span style={{
          fontSize:   12,
          fontWeight: 600,
          color:      hovered ? "#5c54c8" : "#9a97c0",
          fontFamily: "'Inter', sans-serif",
          display:    "flex",
          alignItems: "center",
          gap:        4,
          transition: "color 0.2s ease",
        }}>
          Explorar
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h8M8 4l3 3-3 3" />
          </svg>
        </span>
      </div>
    </div>
  );
}

// ─── Componente estatística ───────────────────────────────────────────────────
function StatBadge({ valor, rotulo, icone }) {
  return (
    <div style={{
      display:    "inline-flex",
      alignItems: "center",
      gap:        8,
      background: "rgba(255,255,255,0.6)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border:     "1px solid rgba(255,255,255,0.8)",
      borderRadius: 24,
      padding:    "8px 16px",
      boxShadow:  "0 2px 8px rgba(60,52,137,0.08)",
    }}>
      <span style={{ fontSize: 16 }}>{icone}</span>
      <div>
        <div style={{
          fontSize:   15,
          fontWeight: 800,
          color:      "#3c3489",
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1,
        }}>{valor}</div>
        <div style={{
          fontSize:   10,
          color:      "#8a86aa",
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.4,
          fontWeight: 500,
        }}>{rotulo}</div>
      </div>
    </div>
  );
}

// ─── Home ────────────────────────────────────────────────────────────────────
export default function Home({ aoSelecionarCategoria, aoSelecionarMetodo }) {
  const totalMetodos = CATEGORIAS.reduce((acc, c) => acc + c.metodos.length, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div style={{
        position:     "relative",
        borderRadius: 20,
        overflow:     "hidden",
        minHeight:    250,
        boxShadow:    "0 4px 24px rgba(60,52,137,0.10), 0 1px 6px rgba(0,0,0,0.05)",
        border:       "1.5px solid rgba(197,194,240,0.45)",
      }}>
        {/* SVG de fundo */}
        <div style={{ position: "absolute", inset: 0 }}>
          <HeroBanner />
        </div>

        {/* Conteúdo sobreposto */}
        <div style={{
          position: "relative",
          zIndex:   1,
          padding:  "36px 40px",
          display:  "flex",
          flexDirection: "column",
          gap: 20,
          minHeight: 250,
          justifyContent: "center",
        }}>
          {/* Glass card */}
          <div style={{
            background:          "rgba(255,255,255,0.58)",
            backdropFilter:      "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border:              "1px solid rgba(255,255,255,0.82)",
            borderRadius:        18,
            padding:             "24px 30px",
            boxShadow: [
              "0 6px 32px rgba(60,52,137,0.11)",
              "0 1px 4px rgba(0,0,0,0.05)",
              "inset 0 1px 0 rgba(255,255,255,0.95)",
            ].join(", "),
            maxWidth: 520,
          }}>
            {/* Logo + título */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: "linear-gradient(135deg, #3c3489, #6258d0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 800, color: "#fff",
                boxShadow: "0 4px 16px rgba(92,84,200,0.45)",
                fontFamily: "serif",
              }}>
                Σ∫
              </div>
              <div>
                <div style={{
                  fontSize: 9, fontWeight: 700, color: "#6b68a0",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  fontFamily: "'Inter', sans-serif",
                }}>
                  Projeto IC · UTFPR
                </div>
                <h1 style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#1a1a2e",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}>
                  Métodos Numéricos
                </h1>
              </div>
            </div>

            <p style={{
              margin: "0 0 18px",
              fontSize: 14,
              color: "#5a5880",
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1.6,
              fontWeight: 450,
            }}>
              Plataforma interativa para o ensino e pesquisa de métodos numéricos
              no ensino superior. Calcule, visualize e explore cada algoritmo.
            </p>

            {/* Estatísticas */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <StatBadge valor={totalMetodos} rotulo="Métodos"    icone="⚙️" />
              <StatBadge valor={CATEGORIAS.length} rotulo="Categorias" icone="📐" />
              <StatBadge valor="IC"  rotulo="UTFPR · 2025"  icone="🎓" />
            </div>
          </div>
        </div>
      </div>

      {/* ── GRADE DE CATEGORIAS ───────────────────────────────────────────── */}
      <div>
        {/* Título da seção */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 18,
        }}>
          <div style={{
            width: 3, height: 18, borderRadius: 2,
            background: "linear-gradient(to bottom, #5c54c8, #9c96e8)",
          }} />
          <h2 style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 700,
            color: "#1a1a2e",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "-0.01em",
          }}>
            Explore as categorias
          </h2>
          <span style={{
            fontSize: 12, color: "#9a97c0", fontFamily: "'Inter', sans-serif",
          }}>
            — selecione para começar
          </span>
        </div>

        {/* Linha 1: 3 cards */}
        <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
          {CATEGORIAS.slice(0, 3).map(cat => (
            <CardCategoria
              key={cat.categoria}
              {...cat}
              aoSelecionarCategoria={aoSelecionarCategoria}
              aoSelecionarMetodo={aoSelecionarMetodo}
            />
          ))}
        </div>

        {/* Linha 2: 2 cards centralizados */}
        <div style={{ display: "flex", gap: 18, justifyContent: "center" }}>
          {CATEGORIAS.slice(3).map(cat => (
            <div key={cat.categoria} style={{ flex: "0 0 calc(33.333% - 12px)", minWidth: 0 }}>
              <CardCategoria
                {...cat}
                aoSelecionarCategoria={aoSelecionarCategoria}
                aoSelecionarMetodo={aoSelecionarMetodo}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── RODAPÉ ────────────────────────────────────────────────────────── */}
      <div style={{
        textAlign:   "center",
        paddingBottom: 8,
      }}>
        <span style={{
          fontSize:   12,
          color:      "#b0adc8",
          fontFamily: "'Inter', sans-serif",
        }}>
          Universidade Tecnológica Federal do Paraná · Iniciação Científica · 2025
        </span>
      </div>
    </div>
  );
}
