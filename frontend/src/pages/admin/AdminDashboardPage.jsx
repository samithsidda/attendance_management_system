import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Layout from '../../components/Layout/Layout';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ totalStudents: 0, totalFaculty: 0, totalSubjects: 0, systemWideAttendance: 0 });
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [resetType, setResetType] = useState('student');
  const [resetUserId, setResetUserId] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard-stats');
        setStats(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchUsers = async () => {
      try {
        const [studRes, facRes] = await Promise.all([
          api.get('/students'),
          api.get('/admin/faculties')
        ]);
        setStudents(studRes.data);
        setFaculties(facRes.data);
      } catch (e) { console.error('Failed to load users for reset hub', e); }
    };
    fetchStats();
    fetchUsers();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetUserId) return toast.error('Please select a user');
    if (!window.confirm(`Force password reset to '123456' ?`)) return;
    try {
      setResetLoading(true);
      const { data } = await api.post('/admin/reset-password', { userId: resetUserId, userType: resetType });
      toast.success(data.message);
      setResetUserId('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>System Overview</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>Administrator Control Panel</p>
        </div>
        <Link to="/admin/manage" className="btn btn-primary" style={{ textDecoration: 'none', width: 'auto' }}>Manage Admins</Link>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ padding: '2rem', flex: 1, minWidth: '200px', borderTop: '4px solid #818cf8' }}>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, margin: '0 0 0.5rem 0' }}>Total Students</p>
          <h3 style={{ fontSize: '3rem', margin: 0 }}>{stats.totalStudents}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', flex: 1, minWidth: '200px', borderTop: '4px solid #c084fc' }}>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, margin: '0 0 0.5rem 0' }}>Total Faculty</p>
          <h3 style={{ fontSize: '3rem', margin: 0 }}>{stats.totalFaculty}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '2rem', flex: 1, minWidth: '200px', borderTop: '4px solid #34d399' }}>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, margin: '0 0 0.5rem 0' }}>Active Subjects</p>
          <h3 style={{ fontSize: '3rem', margin: 0 }}>{stats.totalSubjects}</h3>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Core Operations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <Link to="/students" className="btn form-control" style={{ textDecoration: 'none', textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
            <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: '0.5rem' }}>👨‍🎓</span>
            Manage Students
          </Link>
          <Link to="/faculty" className="btn form-control" style={{ textDecoration: 'none', textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
            <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: '0.5rem' }}>👨‍🏫</span>
            Manage Faculty
          </Link>
          <Link to="/subjects" className="btn form-control" style={{ textDecoration: 'none', textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
            <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: '0.5rem' }}>📚</span>
            Manage Subjects
          </Link>
          <Link to="/reports" className="btn form-control" style={{ textDecoration: 'none', textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
            <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</span>
            Global Reports
          </Link>
          <Link to="/attendance/history" className="btn form-control" style={{ textDecoration: 'none', textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
            <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍</span>
            Audit Attendance
          </Link>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', borderTop: '4px solid #ef4444' }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Password Recovery Hub</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Force reset a user's password to <strong>123456</strong>.</p>

        <form onSubmit={handleResetPassword} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
            <label>Role</label>
            <select className="form-control" value={resetType} onChange={(e) => { setResetType(e.target.value); setResetUserId(''); }}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 2, minWidth: '250px', marginBottom: 0 }}>
            <label>Select User</label>
            <select className="form-control" value={resetUserId} onChange={(e) => setResetUserId(e.target.value)}>
              <option value="">-- Choose Account --</option>
              {resetType === 'student' && students.map(s => (
                <option key={s._id} value={s._id}>{s.rollNumber} - {s.name}</option>
              ))}
              {resetType === 'faculty' && faculties.map(f => (
                <option key={f._id} value={f._id}>{f.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn" disabled={resetLoading} style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)', padding: '0.8rem 1.5rem' }}>
            {resetLoading ? 'Resetting...' : 'Force Reset to 123456'}
          </button>
        </form>
      </div>

    </Layout>
  );
};

export default AdminDashboardPage;
