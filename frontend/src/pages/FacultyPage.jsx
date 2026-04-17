import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import toast from 'react-hot-toast';

const FacultyPage = () => {
  const { user } = useContext(AuthContext);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: ''
  });

  useEffect(() => {
    fetchFaculty();
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

  const fetchFaculty = async () => {
    try {
      let query = `?search=${search}`;
      if (department) query += `&department=${department}`;
      const { data } = await api.get(`/faculty${query}`);
      setFaculty(data);
    } catch (error) {
      toast.error('Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const openAddModal = () => {
    setEditMode(false);
    setFormData({ name: '', email: '', password: '', department: '' });
    setShowModal(true);
  };

  const openEditModal = (fac) => {
    setEditMode(true);
    setCurrentId(fac._id);
    setFormData({
      name: fac.name, email: fac.email, password: '', department: fac.department || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Don't send empty password if not updating
        await api.put(`/faculty/${currentId}`, payload);
        toast.success('Faculty member updated');
      } else {
        await api.post('/faculty', formData);
        toast.success('Faculty member created');
      }
      setShowModal(false);
      fetchFaculty();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await api.delete(`/faculty/${id}`);
        toast.success('Faculty member deleted');
        fetchFaculty();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="gradient-text" style={{ margin: 0 }}>Faculty Registry</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage the faculty database</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={openAddModal} style={{ width: 'auto' }}>+ Add Faculty</button>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search by name or email..." 
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
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--panel-border)' }}>
               <th style={{ padding: '1rem' }}>Name</th>
               <th style={{ padding: '1rem' }}>Email</th>
               <th style={{ padding: '1rem' }}>Department</th>
               {user?.role === 'admin' && <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr> : 
              faculty.length === 0 ? <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No faculty found</td></tr> :
              faculty.map(f => (
                <tr key={f._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{f.name}</td>
                  <td style={{ padding: '1rem' }}>{f.email}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{f.department || '-'}</td>
                  {user?.role === 'admin' && (
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button className="btn" onClick={() => openEditModal(f)} style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '0.4rem 0.8rem', marginRight: '0.5rem', fontSize: '0.85rem' }}>Edit</button>
                      <button className="btn" onClick={() => handleDelete(f._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Delete</button>
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
              <h3 style={{ marginTop: 0 }}>{editMode ? 'Edit Faculty' : 'Add New Faculty'}</h3>
              <form onSubmit={handleSubmit}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   <div className="form-group">
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
                     <label>Department</label>
                     <input type="text" className="form-control" name="department" value={formData.department} onChange={handleInputChange} />
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

export default FacultyPage;
