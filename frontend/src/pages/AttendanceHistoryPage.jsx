import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout/Layout';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast';

const AttendanceHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState('');
  
  const [filterDate, setFilterDate] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [filterDate, filterSubject]);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      let available = data;
      if (user.role === 'faculty') {
        available = data.filter(s => user.subjects?.includes(s._id));
      }
      setAllSubjects(available);
      
      const depts = [...new Set(available.map(s => s.department).filter(Boolean))];
      setDepartments(depts);
    } catch (error) {
      toast.error('Failed to load subjects');
    }
  };

  useEffect(() => {
    let filtered = allSubjects;
    if (department) {
      filtered = allSubjects.filter(s => s.department === department);
    }
    setSubjects(filtered);
    setFilterSubject('');
  }, [department, allSubjects]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      let url = user?.role === 'student' ? `/attendance/student/${user._id}` : '/attendance';
      
      let queryParams = [];
      if (filterDate) queryParams.push(`date=${filterDate}`);
      if (filterSubject) queryParams.push(`subject=${filterSubject}`);
      if (department) queryParams.push(`department=${department}`);
      
      if (queryParams.length > 0 && user?.role !== 'student') {
        url += '?' + queryParams.join('&');
      }

      const { data } = await api.get(url);
      setRecords(data);
    } catch (error) {
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="gradient-text" style={{ margin: 0 }}>Attendance Log History</h2>
          <p style={{ color: 'var(--text-secondary)' }}>View and search past attendance metrics</p>
        </div>
      </div>

      {user?.role !== 'student' && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
            <label>Filter by Date</label>
            <input type="date" className="form-control" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
            <label>Branch / Department</label>
            <select className="form-control" value={department} onChange={e => setDepartment(e.target.value)}>
              <option value="">All Branches</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label>Filter by Subject</label>
            <select className="form-control" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.2rem' }}>
            <button className="btn form-control" onClick={() => { setFilterDate(''); setFilterSubject(''); setDepartment(''); }}>Clear Filters</button>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--panel-border)' }}>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Subject</th>
              <th style={{ padding: '1rem' }}>Student</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr> : 
             records.length === 0 ? <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No records found for the given criteria.</td></tr> :
             records.map(record => (
              <tr key={record._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 500 }}>{new Date(record.date).toLocaleDateString()}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    [{record.timeSlot || 'Unknown'}]
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                   <span className="badge" style={{ background: 'var(--panel-bg)', marginRight: '0.5rem' }}>{record.subject?.code}</span>
                   {record.subject?.name}
                </td>
                <td style={{ padding: '1rem' }}>
                   {record.student ? (
                       <>
                           <div style={{ fontWeight: 500 }}>{record.student.name}</div>
                           <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{record.student.rollNumber}</div>
                       </>
                   ) : 'Unknown (Deleted)'}
                </td>
                <td style={{ padding: '1rem' }}>
                   <span style={{ 
                       display: 'inline-block',
                       padding: '0.25rem 0.5rem', 
                       borderRadius: 'var(--radius-sm)',
                       fontSize: '0.8rem',
                       fontWeight: 'bold',
                       background: record.status === 'present' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                       color: record.status === 'present' ? '#34d399' : 'var(--danger-color)',
                   }}>
                     {record.status?.toUpperCase()}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AttendanceHistoryPage;
