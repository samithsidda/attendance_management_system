import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SubjectBarChart = ({ studentData }) => {
  // studentData: [{ subjectName: 'Math', totalClasses: 20, presentClasses: 18, ... }, ...]
  
  const data = {
    labels: studentData?.map(d => d.subjectName || d.subjectCode) || [],
    datasets: [
      {
        label: 'Classes Attended',
        data: studentData?.map(d => d.presentClasses) || [],
        backgroundColor: 'rgba(52, 211, 153, 0.8)',
      },
      {
        label: 'Total Classes',
        data: studentData?.map(d => d.totalClasses) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
    },
    plugins: {
      legend: { position: 'top', labels: { color: '#94a3b8' } },
    },
  };

  return <Bar data={data} options={options} />;
};

export default SubjectBarChart;
