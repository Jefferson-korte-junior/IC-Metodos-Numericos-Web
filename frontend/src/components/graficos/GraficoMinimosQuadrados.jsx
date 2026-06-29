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

/** Avalia polinômio: a0 + a1*x + a2*x² + a3*x³ */
function avaliarPoly(coefs, x) {
  return coefs.reduce((acc, c, i) => acc + c * Math.pow(x, i), 0);
}

/**
 * Props:
 *   pontos       {Array}   — [[x, y], ...] pontos originais
 *   coeficientes {Array}   — [a0, a1, a2, ...] coeficientes do polinômio
 *   grau         {number}  — grau do polinômio
 *   rQuadrado    {number?} — R² para exibição na legenda
 */
export default function GraficoMinimosQuadrados({ pontos, coeficientes, grau, rQuadrado }) {
  if (!pontos || pontos.length < 2 || !coeficientes || coeficientes.length === 0) return null;

  const xs = pontos.map(p => parseFloat(p[0]));
  const ys = pontos.map(p => parseFloat(p[1]));

  if (xs.some(isNaN) || ys.some(isNaN)) return null;

  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const margem = Math.max((xMax - xMin) * 0.12, 0.5);
  const xL = xMin - margem;
  const xR = xMax + margem;

  // Curva de regressão
  const N = 300;
  const curva = [];
  for (let i = 0; i <= N; i++) {
    const x = xL + (i / N) * (xR - xL);
    const y = avaliarPoly(coeficientes, x);
    if (Number.isFinite(y)) curva.push({ x, y });
  }

  const grauLabel = grau === 1 ? "Linear" : grau === 2 ? "Quadrática" : "Cúbica";
  const r2Label = rQuadrado !== undefined
    ? ` (R² = ${Number(rQuadrado).toFixed(4)})`
    : "";

  const data = {
    datasets: [
      // Curva de regressão
      {
        label: `Regressão ${grauLabel}${r2Label}`,
        data: curva,
        borderColor: "#5c54c8",
        backgroundColor: "transparent",
        showLine: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0,
        order: 2,
      },
      // Pontos originais
      {
        label: "Pontos dados",
        data: xs.map((x, i) => ({ x, y: ys[i] })),
        backgroundColor: "rgba(220,100,50,0.85)",
        borderColor: "#dc6432",
        pointRadius: 5,
        pointHoverRadius: 7,
        showLine: false,
        order: 1,
      },
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
        title: { display: true, text: "y", font: { size: 12 } },
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
        Curva de Regressão
      </div>
      <div style={{ height: 260, position: "relative" }}>
        <Scatter data={data} options={options} />
      </div>
    </div>
  );
}
