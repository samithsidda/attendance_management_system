import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    rollNumber: '',
    year: '',
    semester: ''
  });
  const [loading, setLoading] = useState(false);
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const payload = { ...formData, role };
      // Remove student specific fields if faculty
      if (role === 'faculty') {
        delete payload.rollNumber;
        delete payload.year;
        delete payload.semester;
      }

      const { data } = await api.post('/auth/register', payload);
      
      localStorage.setItem('user', JSON.stringify(data));
      dispatch({ type: 'LOGIN', payload: data });
      
      toast.success('Registration successful!');
      
      if (data.role === 'faculty') navigate('/dashboard');
      else navigate('/attendance/history');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel" style={{ maxWidth: '600px' }}>
        <h2 className="gradient-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>Register for Attendance Management System</h2>
        
        <div className="role-selector" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button 
            type="button"
            className={role === 'student' ? 'btn btn-primary' : 'btn form-control'}
            onClick={() => setRole('student')}
            style={{ flex: 1 }}
          >
            Student
          </button>
          <button 
            type="button"
            className={role === 'faculty' ? 'btn btn-primary' : 'btn form-control'}
            onClick={() => setRole('faculty')}
            style={{ flex: 1 }}
          >
            Faculty
          </button>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" name="password" value={formData.password} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input type="text" className="form-control" name="department" value={formData.department} onChange={handleInputChange} />
          </div>
          
          {role === 'student' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Roll Number</label>
                <input type="text" className="form-control" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Semester</label>
                <input type="number" className="form-control" name="semester" value={formData.semester} onChange={handleInputChange} required />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Year</label>
                <input type="number" className="form-control" name="year" value={formData.year} onChange={handleInputChange} />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
