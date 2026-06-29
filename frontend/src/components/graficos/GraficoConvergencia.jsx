import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

ChartJS.register(LinearScale, CategoryScale, PointElement, LineElement, Tooltip, Legend);

const CORES = [
  "#5c54c8", "#16a34a", "#dc6432", "#2563eb",
  "#7c3aed", "#0d9488", "#db2777", "#ca8a04",
  "#64748b", "#991b1b",
];

const SUB = ["₁","₂","₃","₄","₅","₆","₇","₈","₉","₁₀"];

/**
 * Props:
 *   iteracoes {Array}  — [{iteracao, valores: [x1, x2, ...]}]
 *   n         {number} — número de variáveis
 */
export default function GraficoConvergencia({ iteracoes, n }) {
  if (!iteracoes || iteracoes.length === 0) return null;

  const datasets = Array.from({ length: n }, (_, i) => ({
    label: `x${SUB[i]}`,
    data: iteracoes.map((it, idx) => ({ x: idx + 1, y: it.valores[i] })),
    borderColor: CORES[i % CORES.length],
    backgroundColor: CORES[i % CORES.length] + "22",
    showLine: true,
    pointRadius: iteracoes.length <= 30 ? 3 : 0,
    pointHoverRadius: 5,
    borderWidth: 1.8,
    tension: 0.2,
    fill: false,
  }));

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
          title: ctx => `Iteração ${ctx[0].raw.x}`,
          label: ctx => `${ctx.dataset.label} = ${ctx.raw.y.toFixed(8)}`,
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        title: { display: true, text: "Iteração", font: { size: 12 } },
        grid: { color: "#f0f0f0" },
        ticks: { stepSize: 1 },
      },
      y: {
        type: "linear",
        title: { display: true, text: "Valor", font: { size: 12 } },
        grid: { color: "#f0f0f0" },
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
        Convergência das Variáveis
      </div>
      <div style={{ height: 240, position: "relative" }}>
        <Scatter data={{ datasets }} options={options} />
      </div>
    </div>
  );
}
