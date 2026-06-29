import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

/** Avalia o polinômio de Lagrange nos pontos (xs, ys) em x. */
function lagrange(xs, ys, x) {
  const n = xs.length;
  let result = 0;
  for (let i = 0; i < n; i++) {
    let Li = 1;
    for (let j = 0; j < n; j++) {
      if (j !== i) Li *= (x - xs[j]) / (xs[i] - xs[j]);
    }
    result += ys[i] * Li;
  }
  return result;
}

/**
 * Avalia o polinômio de Newton por diferenças divididas em x.
 * coefs = [c0, c1, ..., cn-1], xs = [x0, x1, ..., xn-1]
 * Usa o método de Horner de trás para frente.
 */
function newtonPoly(coefs, xs, x) {
  const n = coefs.length;
  let result = coefs[n - 1];
  for (let k = n - 2; k >= 0; k--) {
    result = result * (x - xs[k]) + coefs[k];
  }
  return result;
}

/**
 * Props:
 *   pontos    {Array}   — [[x, y], ...] pontos de interpolação
 *   xEval     {number}  — ponto onde o valor foi calculado
 *   yEval     {number}  — valor interpolado em xEval
 *   metodo    {string}  — "lagrange" | "newton"
 *   coefs     {Array?}  — coeficientes de Newton (para metodo="newton")
 */
export default function GraficoInterpolacao({ pontos, xEval, yEval, metodo = "lagrange", coefs }) {
  if (!pontos || pontos.length < 2) return null;

  const xs = pontos.map(p => parseFloat(p[0]));
  const ys = pontos.map(p => parseFloat(p[1]));

  if (xs.some(isNaN) || ys.some(isNaN)) return null;

  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const margem = Math.max((xMax - xMin) * 0.15, 0.5);
  const xL = xMin - margem;
  const xR = xMax + margem;

  // Curva do polinômio
  const N_AMOSTRAS = 300;
  const curva = [];
  for (let i = 0; i <= N_AMOSTRAS; i++) {
    const x = xL + (i / N_AMOSTRAS) * (xR - xL);
    let y;
    if (metodo === "newton" && coefs) {
      y = newtonPoly(coefs, xs, x);
    } else {
      y = lagrange(xs, ys, x);
    }
    if (Number.isFinite(y)) curva.push({ x, y });
  }

  if (curva.length < 2) return null;

  const data = {
    datasets: [
      // Curva polinomial
      {
        label: "P(x)",
        data: curva,
        borderColor: "#5c54c8",
        backgroundColor: "transparent",
        showLine: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0,
        order: 3,
      },
      // Pontos de interpolação
      {
        label: "Pontos dados",
        data: xs.map((x, i) => ({ x, y: ys[i] })),
        backgroundColor: "#3c3489",
        borderColor: "#3c3489",
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false,
        order: 2,
      },
      // Ponto avaliado
      ...(xEval !== undefined && yEval !== undefined
        ? [{
            label: `P(${Number(xEval).toFixed(4)})`,
            data: [{ x: Number(xEval), y: Number(yEval) }],
            backgroundColor: "#dc2626",
            borderColor: "#dc2626",
            pointRadius: 8,
            pointStyle: "star",
            pointHoverRadius: 11,
            showLine: false,
            order: 1,
          }]
        : []),
    ],
  };

  const allY = curva.map(p => p.y).concat(ys);
  const yMin = Math.min(...allY);
  const yMax = Math.max(...allY);
  const yMarg = Math.max((yMax - yMin) * 0.12, 0.5);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: { boxWidth: 10, font: { size: 11 }, padding: 10 },
      },
      tooltip: {
        callbacks: {
          label: ctx => {
            const { x, y } = ctx.raw;
            return `x = ${x.toFixed(4)}, y = ${y.toFixed(6)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        title: { display: true, text: "x", font: { size: 12 } },
        grid: { color: "#f0f0f0" },
      },
      y: {
        type: "linear",
        title: { display: true, text: "P(x)", font: { size: 12 } },
        grid: { color: "#f0f0f0" },
        min: yMin - yMarg,
        max: yMax + yMarg,
      },
    },
  };

  return (
    <div style={{
      marginTop: 24,
      background: "#fff",
      border: "1px solid rgba(197,194,240,0.4)",
      borderRadius: 12,
      padding: "16px 18px",
    }}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: "#5c54c8",
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12,
      }}>
        Polinômio Interpolador
      </div>
      <div style={{ height: 260, position: "relative" }}>
        <Scatter data={data} options={options} />
      </div>
    </div>
  );
}
