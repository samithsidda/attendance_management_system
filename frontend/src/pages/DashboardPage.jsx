import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import AttendancePieChart from '../components/Charts/AttendancePieChart';
import ChangePasswordModal from '../components/ChangePasswordModal';

const StatsCard = ({ title, value, icon, gradient }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, minWidth: '200px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontWeight: 500 }}>{title}</p>
        <h3 style={{ margin: 0, fontSize: '2rem' }}>{value}</h3>
      </div>
      <div style={{ 
        padding: '1rem', 
        background: gradient, 
        borderRadius: 'var(--radius-md)', 
        fontSize: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
      }}>
        {icon}
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ todayAttendance: 0, mySubjects: 0, defaulters: 0 });
  const [studentStats, setStudentStats] = useState({ totalTaken: 0, totalAttended: 0, percentage: 0 });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'faculty') {
          // Simple mock computation for UI since full logic relies on reports pipeline
          setStats(prev => ({ ...prev, mySubjects: user.subjects?.length || 0 }));
        } else if (user?.role === 'student') {
          const { data } = await api.get(`/reports/student/${user._id}`);
          let totalClasses = 0;
          let presentClasses = 0;
          data.forEach(report => {
            totalClasses += report.totalClasses;
            presentClasses += report.presentClasses;
          });
          const percentage = totalClasses === 0 ? 0 : Math.round((presentClasses / totalClasses) * 100);
          setStudentStats({ totalTaken: totalClasses, totalAttended: presentClasses, percentage });
        }
      } catch (e) { console.error(e); }
    };
    if (user?.role === 'faculty' || user?.role === 'student') {
        fetchStats();
    }
  }, [user]);

  if (user?.role === 'admin') {
      return (
          <Layout>
              <h2 className="gradient-text">Welcome Admin</h2>
              <p>Please navigate to the Admin Dashboard for your full overview.</p>
              <Link to="/admin/dashboard" className="btn btn-primary" style={{ width: 'auto', textDecoration: 'none', display: 'inline-block' }}>Go to Admin Dashboard</Link>
          </Layout>
      )
  }

  return (
    <Layout>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome back, {user?.name}!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {user?.role === 'student' ? "Here's an overview of your attendance." : "Here's what's happening with your classes today."}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        {user?.role === 'student' ? (
          <>
            <StatsCard title="Total Classes Taken" value={studentStats.totalTaken} gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" icon="📚" />
            <StatsCard title="Classes Attended" value={studentStats.totalAttended} gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" icon="✅" />
            <StatsCard title="Overall Attendance" value={`${studentStats.percentage}%`} gradient="linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" icon="📈" />
          </>
        ) : (
          <>
            <StatsCard title="My Subjects" value={stats.mySubjects} gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" icon="📚" />
            <StatsCard title="Today's Attendance" value={`${stats.todayAttendance}%`} gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" icon="📈" />
            <StatsCard title="Defaulters Alert" value={stats.defaulters} gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" icon="⚠️" />
          </>
        )}
      </div>

      {user?.role === 'student' && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Overall Attendance Performance</h3>
          {studentStats.totalTaken === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No attendance records found yet.</p>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '400px' }}>
              <AttendancePieChart present={studentStats.totalAttended} absent={studentStats.totalTaken - studentStats.totalAttended} />
            </div>
          )}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {user?.role !== 'student' && (
            <Link to="/attendance/mark" className="btn btn-primary" style={{ textDecoration: 'none', width: 'auto', flex: 1, textAlign: 'center' }}>Mark Attendance</Link>
          )}
          <Link to={user?.role === 'student' ? "/attendance/history" : "/reports"} className={user?.role === 'student' ? "btn btn-primary" : "btn form-control"} style={{ textDecoration: 'none', width: 'auto', flex: 1, textAlign: 'center', background: user?.role === 'student' ? undefined : 'rgba(255,255,255,0.05)' }}>
            {user?.role === 'student' ? "View History" : "View Reports"}
          </Link>
          <button onClick={() => setShowPasswordModal(true)} className="btn form-control" style={{ textDecoration: 'none', width: 'auto', flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', display: 'block' }}>Change Password</button>
        </div>
      </div>
      
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </Layout>
  );
};

export default DashboardPage;
