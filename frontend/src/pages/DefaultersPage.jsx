import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout/Layout';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast';

const DefaultersPage = () => {
  const { user } = useContext(AuthContext);
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [threshold, setThreshold] = useState(75);
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

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
      setSubjectId(''); // Reset to aggregate whenever filter changes
  }, [department, allSubjects]);

  const getDefaulters = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({ threshold });
      if (subjectId) queryParams.append('subjectId', subjectId);
      if (department) queryParams.append('department', department);
      
      const { data } = await api.get(`/reports/defaulters?${queryParams.toString()}`);
      setDefaulters(data);
    } catch (error) {
      toast.error('Failed to load defaulters list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="gradient-text" style={{ margin: 0 }}>Defaulters List</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Identify students falling below minimum attendance criteria</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
          <label>Attendance Threshold (%)</label>
          <input type="number" className="form-control" value={threshold} onChange={e => setThreshold(e.target.value)} min="1" max="100" />
        </div>
        
        <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
          <label>Branch / Department</label>
          <select className="form-control" value={department} onChange={e => setDepartment(e.target.value)}>
            <option value="">All Branches</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        
        <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
          <label>Subject Filter</label>
          <select className="form-control" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
            <option value="">{user?.role === 'faculty' ? 'All Assigned Subjects (Aggregate)' : 'All Subjects (Aggregate)'}</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
          </select>
        </div>

        <button className="btn btn-primary" onClick={getDefaulters} style={{ height: '42px', padding: '0 2rem' }}>
          {loading ? 'Checking...' : 'Check Defaulters'}
        </button>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--panel-border)' }}>
              <th style={{ padding: '1rem' }}>Roll No.</th>
              <th style={{ padding: '1rem' }}>Name</th>
              {subjectId ? <th style={{ padding: '1rem' }}>Subject</th> : null}
              <th style={{ padding: '1rem', textAlign: 'center' }}>Total Classes</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Attendance %</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={subjectId ? "6" : "5"} style={{ padding: '2rem', textAlign: 'center' }}>Searching...</td></tr> : 
             defaulters.length === 0 ? <tr><td colSpan={subjectId ? "6" : "5"} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No defaulters found below {threshold}%</td></tr> :
             defaulters.map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{d.rollNumber}</td>
                <td style={{ padding: '1rem' }}>{d.studentName}</td>
                {subjectId ? <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{d.subjectName || '-'}</td> : null}
                <td style={{ padding: '1rem', textAlign: 'center' }}>{d.totalClasses}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                   <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)' }}>
                     {d.percentage}%
                   </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                   <button className="btn form-control" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto' }}>Notify</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default DefaultersPage;
