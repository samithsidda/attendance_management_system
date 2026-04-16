import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import toast from 'react-hot-toast';

const SubjectsPage = () => {
  const { user } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]); // Needed for admin assigning faculty
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', code: '', department: '', semester: ''
  });

  const [assignModal, setAssignModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('');

  useEffect(() => {
    fetchSubjects();
    if (user?.role === 'admin') {
      fetchFaculties();
    }
  }, [user]);

  const fetchFaculties = async () => {
    try {
      const { data } = await api.get('/admin/faculties');
      setFaculties(data);
    } catch (error) {
      console.error('Failed to load faculties');
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      if (user?.role === 'faculty') {
        setSubjects(data.filter(s => user.subjects?.includes(s._id)));
      } else {
        setSubjects(data);
      }
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const openAddModal = () => {
    setEditMode(false);
    setFormData({ name: '', code: '', department: '', semester: '' });
    setShowModal(true);
  };

  const openEditModal = (subject) => {
    setEditMode(true);
    setCurrentId(subject._id);
    setFormData({
      name: subject.name, code: subject.code, department: subject.department || '', semester: subject.semester || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/subjects/${currentId}`, formData);
        toast.success('Subject updated');
      } else {
        await api.post('/subjects', formData);
        toast.success('Subject created');
      }
      setShowModal(false);
      fetchSubjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await api.delete(`/subjects/${id}`);
        toast.success('Subject deleted');
        fetchSubjects();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleAssignFaculty = async (e) => {
    e.preventDefault();
    if (!selectedFaculty) return toast.error('Please enter a faculty ID');
    try {
      await api.post(`/subjects/${selectedSubject._id}/assign-faculty`, { facultyId: selectedFaculty });
      toast.success('Faculty assigned successfully');
      setAssignModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Assignment failed');
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="gradient-text" style={{ margin: 0 }}>Courses & Subjects</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage the academic curriculum</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={openAddModal} style={{ width: 'auto' }}>+ Add Subject</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {loading ? <p>Loading subjects...</p> : 
         subjects.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No subjects configured.</p> :
         subjects.map(s => (
            <div key={s._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{s.name}</h3>
                    <span className="badge" style={{ background: 'var(--panel-bg)' }}>{s.code}</span>
                  </div>
                  <div style={{ fontSize: '1.5rem' }}>📚</div>
               </div>
               
               <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}><strong>Dept:</strong> {s.department || 'N/A'}</p>
                  <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}><strong>Semester:</strong> {s.semester || 'N/A'}</p>
                  {user?.role === 'admin' && (
                     <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>
                       <strong>Assigned Faculty:</strong> {
                         faculties.filter(f => f.subjects?.includes(s._id)).map(f => f.name).join(', ') || 'None'
                       }
                     </p>
                  )}
               </div>

               {user?.role === 'admin' && (
                 <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button className="btn" onClick={() => openEditModal(s)} style={{ background: 'rgba(255,255,255,0.05)', flex: 1, padding: '0.5rem' }}>Edit</button>
                    <button className="btn" onClick={() => handleDelete(s._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', flex: 1, padding: '0.5rem' }}>Delete</button>
                    <button className="btn btn-primary" onClick={() => { setSelectedSubject(s); setAssignModal(true); }} style={{ flex: 1, padding: '0.5rem' }}>Assign</button>
                 </div>
               )}
            </div>
         ))
        }
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
           <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
              <h3 style={{ marginTop: 0 }}>{editMode ? 'Edit Subject' : 'Add New Subject'}</h3>
              <form onSubmit={handleSubmit}>
                 <div className="form-group">
                   <label>Subject Name</label>
                   <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
                 </div>
                 <div className="form-group">
                   <label>Subject Code</label>
                   <input type="text" className="form-control" name="code" value={formData.code} onChange={handleInputChange} required />
                 </div>
                 <div className="form-group">
                   <label>Department</label>
                   <input type="text" className="form-control" name="department" value={formData.department} onChange={handleInputChange} />
                 </div>
                 <div className="form-group">
                   <label>Semester</label>
                   <input type="number" className="form-control" name="semester" value={formData.semester} onChange={handleInputChange} />
                 </div>
                 <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editMode ? 'Save' : 'Create'}</button>
                    <button type="button" className="btn form-control" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {assignModal && selectedSubject && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
           <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
              <h3 style={{ marginTop: 0 }}>Assign Faculty to {selectedSubject.code}</h3>
              <form onSubmit={handleAssignFaculty}>
                 <div className="form-group">
                   <label>Select Faculty</label>
                   <select className="form-control" value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)} required>
                     <option value="">-- Choose Faculty --</option>
                     {faculties.map(f => (
                       <option key={f._id} value={f._id}>{f.name} ({f.department || 'No Dept'})</option>
                     ))}
                   </select>
                 </div>
                 <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Assign</button>
                    <button type="button" className="btn form-control" style={{ flex: 1 }} onClick={() => setAssignModal(false)}>Close</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </Layout>
  );
};

export default SubjectsPage;
