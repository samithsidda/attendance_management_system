import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import toast from 'react-hot-toast';

const StudentsPage = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', rollNumber: '', year: '', semester: ''
  });

  useEffect(() => {
    fetchStudents();
  }, [search, department]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data } = await api.get('/subjects');
        const depts = [...new Set(data.map(s => s.department).filter(Boolean))];
        setDepartments(depts);
      } catch (error) {
        console.error('Failed to load departments');
      }
    };
    fetchDepartments();
  }, []);

  const fetchStudents = async () => {
    try {
      let query = `?search=${search}`;
      if (department) query += `&department=${department}`;
      const { data } = await api.get(`/students${query}`);
      setStudents(data);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const openAddModal = () => {
    setEditMode(false);
    setFormData({ name: '', email: '', password: '', department: '', rollNumber: '', year: '', semester: '' });
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditMode(true);
    setCurrentId(student._id);
    setFormData({
      name: student.name, email: student.email, password: '', department: student.department || '', 
      rollNumber: student.rollNumber, year: student.year || '', semester: student.semester || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Don't send empty password if not updating
        await api.put(`/students/${currentId}`, payload);
        toast.success('Student updated');
      } else {
        await api.post('/students', formData);
        toast.success('Student created');
      }
      setShowModal(false);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/students/${id}`);
        toast.success('Student deleted');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="gradient-text" style={{ margin: 0 }}>Student Registry</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage the student database</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={openAddModal} style={{ width: 'auto' }}>+ Add Student</button>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search by name or roll number..." 
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 2, minWidth: '200px' }}
        />
        <select 
          className="form-control" 
          value={department} 
          onChange={(e) => setDepartment(e.target.value)}
          style={{ flex: 1, minWidth: '150px' }}
        >
          <option value="">All Branches</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--panel-border)' }}>
               <th style={{ padding: '1rem' }}>Roll No.</th>
               <th style={{ padding: '1rem' }}>Name</th>
               <th style={{ padding: '1rem' }}>Department</th>
               <th style={{ padding: '1rem' }}>Sem / Year</th>
               {user?.role === 'admin' && <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr> : 
              students.length === 0 ? <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No students found</td></tr> :
              students.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{s.rollNumber}</td>
                  <td style={{ padding: '1rem' }}>
                     <div>{s.name}</div>
                     <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.email}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{s.department || '-'}</td>
                  <td style={{ padding: '1rem' }}>{s.semester} / {s.year || '-'}</td>
                  {user?.role === 'admin' && (
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button className="btn" onClick={() => openEditModal(s)} style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '0.4rem 0.8rem', marginRight: '0.5rem', fontSize: '0.85rem' }}>Edit</button>
                      <button className="btn" onClick={() => handleDelete(s._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Delete</button>
                    </td>
                  )}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
           <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
              <h3 style={{ marginTop: 0 }}>{editMode ? 'Edit Student' : 'Add New Student'}</h3>
              <form onSubmit={handleSubmit}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div className="form-group" style={{ gridColumn: 'span 2' }}>
                     <label>Full Name</label>
                     <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
                   </div>
                   <div className="form-group">
                     <label>Email</label>
                     <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required />
                   </div>
                   <div className="form-group">
                     <label>Password {editMode && '(leave blank to keep)'}</label>
                     <input type="password" className="form-control" name="password" value={formData.password} onChange={handleInputChange} required={!editMode} />
                   </div>
                   <div className="form-group">
                     <label>Roll Number</label>
                     <input type="text" className="form-control" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} required />
                   </div>
                   <div className="form-group">
                     <label>Department</label>
                     <input type="text" className="form-control" name="department" value={formData.department} onChange={handleInputChange} />
                   </div>
                   <div className="form-group">
                     <label>Semester</label>
                     <input type="number" className="form-control" name="semester" value={formData.semester} onChange={handleInputChange} required />
                   </div>
                   <div className="form-group">
                     <label>Year</label>
                     <input type="number" className="form-control" name="year" value={formData.year} onChange={handleInputChange} />
                   </div>
                 </div>
                 <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editMode ? 'Save Changes' : 'Create'}</button>
                    <button type="button" className="btn form-control" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </Layout>
  );
};

export default StudentsPage;
