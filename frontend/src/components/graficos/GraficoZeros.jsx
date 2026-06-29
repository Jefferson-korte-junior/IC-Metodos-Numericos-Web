import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import { gerarCurva } from "../../utils/avaliarFuncao";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const COR_CURVA   = "#5c54c8";
const COR_ITER    = "rgba(220,100,50,0.8)";
const COR_RAIZ    = "#16a34a";
const COR_EIXO    = "rgba(100,100,100,0.5)";

/**
 * Props:
 *   funcao     {string}  — expressão matemática em x
 *   xMin       {number}  — início do eixo x
 *   xMax       {number}  — fim do eixo x
 *   pontosIter {Array}   — [{x, y, label}] pontos das iterações
 *   raiz       {number}  — valor da raiz convergida
 *   titulo     {string?}
 */
export default function GraficoZeros({ funcao, xMin, xMax, pontosIter = [], raiz }) {
  if (!funcao || xMin === undefined || xMax === undefined) return null;

  // Expande ligeiramente a janela de visualização
  const margem = Math.max((xMax - xMin) * 0.15, 0.5);
  const xL = xMin - margem;
  const xR = xMax + margem;

  const curva = gerarCurva(funcao, xL, xR, 350);
  if (curva.length < 2) return null;

  const ys = curva.map(p => p.y).filter(Number.isFinite);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const yMargin = Math.max((yMax - yMin) * 0.15, 0.5);

  // Linha y = 0
  const eixoX = [{ x: xL, y: 0 }, { x: xR, y: 0 }];

  const data = {
    datasets: [
      // Curva f(x)
      {
        label: "f(x)",
        data: curva,
        borderColor: COR_CURVA,
        backgroundColor: "transparent",
        showLine: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0,
        order: 3,
      },
      // Eixo y = 0
      {
        label: "y = 0",
        data: eixoX,
        borderColor: COR_EIXO,
        borderWidth: 1.2,
        borderDash: [5, 4],
        showLine: true,
        pointRadius: 0,
        backgroundColor: "transparent",
        order: 4,
      },
      // Pontos das iterações
      ...(pontosIter.length > 0
        ? [{
            label: "Iterações",
            data: pontosIter,
            backgroundColor: COR_ITER,
            borderColor: "rgba(220,100,50,1)",
            pointRadius: 5,
            pointHoverRadius: 7,
            showLine: false,
            order: 2,
          }]
        : []),
      // Raiz
      ...(raiz !== undefined && raiz !== null
        ? [{
            label: "Raiz",
            data: [{ x: raiz, y: 0 }],
            backgroundColor: COR_RAIZ,
            borderColor: "#15803d",
            pointRadius: 9,
            pointStyle: "star",
            pointHoverRadius: 12,
            showLine: false,
            order: 1,
          }]
        : []),
    ],
  };

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
            return `x = ${x.toFixed(6)}, f(x) = ${Number.isFinite(y) ? y.toFixed(6) : "—"}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        title: { display: true, text: "x", font: { size: 12 } },
        grid: { color: "#f0f0f0" },
        min: xL,
        max: xR,
      },
      y: {
        type: "linear",
        title: { display: true, text: "f(x)", font: { size: 12 } },
        grid: { color: "#f0f0f0" },
        min: yMin - yMargin,
        max: yMax + yMargin,
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
        Visualização Gráfica
      </div>
      <div style={{ height: 260, position: "relative" }}>
        <Scatter data={data} options={options} />
      </div>
    </div>
  );
}
