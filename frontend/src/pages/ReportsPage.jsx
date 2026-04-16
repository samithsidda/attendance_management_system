import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout/Layout';
import AuthContext from '../context/AuthContext';
import AttendancePieChart from '../components/Charts/AttendancePieChart';
import MonthlyBarChart from '../components/Charts/MonthlyBarChart';
import SubjectBarChart from '../components/Charts/SubjectBarChart';
import toast from 'react-hot-toast';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const ReportsPage = () => {
  const { user } = useContext(AuthContext);
  const [reportType, setReportType] = useState('daily');
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState('');
  const [students, setStudents] = useState([]);
  
  // Params
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  const [reportData, setReportData] = useState(null);
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
      } else if (user.role === 'student') {
        const { data: profile } = await api.get('/auth/profile');
        available = data.filter(s => s.department === profile.department && s.semester == profile.semester);
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
    setSubjectId('');
  }, [department, allSubjects]);

  useEffect(() => {
    if (reportType === 'individual' && user?.role !== 'student') {
        fetchStudents();
    }
  }, [reportType, department]);

  const fetchStudents = async () => {
    try {
        const queryParams = new URLSearchParams();
        if (department) queryParams.append('department', department);
        const { data } = await api.get(`/students?${queryParams.toString()}`);
        setStudents(data);
        if (data.length > 0) setStudentId(data[0]._id);
        else setStudentId('');
    } catch (error) {
        toast.error('Failed to load students');
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      let res;
      
      if (reportType === 'daily') {
         if(!date) return toast.error('Date required');
         res = await api.get(`/reports/daily?date=${date}&subjectId=${subjectId}&department=${department}`);
      } else if (reportType === 'monthly') {
         res = await api.get(`/reports/monthly?month=${month}&year=${year}&subjectId=${subjectId}&department=${department}`);
      } else if (reportType === 'percentage') {
         res = await api.get(`/reports/percentage?subjectId=${subjectId}&department=${department}`);
      } else if (reportType === 'individual') {
         const targetStudentId = user.role === 'student' ? user._id : studentId;
         res = await api.get(`/reports/student/${targetStudentId}?subjectId=${subjectId}`);
      }
      
      setReportData(res.data);
    } catch (error) {
      toast.error('Failed to generate report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="gradient-text" style={{ margin: 0 }}>Analytics & Reports</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Generate detailed attendance insights</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
          <label>Report Type</label>
          <select className="form-control" value={reportType} onChange={e => {
            setReportType(e.target.value);
            setReportData(null);
          }}>
            <option value="daily">Daily Summary</option>
            <option value="monthly">Monthly Breakdown</option>
            {user?.role !== 'student' && <option value="percentage">Student Percentages</option>}
            {user?.role === 'student' && <option value="individual">Individual Student Report</option>}
          </select>
        </div>
        
        {user?.role !== 'student' && (
          <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
            <label>Branch / Department</label>
            <select className="form-control" value={department} onChange={e => {
              setDepartment(e.target.value);
              setReportData(null);
            }}>
              <option value="">All Branches</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}
        
        <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
          <label>Subject (Optional)</label>
          <select className="form-control" value={subjectId} onChange={e => {
            setSubjectId(e.target.value);
            setReportData(null);
          }}>
            <option value="">{user?.role === 'faculty' ? 'All Assigned Subjects' : 'All Subjects'}</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
          </select>
        </div>

        {reportType === 'daily' && (
          <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
            <label>Date</label>
            <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        )}

        {reportType === 'monthly' && (
          <>
            <div className="form-group" style={{ flex: 1, minWidth: '100px', marginBottom: 0 }}>
              <label>Month</label>
              <select className="form-control" value={month} onChange={e => setMonth(e.target.value)}>
                {monthNames.map((name, index) => (
                  <option key={index + 1} value={index + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '100px', marginBottom: 0 }}>
              <label>Year</label>
              <input type="number" className="form-control" value={year} onChange={e => setYear(e.target.value)} />
            </div>
          </>
        )}

        {reportType === 'individual' && user?.role !== 'student' && (
          <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label>Student</label>
            <select className="form-control" value={studentId} onChange={e => setStudentId(e.target.value)}>
              {students.map(s => <option key={s._id} value={s._id}>{s.rollNumber} - {s.name}</option>)}
            </select>
          </div>
        )}

        <button className="btn btn-primary" onClick={generateReport} style={{ height: '42px', padding: '0 2rem' }}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {reportData && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          
          {reportType === 'daily' && (
             <div>
                <h3 style={{ marginTop: 0, textAlign: 'center' }}>Daily Summary: {date}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
                  <div style={{ textAlign: 'center' }}>
                     <h1 style={{ color: '#34d399', fontSize: '4rem', margin: 0 }}>{reportData.totalPresent}</h1>
                     <p>Present</p>
                  </div>
                  <AttendancePieChart present={reportData.totalPresent} absent={reportData.totalAbsent} />
                  <div style={{ textAlign: 'center' }}>
                     <h1 style={{ color: 'var(--danger-color)', fontSize: '4rem', margin: 0 }}>{reportData.totalAbsent}</h1>
                     <p>Absent</p>
                  </div>
                </div>
             </div>
          )}

          {reportType === 'monthly' && (
             <div>
                <h3 style={{ marginTop: 0 }}>Monthly Trend ({monthNames[parseInt(month) - 1]} {year})</h3>
                <div style={{ height: '400px', marginTop: '2rem' }}>
                   <MonthlyBarChart monthlyData={reportData} />
                </div>
             </div>
          )}

          {reportType === 'percentage' && (
             <div>
                <h3 style={{ marginTop: 0 }}>Student Aggregate Percentages</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '1rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--panel-border)' }}>
                      <th style={{ padding: '1rem' }}>Roll No.</th>
                      <th style={{ padding: '1rem' }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.length === 0 ? <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }}>No data</td></tr> : 
                     reportData.map((d, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem' }}>{d.rollNumber}</td>
                        <td style={{ padding: '1rem' }}>{d.studentName}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                           <span className="badge" style={{ 
                               background: d.percentage >= 75 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                               color: d.percentage >= 75 ? '#34d399' : 'var(--danger-color)'
                           }}>
                             {d.percentage}%
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}

          {reportType === 'individual' && (
             <div>
                <h3 style={{ marginTop: 0 }}>Individual Student Performance</h3>
                <div style={{ height: '400px', marginTop: '2rem' }}>
                   {reportData.length === 0 ? (
                      <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No data available for this student.</p>
                   ) : (
                      <SubjectBarChart studentData={reportData} />
                   )}
                </div>
             </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default ReportsPage;
