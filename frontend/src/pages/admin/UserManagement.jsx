import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Icon from '../../components/Icon';

const emptyForm = { name: '', username: '', email: '', password: '', isActive: true };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setShowModal(false);
      setFormData(emptyForm);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data || 'Gagal menambahkan user');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/users/${user.id}`, {
        name: user.name,
        username: user.username,
        email: user.email,
        isActive: !user.isActive
      });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data || 'Gagal mengubah status user');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus user ${user.name}?`)) return;

    try {
      await api.delete(`/users/${user.id}`);
      setUsers(currentUsers => currentUsers.filter(currentUser => currentUser.id !== user.id));
    } catch (error) {
      alert(error.response?.data || 'Gagal menghapus user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      password: '',
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editingUser}`, formData);
      setShowModal(false);
      setEditingUser(null);
      setFormData(emptyForm);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data || 'Gagal mengubah data user');
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Manajemen User</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Icon name="plus" size={16} /> Tambah Peserta
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h4 style={{ margin: 0 }}>Daftar Peserta</h4>
        </div>
        <div className="card-body">
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <button type="button" onClick={() => handleToggleStatus(user)} title="Klik untuk mengubah status" style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.85rem',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: user.isActive ? 'rgba(133, 194, 38, 0.2)' : 'rgba(218, 37, 28, 0.2)',
                          color: user.isActive ? '#85C226' : '#DA251C'
                        }}>
                          {user.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td>
                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => handleEdit(user)}>
                          Edit
                        </button>
                        <button className="btn btn-danger" aria-label={`Hapus ${user.name}`} title="Hapus" style={{ padding: '0.35rem', marginLeft: '5px' }} onClick={() => handleDelete(user)}>
                          <Icon name="trash" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', margin: 0 }}>
            <div className="card-header">
              <h4 style={{ margin: 0 }}>{editingUser ? 'Edit User' : 'Tambah Peserta'}</h4>
            </div>
            <div className="card-body">
              <form onSubmit={editingUser ? handleUpdate : handleCreate}>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-control" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password{editingUser ? ' (kosongkan jika tidak diubah)' : ''}</label>
                  <input type="password" className="form-control" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingUser} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                  <button type="button" className="btn" style={{ backgroundColor: '#e9ecef', color: '#495057' }} onClick={() => { setShowModal(false); setEditingUser(null); }}>Batal</button>
                  <button type="submit" className="btn btn-primary">{editingUser ? 'Simpan Perubahan' : 'Simpan'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
