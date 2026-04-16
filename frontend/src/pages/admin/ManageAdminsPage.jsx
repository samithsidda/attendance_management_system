import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Layout from '../../components/Layout/Layout';
import toast from 'react-hot-toast';

const ManageAdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data } = await api.get('/admin/list');
      setAdmins(data);
    } catch (error) {
      toast.error('Failed to fetch admins');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/admin/add', formData);
      toast.success('Admin added successfully');
      setFormData({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this admin?')) {
      try {
        await api.delete(`/admin/${id}`);
        toast.success('Admin removed');
        fetchAdmins();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to remove admin');
      }
    }
  };

  return (
    <Layout>
      <h2 className="gradient-text" style={{ marginBottom: '2rem' }}>Manage System Administrators</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>Add New Admin</h3>
          <form onSubmit={handleAddAdmin} style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Temporary Password</label>
              <input type="password" className="form-control" name="password" value={formData.password} onChange={handleInputChange} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Create Admin'}
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>Admin Roster</h3>
          <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--panel-border)' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Created At</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{admin.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{admin.email}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(admin.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        onClick={() => handleDelete(admin._id)}
                        className="btn" 
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageAdminsPage;
