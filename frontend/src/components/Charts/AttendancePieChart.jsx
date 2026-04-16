import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const AttendancePieChart = ({ present, absent }) => {
  const data = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [present || 0, absent || 0],
        backgroundColor: ['rgba(52, 211, 153, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgba(52, 211, 153, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8' } },
    },
  };

  return <div style={{ maxWidth: '300px', margin: '0 auto' }}><Pie data={data} options={options} /></div>;
};

export default AttendancePieChart;
