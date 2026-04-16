import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import ChangePasswordModal from '../ChangePasswordModal';
import './Layout.css';

const Navbar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <h2 className="gradient-text" style={{ fontSize: '1.2rem' }}>Attendance Management System</h2>
      </div>
      <div className="navbar-user">
        <div className="user-info">
          <FiUser className="user-icon" />
          <span className="user-name">{user?.name}</span>
          <span className="user-role badge">{user?.role}</span>
        </div>
        <button className="btn-logout" onClick={() => setShowPasswordModal(true)} style={{ marginRight: '0.5rem', background: 'rgba(255,255,255,0.05)' }}>
          <FiSettings /> Password
        </button>
        <button className="btn-logout" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </div>
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </nav>
  );
};

export default Navbar;
