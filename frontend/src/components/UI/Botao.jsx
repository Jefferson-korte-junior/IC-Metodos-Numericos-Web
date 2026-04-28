// Botao.jsx
// Coloque em: frontend/src/components/ui/Botao.jsx
//
// Uso:
//   import Botao from '../ui/Botao'
//
//   <Botao>Calcular</Botao>
//   <Botao variante="secundario">Limpar</Botao>
//   <Botao variante="perigo">Deletar</Botao>
//   <Botao variante="metodo" ativo={metodoAtual === 'bissecao'}>Bisseção</Botao>
//   <Botao tamanho="pequeno" disabled>Salvar</Botao>

import { useState } from "react";

// ── Tokens de design — altere aqui para mudar o visual em todo o projeto
const TOKENS = {
  fontFamily: "'DM Mono', 'Fira Mono', 'Courier New', monospace",
  radius: "8px",
  transition: "all 0.18s ease",
};

// ── Paleta por variante: [fundo, texto, borda, fundoHover, fundoAtivo]
const VARIANTES = {
  primario: {
    bg:          "#3c3489",
    bgHover:     "#2e277a",
    bgAtivo:     "#231d6e",
    bgDisabled:  "#b0aed8",
    texto:       "#ffffff",
    borda:       "transparent",
  },
  secundario: {
    bg:          "#f0eff9",
    bgHover:     "#e2e0f5",
    bgAtivo:     "#d3d0ef",
    bgDisabled:  "#f5f5f5",
    texto:       "#3c3489",
    borda:       "rgba(60,52,137,0.2)",
  },
  perigo: {
    bg:          "#fff1ee",
    bgHover:     "#ffe0d9",
    bgAtivo:     "#fcc5b8",
    bgDisabled:  "#f5f5f5",
    texto:       "#c0420f",
    borda:       "rgba(192,66,15,0.25)",
  },
  sucesso: {
    bg:          "#edf7ee",
    bgHover:     "#d8f0da",
    bgAtivo:     "#bce8bf",
    bgDisabled:  "#f5f5f5",
    texto:       "#2e7d32",
    borda:       "rgba(46,125,50,0.25)",
  },
  // Variante especial para botões de seleção de método (ex: Bisseção, Newton...)
  metodo: {
    bg:          "#f5f5f7",
    bgHover:     "#eeedfe",
    bgAtivo:     "#3c3489",   // ← cor quando ativo=true
    bgDisabled:  "#f0f0f0",
    texto:       "#444",
    textoAtivo:  "#ffffff",   // texto quando ativo=true
    borda:       "rgba(0,0,0,0.1)",
    bordaAtivo:  "transparent",
  },
};

// ── Tamanhos
const TAMANHOS = {
  pequeno: { fontSize: "12px", padding: "5px 12px",  height: "30px" },
  medio:   { fontSize: "13px", padding: "7px 18px",  height: "36px" },
  grande:  { fontSize: "14px", padding: "10px 24px", height: "42px" },
};

export default function Botao({
  children,
  variante = "primario",   // primario | secundario | perigo | sucesso | metodo
  tamanho  = "medio",      // pequeno | medio | grande
  ativo    = false,        // usado por variante="metodo" para indicar selecionado
  disabled = false,
  onClick,
  style,                   // estilos extras opcionais
  ...props
}) {
  const [hover, setHover]       = useState(false);
  const [pressed, setPressed]   = useState(false);

  const v = VARIANTES[variante] ?? VARIANTES.primario;
  const t = TAMANHOS[tamanho]   ?? TAMANHOS.medio;

  // ── Resolve fundo dinâmico
  let bg    = v.bg;
  let texto = v.texto;
  let borda = v.borda ?? "transparent";

  if (disabled) {
    bg    = v.bgDisabled;
    texto = "#aaa";
    borda = "transparent";
  } else if (variante === "metodo" && ativo) {
    bg    = v.bgAtivo;
    texto = v.textoAtivo ?? "#fff";
    borda = v.bordaAtivo ?? "transparent";
  } else if (pressed) {
    bg = v.bgAtivo;
  } else if (hover) {
    bg = v.bgHover;
  }

  const estiloBase = {
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            "6px",
    fontFamily:     TOKENS.fontFamily,
    fontSize:       t.fontSize,
    fontWeight:     variante === "primario" ? 600 : 500,
    padding:        t.padding,
    height:         t.height,
    borderRadius:   TOKENS.radius,
    border:         `1px solid ${borda}`,
    background:     bg,
    color:          texto,
    cursor:         disabled ? "not-allowed" : "pointer",
    transition:     TOKENS.transition,
    userSelect:     "none",
    letterSpacing:  variante === "primario" ? "0.02em" : "normal",
    outline:        "none",
    boxShadow:
      disabled || variante === "metodo"
        ? "none"
        : hover && !pressed
        ? "0 2px 8px rgba(60,52,137,0.15)"
        : "none",
    ...style,
  };

  return (
    <button
      style={estiloBase}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      {...props}
    >
      {children}
    </button>
  );
}
