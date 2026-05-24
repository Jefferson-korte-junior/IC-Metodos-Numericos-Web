/**
 * api/metodosNumericos.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Camada de acesso ao backend — ÚNICA fonte de chamadas HTTP para métodos
 * numéricos. Nenhum hook ou componente deve usar fetch() diretamente.
 *
 * BASE_URL: usa a variável de ambiente VITE_API_URL (injetada no build).
 * Fallback: URL de produção no Render.
 */

const BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://ic-metodos-numericos-web.onrender.com";

// ─── Helper interno ──────────────────────────────────────────────────────────
async function post(endpoint, payload) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      typeof data?.detail === "string"
        ? data.detail
        : Array.isArray(data?.detail)
          ? data.detail.map(e => e.msg ?? JSON.stringify(e)).join("; ")
          : `Erro ${response.status} — ${response.statusText}`;
    throw new Error(msg);
  }

  if (data?.erro) throw new Error(data.erro);

  return data;
}

// ─── Bisseção ────────────────────────────────────────────────────────────────
export async function calcularBissecao({ funcao, a, b, criterio }) {
  return post("/calcular", { funcao, a, b, criterio });
}

// ─── Newton-Raphson ──────────────────────────────────────────────────────────
export async function calcularNewton({ funcao, x0, tolerancia, criterio, maxIter }) {
  return post("/newton", {
    funcao,
    x0:         parseFloat(x0),
    tolerancia: parseFloat(tolerancia),
    criterio:   criterio   ?? "absoluto",
    max_iter:   parseInt(maxIter) || 100,
  });
}

// ─── Secante ─────────────────────────────────────────────────────────────────
export async function calcularSecante({ funcao, x0, x1, tolerancia, criterio, maxIter }) {
  return post("/secante", {
    funcao,
    x0:         parseFloat(x0),
    x1:         parseFloat(x1),
    tolerancia: parseFloat(tolerancia),
    criterio:   criterio   ?? "absoluto",
    max_iter:   parseInt(maxIter) || 100,
  });
}

// ─── Jacobi ──────────────────────────────────────────────────────────────────
export async function calcularJacobi({ A, b, chute, tolerancia }) {
  return post("/jacobi", { A, b, chute, tolerancia });
}

// ─── Gauss-Seidel ────────────────────────────────────────────────────────────
export async function calcularGaussSeidel({ A, b, chute, tolerancia }) {
  return post("/gauss-seidel", { A, b, chute, tolerancia });
}

// ─── Lagrange ────────────────────────────────────────────────────────────────
export async function calcularLagrange({ pontos, x_eval }) {
  return post("/lagrange", { pontos, x_eval });
}
