import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Icon from '../../components/Icon';

const emptyForm = { name: '', username: '', email: '', nomorPekerja: '', password: '', role: 'Peserta', isActive: true };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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
        nomorPekerja: user.nomorPekerja,
        role: user.role,
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
      nomorPekerja: user.nomorPekerja || '',
      role: user.role,
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

  // Pagination logic
  const itemsPerPage = 5;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [users.length, currentPage, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = users.slice(startIndex, startIndex + itemsPerPage);

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ margin: 0 }}>Daftar Peserta</h4>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              background: 'rgba(0,146,221,0.1)',
              color: '#0092DD',
            }}>
              Total {users.length} data
            </span>
          </div>
        </div>
        <div className="card-body" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading data...</p>
          ) : users.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data peserta.</p>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Nomor Pekerja</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user.id}>
                        <td style={{ fontWeight: 600 }}>{user.name}</td>
                        <td>{user.nomorPekerja || '-'}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <button type="button" onClick={() => handleToggleStatus(user)} title="Klik untuk mengubah status" style={{ 
                            padding: '0.25rem 0.6rem', 
                            borderRadius: '999px', 
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: user.isActive ? 'rgba(133, 194, 38, 0.12)' : 'rgba(218, 37, 28, 0.1)',
                            color: user.isActive ? '#85C226' : '#DA251C',
                            transition: 'all 0.2s'
                          }}>
                            {user.isActive ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td>
                          <button className="btn btn-primary" style={{ padding: '0.25rem 0.8rem', fontSize: '0.82rem', borderRadius: '6px' }} onClick={() => handleEdit(user)}>
                            Edit
                          </button>
                          <button className="btn btn-danger" aria-label={`Hapus ${user.name}`} title="Hapus" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', marginLeft: '5px' }} onClick={() => handleDelete(user)}>
                            <Icon name="trash" size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1rem 1.5rem', 
                  borderTop: '1px solid #e9ecef',
                  background: '#fafafa',
                  borderBottomLeftRadius: '0.5rem',
                  borderBottomRightRadius: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 500 }}>
                    Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, users.length)} dari {users.length} data
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        border: '1.5px solid #e9ecef',
                        borderRadius: '8px',
                        background: '#fff',
                        color: '#6c757d',
                        transition: 'all 0.2s',
                        opacity: currentPage === 1 ? 0.5 : 1,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>
                      {currentPage} / {totalPages}
                    </div>
                    <button 
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        border: '1.5px solid #e9ecef',
                        borderRadius: '8px',
                        background: '#fff',
                        color: '#6c757d',
                        transition: 'all 0.2s',
                        opacity: currentPage === totalPages ? 0.5 : 1,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                      }}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </>
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
                  <label className="form-label">Nomor Pekerja</label>
                  <input type="text" className="form-control" value={formData.nomorPekerja} onChange={e => setFormData({...formData, nomorPekerja: e.target.value})} />
                </div>
                {editingUser && (
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-control" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      <option value="Peserta">Peserta</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                )}
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
