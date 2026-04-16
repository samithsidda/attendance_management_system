import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('user', JSON.stringify(data));
      dispatch({ type: 'LOGIN', payload: data });
      
      toast.success('Logged in successfully!');
      
      // Redirect based on role
      if (data.role === 'admin') navigate('/admin/dashboard');
      else navigate('/dashboard');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/auth/reset-password', { email, newPassword });
      toast.success('Password reset successfully. You can now login.');
      setShowForgot(false);
      setPassword('');
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (showForgot) {
    return (
      <div className="auth-container">
        <div className="auth-card glass-panel">
          <h2 className="gradient-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>Reset Password</h2>
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                placeholder="Enter new password"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setShowForgot(false)}>
              Back to Login
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h2 className="gradient-text" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.8rem' }}>Attendance Management System</h2>
        <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Login</h3>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }} onClick={() => setShowForgot(true)}>
            Forgot Password?
          </span>
        </p>
        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
