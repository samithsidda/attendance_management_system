import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { 
  FiHome, FiUsers, FiBook, FiCheckCircle, 
  FiClock, FiPieChart, FiAlertTriangle, FiSettings
} from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard', path: user?.role === 'admin' ? '/admin/dashboard' : '/dashboard', icon: <FiHome />, roles: ['admin', 'faculty', 'student'] },
    { name: 'Students', path: '/students', icon: <FiUsers />, roles: ['admin', 'faculty'] },
    { name: 'Subjects', path: '/subjects', icon: <FiBook />, roles: ['admin', 'faculty'] },
    { name: 'Mark Attendance', path: '/attendance/mark', icon: <FiCheckCircle />, roles: ['admin', 'faculty'] },
    { name: 'History', path: '/attendance/history', icon: <FiClock />, roles: ['admin', 'faculty', 'student'] },
    { name: 'Reports', path: '/reports', icon: <FiPieChart />, roles: ['admin', 'faculty', 'student'] },
    { name: 'Defaulters', path: '/defaulters', icon: <FiAlertTriangle />, roles: ['admin', 'faculty'] },
    { name: 'Manage Admins', path: '/admin/manage', icon: <FiSettings />, roles: ['admin'] },
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-brand-mobile">
        <h2 className="gradient-text" style={{ fontSize: '1.2rem' }}>Attendance Management System</h2>
      </div>
      <ul className="nav-menu">
        {allowedItems.map((item, index) => (
          <li key={index} className="nav-item">
            <NavLink 
              to={item.path} 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
