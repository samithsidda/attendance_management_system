import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyBarChart = ({ monthlyData }) => {
  // monthlyData: [{ date: '2023-10-01', present: 10, absent: 2 }, ...]
  
  const data = {
    labels: monthlyData?.map(d => new Date(d.date).getDate()) || [],
    datasets: [
      {
        label: 'Present',
        data: monthlyData?.map(d => d.present) || [],
        backgroundColor: 'rgba(52, 211, 153, 0.8)',
      },
      {
        label: 'Absent',
        data: monthlyData?.map(d => d.absent) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: { stacked: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { stacked: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
    plugins: {
      legend: { position: 'top', labels: { color: '#94a3b8' } },
    },
  };

  return <Bar data={data} options={options} />;
};

export default MonthlyBarChart;
