function MathBanner() {
  return (
    <svg
      viewBox="0 0 300 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="bannerBg" x1="0" y1="0" x2="300" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#eeedfe" />
          <stop offset="100%" stopColor="#dddcf8" />
        </linearGradient>
        <linearGradient id="waveMain" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#5c54c8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3c3489" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <rect width="300" height="130" rx="0" fill="url(#bannerBg)" />

      {/* Pontos de grade */}
      {[0, 1, 2, 3, 4, 5].map(i =>
        [0, 1, 2, 3].map(j => (
          <circle
            key={`${i}-${j}`}
            cx={18 + i * 52}
            cy={18 + j * 32}
            r="1.4"
            fill="#3c3489"
            opacity="0.12"
          />
        ))
      )}

      {/* Curva principal – interpolação */}
      <path
        d="M-5 95 C25 95 45 22 72 44 S112 88 142 54 S192 16 232 36 S268 74 305 52"
        stroke="url(#waveMain)"
        strokeWidth="2.5"
        fill="none"
      />

      {/* Curva secundária */}
      <path
        d="M-5 68 C35 68 55 98 95 88 S155 44 195 66 S242 98 305 78"
        stroke="#5c54c8"
        strokeWidth="1.5"
        fill="none"
        opacity="0.35"
      />

      {/* Curva terciária */}
      <path
        d="M-5 112 C48 112 68 58 108 74 S168 96 208 64 S268 30 305 46"
        stroke="#7c74e0"
        strokeWidth="1"
        fill="none"
        opacity="0.22"
      />

      {/* Pontos sobre a curva principal */}
      {[[72, 44], [142, 54], [232, 36]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="4.5" fill="#3c3489" opacity="0.7" />
          <circle cx={cx} cy={cy} r="8"   fill="none" stroke="#3c3489" strokeWidth="1" opacity="0.22" />
        </g>
      ))}

      {/* Área sombreada (conceito de integral) */}
      <path
        d="M92 130 L92 88 C112 74 128 64 144 54 L144 130 Z"
        fill="#3c3489"
        fillOpacity="0.05"
      />

      {/* Rótulos matemáticos */}
      <text x="77"  y="34" fill="#3c3489" fontSize="9" fontFamily="serif" opacity="0.55">f(x₀)</text>
      <text x="147" y="43" fill="#3c3489" fontSize="9" fontFamily="serif" opacity="0.55">L(x)</text>
      <text x="237" y="26" fill="#3c3489" fontSize="9" fontFamily="serif" opacity="0.55">f(xₙ)</text>

      {/* Fórmula de fundo */}
      <text x="12" y="120" fill="#3c3489" fontSize="8" fontFamily="serif" opacity="0.13"
        transform="rotate(-4, 12, 120)">
        P(x) = Σ yᵢ Lᵢ(x)
      </text>
      <text x="175" y="22" fill="#3c3489" fontSize="8" fontFamily="serif" opacity="0.12">
        ∫f(x) dx
      </text>
    </svg>
  );
}

export default function Header({ categoriaSelecionada }) {
  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 16,
      marginBottom: 20,
      display: "flex",
      alignItems: "stretch",
      justifyContent: "space-between",
      boxShadow: "0 2px 16px rgba(60,52,137,0.07), 0 1px 4px rgba(0,0,0,0.04)",
      border: "1px solid rgba(197,194,240,0.4)",
      overflow: "hidden",
      minHeight: 130,
    }}>
      {/* Conteúdo textual à esquerda */}
      <div style={{ padding: "26px 30px", flex: 1, minWidth: 0 }}>
        <h1 style={{
          margin: 0,
          fontSize: 22,
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
          fontSize: 13,
          color: "#6b6890",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
        }}>
          Plataforma de Cálculo Numérico e Pesquisa Acadêmica
        </p>
        <p style={{
          margin: "0 0 14px",
          fontSize: 12,
          color: "#a09ab8",
          fontFamily: "'Inter', sans-serif",
        }}>
          Bem-vindo ao seu ambiente de trabalho.
        </p>

        {categoriaSelecionada ? (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(92,84,200,0.07)",
            border: "1px solid rgba(92,84,200,0.18)",
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 12,
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
            background: "rgba(0,0,0,0.03)",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 12,
            color: "#9ca3af",
            fontFamily: "'Inter', sans-serif",
          }}>
            Selecione uma categoria no menu
          </div>
        )}
      </div>

      {/* Banner decorativo à direita */}
      <div style={{ width: 300, flexShrink: 0, position: "relative" }}>
        <MathBanner />
      </div>
    </div>
  );
}
