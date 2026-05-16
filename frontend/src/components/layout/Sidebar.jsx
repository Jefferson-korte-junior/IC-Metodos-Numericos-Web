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

const MENU_ITEMS = [
  { label: "Zeros de Funções",  categoria: "Zero de Funções",  Icon: IconZeros        },
  { label: "Sistemas Lineares", categoria: "Sistemas Lineares", Icon: IconSistemas     },
  { label: "Interpolação",      categoria: "Interpolação",      Icon: IconInterpolacao },
  { label: "Integrais",         categoria: "Integrais",         Icon: IconIntegrais    },
];

function Sidebar({ aoSelecionarcategoria, categoriaSelecionada }) {
  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      backgroundColor: "#0f0e1a",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Área do logo */}
      <div style={{
        padding: "22px 18px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        gap: 11,
      }}>
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
      <nav style={{ padding: "14px 10px", flex: 1 }}>
        <div style={{
          fontSize: 9, fontWeight: 700, color: "#3a3860",
          letterSpacing: "0.12em", textTransform: "uppercase",
          marginBottom: 8, paddingLeft: 10,
        }}>
          Categorias
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {MENU_ITEMS.map(({ label, categoria, Icon }) => {
            const isActive = categoriaSelecionada === categoria;
            return (
              <li key={categoria} style={{ marginBottom: 2 }}>
                <button
                  onClick={() => aoSelecionarcategoria(categoria)}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", gap: 10,
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
                  <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.5 }}>
                    <Icon />
                  </span>
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Rodapé – UTFPR */}
      <div style={{
        padding: "16px 18px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        {/* Marca geométrica da UTFPR */}
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="https://www.bing.com/images/search?view=detailV2&ccid=RIghS0cI&id=D5A009D23C4D532A70E647A1282C3B9D7ACBE8FA&thid=OIP.RIghS0cIyk_O-n25oEDUmQHaFy&mediaurl=https%3a%2f%2fprojeto-cdn.infra.grancursosonline.com.br%2funiversidade-tecnologica-federal-do-parana.png&cdnurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.4488214b4708ca4fcefa7db9a040d499%3frik%3d%252bujLep07LCihRw%26pid%3dImgRaw%26r%3d0&exph=774&expw=990&q=Simbolo+UTFPR&FORM=IRPRST&ck=E4EE5EF6486FAB04479159D46EBBCC4E&selectedIndex=0&itb=0&ajaxhist=0&ajaxserp=0" style={{ flexShrink: 0 }}>
          {/* Quadrado externo */}
          <rect x="2" y="2" width="36" height="36" rx="4" stroke="#5c54c8" strokeWidth="2" fill="none" opacity="0.6" />
          {/* Letra U estilizada */}
          <path d="M10 12 L10 24 Q10 30 20 30 Q30 30 30 24 L30 12" stroke="#a09af0" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Barra superior do U */}
          <line x1="10" y1="12" x2="30" y2="12" stroke="#a09af0" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
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
