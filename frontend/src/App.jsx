import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Context & Guards
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageAdminsPage from './pages/admin/ManageAdminsPage';

// Shared / Faculty Pages
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import FacultyPage from './pages/FacultyPage';
import SubjectsPage from './pages/SubjectsPage';

// Attendance Flow
import MarkAttendancePage from './pages/MarkAttendancePage';
import AttendanceHistoryPage from './pages/AttendanceHistoryPage';

// Reports
import ReportsPage from './pages/ReportsPage';
import DefaultersPage from './pages/DefaultersPage';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/manage" element={<ProtectedRoute allowedRoles={['admin']}><ManageAdminsPage /></ProtectedRoute>} />
        
        {/* Protected Shared (Admin & Faculty) Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'faculty', 'student']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute allowedRoles={['admin', 'faculty']}><StudentsPage /></ProtectedRoute>} />
        <Route path="/faculty" element={<ProtectedRoute allowedRoles={['admin']}><FacultyPage /></ProtectedRoute>} />
        <Route path="/subjects" element={<ProtectedRoute allowedRoles={['admin', 'faculty']}><SubjectsPage /></ProtectedRoute>} />
        <Route path="/attendance/mark" element={<ProtectedRoute allowedRoles={['admin', 'faculty']}><MarkAttendancePage /></ProtectedRoute>} />
        <Route path="/defaulters" element={<ProtectedRoute allowedRoles={['admin', 'faculty']}><DefaultersPage /></ProtectedRoute>} />
        
        {/* Available to All Logged In Users */}
        <Route path="/attendance/history" element={<ProtectedRoute allowedRoles={['admin', 'faculty', 'student']}><AttendanceHistoryPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin', 'faculty', 'student']}><ReportsPage /></ProtectedRoute>} />
        
        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
