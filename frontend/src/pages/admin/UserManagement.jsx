import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import Icon from '../../components/Icon';

const emptyForm = {
  name: '',
  username: '',
  email: '',
  nomorPekerja: '',
  password: '',
  role: 'Peserta',
  isActive: true,
};

const formatLastUpdated = (isoString) => {
  if (!isoString) return 'Hari ini, 08:35 WIB';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Hari ini, 08:35 WIB';

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Hari ini, ${timeStr} WIB`;
    }
    const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    return `${dateStr}, ${timeStr} WIB`;
  } catch {
    return 'Hari ini, 08:35 WIB';
  }
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(() => {
    const saved = localStorage.getItem('imkp_users_last_updated_time');
    return formatLastUpdated(saved);
  });

  const recordUserUpdate = () => {
    const now = new Date();
    const iso = now.toISOString();
    localStorage.setItem('imkp_users_last_updated_time', iso);
    setLastUpdated(formatLastUpdated(iso));
  };

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
      recordUserUpdate();
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
        isActive: !user.isActive,
      });
      recordUserUpdate();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data || 'Gagal mengubah status user');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus user ${user.name}?`)) return;

    try {
      await api.delete(`/users/${user.id}`);
      setUsers((currentUsers) => currentUsers.filter((u) => u.id !== user.id));
      recordUserUpdate();
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
      isActive: user.isActive,
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
      recordUserUpdate();
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

  const handleExportData = () => {
    const csvRows = [
      ['ID', 'Nama', 'Nomor Pekerja', 'Username', 'Email', 'Role', 'Status'],
      ...users.map((u) => [
        u.id,
        `"${u.name}"`,
        u.nomorPekerja || '-',
        u.username,
        u.email,
        u.role,
        u.isActive ? 'Aktif' : 'Nonaktif',
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `peserta_imkp_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.nomorPekerja && user.nomorPekerja.includes(searchQuery));
      const matchRole = roleFilter === 'ALL' ? true : user.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  };

  // Avatar background colors based on name
  const avatarColors = [
    { bg: '#EFF6FF', text: '#0066CB', border: '#BFDBFE' },
    { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
    { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  ];

  const getAvatarStyle = (index) => avatarColors[index % avatarColors.length];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div className="page-header-wrapper">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Manajemen User</h1>
            <span className="badge badge-blue" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}>
              Total {users.length} Peserta
            </span>
          </div>
          <p className="page-subtitle">Kelola otorisasi akun peserta dan administrator sistem uji IMKP.</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-outline" onClick={handleExportData}>
            <Icon name="download" size={16} />
            Ekspor Data
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Icon name="plus" size={16} />
            Tambah Peserta
          </button>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="filter-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <span style={{
            position: 'absolute',
            left: '0.9rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94A3B8',
            display: 'flex'
          }}>
            <Icon name="search" size={17} />
          </span>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem', backgroundColor: '#F8FAFC' }}
            placeholder="Cari nama, username atau email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">Semua Peran ({users.length})</option>
            <option value="Peserta">Peserta ({users.filter((u) => u.role === 'Peserta').length})</option>
            <option value="Admin">Admin ({users.filter((u) => u.role === 'Admin').length})</option>
          </select>
        </div>

        <button
          className="btn btn-icon btn-outline"
          title="Segarkan Data"
          onClick={fetchUsers}
        >
          <Icon name="refresh" size={16} />
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className="modern-table-card">
        <div style={{
          padding: '1.25rem 1.4rem',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#0F172A' }}>Daftar Peserta</h3>
            <span className="badge badge-gray">{filteredUsers.length}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Terakhir diperbarui: {lastUpdated}
          </div>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>NAMA</th>
                <th>NOMOR PEKERJA</th>
                <th>USERNAME</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                    Tidak ada peserta yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, idx) => {
                  const avatarTheme = getAvatarStyle(idx);
                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              backgroundColor: avatarTheme.bg,
                              color: avatarTheme.text,
                              border: `1px solid ${avatarTheme.border}`,
                              flexShrink: 0
                            }}
                          >
                            {getInitials(user.name)}
                          </div>
                          <span style={{ fontWeight: 600, color: '#0066CB' }}>
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.86rem' }}>
                        {user.nomorPekerja || '-'}
                      </td>
                      <td style={{ color: '#334155', fontSize: '0.86rem' }}>
                        {user.username}
                      </td>
                      <td style={{ color: '#64748B', fontSize: '0.86rem' }}>
                        {user.email}
                      </td>
                      <td>
                        <span className={`badge ${user.role === 'Admin' ? 'badge-purple' : 'badge-gray'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          title="Klik untuk mengubah status"
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            color: user.isActive ? '#059669' : '#DC2626'
                          }}
                        >
                          <span style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: user.isActive ? '#10B981' : '#EF4444'
                          }} />
                          {user.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}
                            onClick={() => handleEdit(user)}
                          >
                            Lihat
                          </button>
                          <button
                            className="btn btn-icon btn-outline"
                            style={{ width: '30px', height: '30px' }}
                            onClick={() => handleEdit(user)}
                            title="Edit User"
                          >
                            <Icon name="edit" size={14} />
                          </button>
                          <button
                            className="btn btn-icon btn-outline-danger"
                            style={{ width: '30px', height: '30px' }}
                            onClick={() => handleDelete(user)}
                            title="Hapus User"
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Modern Pagination ── */}
        <div className="pagination-wrap">
          <span className="pagination-info">
            Menampilkan {paginatedUsers.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} dari {filteredUsers.length} user
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <Icon name="chevronLeft" size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <Icon name="chevronRight" size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal Tambah/Edit Peserta ── */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-dialog">
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
                {editingUser ? 'Edit Data Pengguna' : 'Tambah Peserta Baru'}
              </h3>
              <button
                type="button"
                className="btn btn-icon btn-outline"
                style={{ width: '30px', height: '30px' }}
                onClick={() => setShowModal(false)}
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <form onSubmit={editingUser ? handleUpdate : handleCreate} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Rahman Nur Zaman"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nomor Pekerja / NIP</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: 791843"
                    value={formData.nomorPekerja}
                    onChange={(e) => setFormData({ ...formData, nomorPekerja: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: rahman"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="rahman@pertamina.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="Peserta">Peserta</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {editingUser ? 'Password Baru (Kosongkan bila tidak diganti)' : 'Password *'}
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                border: '1px solid #E2E8F0'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>Status Pengguna</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {formData.isActive ? 'Akun aktif dan diizinkan login ke portal ujian' : 'Akun nonaktif ditangguhkan'}
                  </div>
                </div>
                <div
                  className="switch-container"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                >
                  <div className={`switch-track ${formData.isActive ? 'active' : ''}`}>
                    <div className="switch-thumb" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
