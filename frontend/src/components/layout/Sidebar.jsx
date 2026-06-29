import { useState, useEffect } from "react";

function IconZeros() {
  return (
    <svg width="17" height="17" viewBox="0 0 22 22" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 11 Q5.5 4 9 11 Q12.5 18 16 11 Q17.5 7.5 20 11" />
      <line x1="2" y1="11" x2="20" y2="11" strokeWidth="0.6" strokeDasharray="2,2" opacity="0.5" />
    </svg>
  );
}

function IconSistemas() {
  return (
    <svg width="17" height="17" viewBox="0 0 22 22" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3"    y="3"    width="6.5" height="6.5" rx="1.5" />
      <rect x="12.5" y="3"    width="6.5" height="6.5" rx="1.5" />
      <rect x="3"    y="12.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="12.5" y="12.5" width="6.5" height="6.5" rx="1.5" />
    </svg>
  );
}

function IconInterpolacao() {
  return (
    <svg width="17" height="17" viewBox="0 0 22 22" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 17 C5 17 7 7 11 10 S16 15 20 9" />
      <circle cx="2"  cy="17" r="2" fill="currentColor" stroke="none" />
      <circle cx="11" cy="10" r="2" fill="currentColor" stroke="none" />
      <circle cx="20" cy="9"  r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconIntegrais() {
  return (
    <svg width="17" height="17" viewBox="0 0 22 22" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 18 C6.5 18 6 17.5 6 17 V5 C6 4.5 6.5 4 7 4" />
      <path d="M15 4 C15.5 4 16 4.5 16 5 V17 C16 17.5 15.5 18 15 18" />
    </svg>
  );
}

function IconAproximacao() {
  return (
    <svg width="17" height="17" viewBox="0 0 22 22" fill="none"
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

function IconChevron({ aberto }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 10 10" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      style={{
        transform: aberto ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
        flexShrink: 0,
      }}
    >
      <path d="M3 2 L7 5 L3 8" />
    </svg>
  );
}

const METODO_ICONES = {
  "Bisseção":            "∩",
  "Newton":              "∂",
  "Secante":             "⟋",
  "Jacobi":              "⊕",
  "Gauss-Seidel":        "⊗",
  "Lagrange":            "∿",
  "Newton Interpolação": "Δ",
  "Mínimos Quadrados":   "≈",
  "Trapézio":            "◺",
  "Simpson":             "∫",
};

const METODOS_POR_CATEGORIA = {
  "Zero de Funções":   ["Bisseção", "Newton", "Secante"],
  "Sistemas Lineares": ["Jacobi", "Gauss-Seidel"],
  "Interpolação":      ["Lagrange", "Newton Interpolação"],
  "Aproximação":       ["Mínimos Quadrados"],
  "Integrais":         ["Trapézio", "Simpson"],
};

const MENU_ITEMS = [
  { label: "Zeros de Funções",  categoria: "Zero de Funções",  Icon: IconZeros        },
  { label: "Sistemas Lineares", categoria: "Sistemas Lineares", Icon: IconSistemas     },
  { label: "Interpolação",      categoria: "Interpolação",      Icon: IconInterpolacao },
  { label: "Aproximação",       categoria: "Aproximação",       Icon: IconAproximacao  },
  { label: "Integrais",         categoria: "Integrais",         Icon: IconIntegrais    },
];

function Sidebar({ aoSelecionarcategoria, categoriaSelecionada, aoSelecionarMetodo, metodoAtivo, aoIrParaHome, aoSelecionarComparacao, comparacaoAtiva }) {
  const [categoriaAberta, setCategoriaAberta] = useState(null);

  // Sincroniza o accordion quando a categoria muda externamente (ex: clique no Home)
  useEffect(() => {
    if (categoriaSelecionada) {
      setCategoriaAberta(categoriaSelecionada);
    } else {
      setCategoriaAberta(null);
    }
  }, [categoriaSelecionada]);

  function handleCategoriaClick(categoria) {
    if (categoriaAberta === categoria) {
      setCategoriaAberta(null);
    } else {
      setCategoriaAberta(categoria);
      aoSelecionarcategoria(categoria);
    }
  }

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      backgroundColor: "#0f0e1a",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Logo — clique vai para Home */}
      <div
        onClick={aoIrParaHome}
        title="Ir para o início"
        style={{
          padding: "22px 18px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 11,
          cursor: "pointer",
          transition: "opacity 0.15s ease",
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg, #3c3489, #6258d0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 800, color: "#fff",
          boxShadow: "0 4px 14px rgba(92,84,200,0.5)",
          letterSpacing: "-0.5px",
          fontFamily: "serif",
        }}>
          Σ∫
        </div>
        <div>
          <div style={{
            fontSize: 9, fontWeight: 700, color: "#4a4869",
            letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1,
          }}>
            Projeto IC
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#c8c4e4", lineHeight: 1.5 }}>
            Métodos Numéricos
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav style={{ padding: "14px 10px", flex: 1, overflowY: "auto" }}>

        {/* Botão Home */}
        <button
          onClick={aoIrParaHome}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", gap: 9,
            padding: "9px 12px", borderRadius: 9, marginBottom: 10,
            border: "1px solid transparent",
            background: "transparent",
            cursor: "pointer",
            fontSize: 13, fontWeight: 500,
            color: "#6b6890",
            fontFamily: "'Inter', -apple-system, sans-serif",
            textAlign: "left",
            transition: "all 0.15s ease",
            outline: "none",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "#a8a4c8";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#6b6890";
          }}
        >
          <svg width="15" height="15" viewBox="0 0 22 22" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
            <path d="M8 20V13h6v7" />
          </svg>
          Início
        </button>

        <div style={{
          fontSize: 9, fontWeight: 700, color: "#3a3860",
          letterSpacing: "0.12em", textTransform: "uppercase",
          marginBottom: 8, paddingLeft: 10,
        }}>
          Categorias
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {MENU_ITEMS.map(({ label, categoria, Icon }) => {
            const isActive  = categoriaSelecionada === categoria;
            const isAberta  = categoriaAberta === categoria;
            const metodos   = METODOS_POR_CATEGORIA[categoria] || [];

            return (
              <li key={categoria} style={{ marginBottom: 2 }}>
                {/* Botão da categoria */}
                <button
                  onClick={() => handleCategoriaClick(categoria)}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "10px 12px", borderRadius: 9,
                    border: isActive
                      ? "1px solid rgba(100,90,220,0.32)"
                      : "1px solid transparent",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    background: isActive ? "rgba(100,90,220,0.14)" : "transparent",
                    color: isActive ? "#a09af0" : "#6b6890",
                    transition: "all 0.15s ease",
                    textAlign: "left",
                    outline: "none",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.color = "#a8a4c8";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#6b6890";
                    }
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.5 }}>
                      <Icon />
                    </span>
                    {label}
                  </span>
                  <span style={{ opacity: isActive ? 0.7 : 0.35, color: isActive ? "#a09af0" : "#6b6890" }}>
                    <IconChevron aberto={isAberta} />
                  </span>
                </button>

                {/* Métodos (accordion) */}
                {isAberta && (
                  <ul style={{ listStyle: "none", padding: "2px 0 6px 0", margin: 0 }}>
                    {metodos.map((metodo) => {
                      const isMetodoAtivo = metodoAtivo === metodo;
                      return (
                        <li key={metodo}>
                          <button
                            onClick={() => aoSelecionarMetodo(metodo)}
                            style={{
                              width: "100%",
                              display: "flex", alignItems: "center", gap: 8,
                              padding: "7px 12px 7px 34px",
                              border: "none",
                              borderRadius: 7,
                              cursor: "pointer",
                              fontSize: 12,
                              fontFamily: "'Inter', -apple-system, sans-serif",
                              fontWeight: isMetodoAtivo ? 600 : 400,
                              background: isMetodoAtivo
                                ? "rgba(100,90,220,0.2)"
                                : "transparent",
                              color: isMetodoAtivo ? "#c4c0ff" : "#55536e",
                              transition: "all 0.12s ease",
                              textAlign: "left",
                              outline: "none",
                            }}
                            onMouseEnter={e => {
                              if (!isMetodoAtivo) {
                                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                e.currentTarget.style.color = "#8a85b8";
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isMetodoAtivo) {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "#55536e";
                              }
                            }}
                          >
                            <span style={{
                              fontSize: 13, lineHeight: 1,
                              opacity: isMetodoAtivo ? 1 : 0.55,
                              width: 16, textAlign: "center", flexShrink: 0,
                            }}>
                              {METODO_ICONES[metodo] ?? "·"}
                            </span>
                            {metodo}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        {/* Seção: Comparação de Métodos */}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{
            fontSize: 9, fontWeight: 700, color: "#3a3860",
            letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: 8, paddingLeft: 10,
          }}>
            Comparação de Métodos
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              { tipo: "zeros",        label: "Zero de Funções"    },
              { tipo: "interpolacao", label: "Interpolação"       },
              { tipo: "integrais",    label: "Integrais Numéricas"},
              { tipo: "sistemas",     label: "Sistemas Lineares"  },
            ].map(({ tipo, label }) => {
              const isAtivo = comparacaoAtiva === tipo;
              return (
                <li key={tipo}>
                  <button
                    onClick={() => aoSelecionarComparacao(tipo)}
                    style={{
                      width: "100%",
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 9,
                      border: isAtivo
                        ? "1px solid rgba(100,90,220,0.32)"
                        : "1px solid transparent",
                      background: isAtivo
                        ? "rgba(100,90,220,0.15)"
                        : "transparent",
                      cursor: "pointer",
                      fontSize: 13,
                      fontFamily: "'Inter', -apple-system, sans-serif",
                      fontWeight: isAtivo ? 600 : 400,
                      color: isAtivo ? "#c4c0ff" : "#6b6890",
                      textAlign: "left",
                      transition: "all 0.12s ease",
                      outline: "none",
                    }}
                    onMouseEnter={e => {
                      if (!isAtivo) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                        e.currentTarget.style.color = "#a8a4c8";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isAtivo) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#6b6890";
                      }
                    }}
                  >
                    <span style={{ fontSize: 11, opacity: 0.7, flexShrink: 0 }}>⟷</span>
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Rodapé UTFPR */}
      <div style={{
        padding: "16px 18px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <svg
          width="38" height="38" viewBox="0 0 38 38" fill="none"
          xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}
        >
          <rect width="38" height="38" rx="6" fill="#005FAA" />
          <rect x="7"  y="7" width="6" height="17" rx="1.5" fill="white" />
          <rect x="25" y="7" width="6" height="17" rx="1.5" fill="white" />
          <path d="M7 21 C7 32 31 32 31 21" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
          <rect x="7" y="7" width="24" height="4" rx="1.5" fill="white" opacity="0.45" />
          <circle cx="19" cy="22" r="2" fill="#005FAA" />
        </svg>
        <div>
          <div style={{
            fontSize: 12, fontWeight: 700, color: "#a09af0",
            letterSpacing: "0.06em", lineHeight: 1,
          }}>
            UTFPR
          </div>
          <div style={{
            fontSize: 9, color: "#4a4869", lineHeight: 1.4,
            fontFamily: "'Inter', sans-serif",
          }}>
            Universidade Tecnológica<br />Federal do Paraná
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
