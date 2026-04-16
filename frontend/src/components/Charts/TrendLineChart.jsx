import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const TrendLineChart = ({ data }) => {
  const chartData = {
    labels: data?.map(d => new Date(d.date).toLocaleDateString()) || [],
    datasets: [
      {
        fill: true,
        label: 'Attendance Trend %',
        data: data?.map(d => d.percentage) || [],
        borderColor: 'rgba(129, 140, 248, 1)',
        backgroundColor: 'rgba(129, 140, 248, 0.2)',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      y: { min: 0, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    },
    plugins: {
      legend: { position: 'top', labels: { color: '#94a3b8' } }
    }
  };

  return <Line options={options} data={chartData} />;
};
export default TrendLineChart;
