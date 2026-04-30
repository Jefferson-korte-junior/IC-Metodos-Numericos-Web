/**
 * api/metodosNumericos.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Camada de acesso ao backend — única fonte de chamadas HTTP para métodos
 * numéricos. Nenhum outro arquivo do frontend deve fazer fetch direto para
 * esses endpoints.
 *
 * Estrutura de retorno bem-sucedido (todos os métodos):
 *   { raiz: number, iteracoes: Array<object> }
 *
 * Estrutura de erro lançado:
 *   Error com .message descritivo (vindo do backend ou de rede)
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// ─── Helper interno ──────────────────────────────────────────────────────────

/**
 * Faz POST para um endpoint, trata erros HTTP e de rede de forma uniforme.
 * @param {string} endpoint  - ex: "/calcular"
 * @param {object} payload   - corpo JSON
 * @returns {Promise<object>} - resposta JSON parseada
 */
async function post(endpoint, payload) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
  } catch (networkError) {
    // fetch() lança apenas em falha de rede (offline, CORS bloqueado, etc.)
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // FastAPI retorna { detail: "..." } em erros 4xx/5xx
    const msg = data?.detail ?? `Erro ${response.status} — ${response.statusText}`;
    throw new Error(msg);
  }

  // Backend pode retornar { erro: "..." } em HTTP 200 (padrão legado)
  if (data?.erro) {
    throw new Error(data.erro);
  }

  return data;
}

// ─── API pública ─────────────────────────────────────────────────────────────

/**
 * Método da Bisseção.
 *
 * @param {object} params
 * @param {string} params.funcao    - ex: "x**2 - 4"
 * @param {number} params.a         - extremo esquerdo do intervalo
 * @param {number} params.b         - extremo direito do intervalo
 * @param {number} params.criterio  - tolerância de parada, ex: 0.0001
 *
 * @returns {Promise<{
 *   raiz: number,
 *   iteracoes: Array<{
 *     iteracao: number, a: number, b: number,
 *     media: number, fa: number, fb: number,
 *     fm: number, substituiu: "a"|"b"
 *   }>
 * }>}
 */
export async function calcularBissecao({ funcao, a, b, criterio }) {
  return post("/calcular", { funcao, a, b, criterio });
}

/**
 * Método de Newton-Raphson.
 *
 * @param {object} params
 * @param {string} params.funcao    - ex: "x**3 - 2*x - 5"
 * @param {number} params.inicial   - chute inicial x₀
 * @param {number} params.criterio  - tolerância de parada
 *
 * @returns {Promise<{
 *   raiz: number,
 *   iteracoes: Array<{
 *     iteracao: number, x: number, fx: number, fdx: number
 *   }>
 * }>}
 */
export async function calcularNewton({ funcao, inicial, criterio }) {
  return post("/newton", { funcao, inicial, criterio });
}

/**
 * Método da Secante.
 *
 * @param {object} params
 * @param {string} params.funcao    - ex: "cos(x) - x"
 * @param {number} params.a         - primeiro ponto inicial x₀
 * @param {number} params.b         - segundo ponto inicial x₁
 * @param {number} params.criterio  - tolerância de parada
 *
 * @returns {Promise<{
 *   raiz: number,
 *   iteracoes: Array<{
 *     iteracao: number, a: number, b: number, fa: number, fb: number
 *   }>
 * }>}
 */
export async function calcularSecante({ funcao, a, b, criterio }) {
  return post("/secante", { funcao, a, b, criterio });
}
