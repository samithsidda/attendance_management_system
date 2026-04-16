import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout/Layout';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast';

const MarkAttendancePage = () => {
  const { user } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('');
  
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'present' | 'absent' }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
       const subject = subjects.find(s => s._id === selectedSubject);
       if(subject) {
         fetchStudents(subject.department, subject.semester);
       }
    } else {
       setStudents([]);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      // If faculty, filter to only assigned subjects
      if (user.role === 'faculty') {
        const assigned = data.filter(s => user.subjects?.includes(s._id));
        setSubjects(assigned);
      } else {
        setSubjects(data);
      }
    } catch (error) {
      toast.error('Failed to load subjects');
    }
  };

  const fetchStudents = async (dept, sem) => {
    try {
      setLoading(true);
      let query = '';
      if(dept) query += `department=${dept}&`;
      if(sem) query += `semester=${sem}`;
      const { data } = await api.get(`/students?${query}`);
      setStudents(data);
      
      // Initialize attendance state (default to present)
      const initialData = {};
      data.forEach(student => {
        initialData[student._id] = 'present';
      });
      setAttendanceData(initialData);

    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject) return toast.error('Please select a subject');
    if (!date) return toast.error('Please select a date');
    if (!timeSlot) return toast.error('Please select a time slot');
    if (students.length === 0) return toast.error('No students to mark');

    if (!window.confirm(`Mark attendance for ${students.length} students?`)) return;

    try {
      setLoading(true);
      const records = students.map(student => ({
        student: student._id,
        subject: selectedSubject,
        date: date,
        timeSlot: timeSlot,
        status: attendanceData[student._id]
      }));

      await api.post('/attendance', records);
      toast.success('Attendance marked successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'student') return <Layout><h2 className="gradient-text">Unauthorized</h2></Layout>;

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="gradient-text" style={{ margin: 0 }}>Mark Attendance</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Record digital attendance for your classes</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '250px', marginBottom: 0 }}>
          <label>Subject</label>
          <select className="form-control" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
            <option value="">-- Select Subject --</option>
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.code} - {s.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: '250px', marginBottom: 0 }}>
          <label>Date</label>
          <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: '250px', marginBottom: 0 }}>
          <label>Time Slot</label>
          <select className="form-control" value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
            <option value="">-- Select Time Slot --</option>
            <option value="09:00 - 10:00">09:00 - 10:00</option>
            <option value="10:00 - 11:00">10:00 - 11:00</option>
            <option value="11:00 - 12:00">11:00 - 12:00</option>
            <option value="13:00 - 14:00">13:00 - 14:00</option>
            <option value="14:00 - 15:00">14:00 - 15:00</option>
            <option value="15:00 - 16:00">15:00 - 16:00</option>
          </select>
        </div>
      </div>

      {loading ? <p>Loading data...</p> : students.length > 0 ? (
        <form onSubmit={handleSubmit}>
          <div className="glass-panel" style={{ overflowX: 'auto', marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--panel-border)' }}>
                  <th style={{ padding: '1rem' }}>Roll No.</th>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{student.rollNumber}</td>
                    <td style={{ padding: '1rem' }}>{student.name}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                       <button 
                         type="button" 
                         className="btn"
                         onClick={() => toggleStatus(student._id)}
                         style={{ 
                            background: attendanceData[student._id] === 'present' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: attendanceData[student._id] === 'present' ? '#34d399' : 'var(--danger-color)',
                            minWidth: '100px'
                         }}
                       >
                         {attendanceData[student._id] === 'present' ? 'PRESENT' : 'ABSENT'}
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
             <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '1rem 3rem', fontSize: '1.1rem' }}>
               Submit Attendance
             </button>
          </div>
        </form>
      ) : selectedSubject ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No students found matching this subject's department/semester mapping.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Please select a subject to fetch the student roster.</p>
        </div>
      )}
    </Layout>
  );
};

export default MarkAttendancePage;
