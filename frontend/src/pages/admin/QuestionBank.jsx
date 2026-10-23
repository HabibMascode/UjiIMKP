import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import questionGroupService from '../../services/questionGroupService';
import Icon from '../../components/Icon';

const getError = (error, fallback) => error.response?.data?.message || error.response?.data || fallback;
const getGroups = (data) => Array.isArray(data) ? data : data.groups || data.items || [];

/* ── Modal Buat Grup ── */
const CreateGroupModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Nama grup harus diisi.'); return; }
    setSaving(true);
    setError('');
    try {
      const { data } = await questionGroupService.create({ name: name.trim(), description: description.trim(), isActive: true });
      onCreated(data);
    } catch (err) {
      setError(getError(err, 'Gagal membuat grup soal.'));
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--bg-card, #fff)', borderRadius: '12px',
        padding: '1.75rem', width: '100%', maxWidth: '440px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <h3 style={{ margin: '0 0 1.25rem' }}>Buat Grup Soal</h3>
        {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Grup *</label>
            <input
              ref={nameRef}
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Matematika Dasar"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea
              className="form-control"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opsional..."
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Buat Grup'}
            </button>
            <button type="button" className="btn" style={{ backgroundColor: '#e9ecef', color: '#495057' }} onClick={onClose}>
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Halaman Bank Soal ── */
const QuestionBank = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await questionGroupService.list();
      setGroups(getGroups(response.data));
    } catch (err) {
      setError(getError(err, 'Gagal memuat grup soal.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchGroups, 0);
    return () => clearTimeout(timer);
  }, [fetchGroups]);

  const handleStatus = async (group) => {
    try {
      await questionGroupService.updateStatus(group.id, !group.isActive);
      setGroups((cur) => cur.map((g) => g.id === group.id ? { ...g, isActive: !group.isActive } : g));
    } catch (err) {
      alert(getError(err, 'Gagal mengubah status grup.'));
    }
  };

  const handleDelete = async (group) => {
    const groupName = group.name || group.title;
    if (!window.confirm(`Hapus grup "${groupName}"? Semua soal di dalamnya juga akan dihapus.`)) return;
    try {
      await questionGroupService.delete(group.id);
      setGroups((cur) => cur.filter((g) => g.id !== group.id));
    } catch (err) {
      alert(getError(err, 'Gagal menghapus grup soal.'));
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const content = await file.text();
      const parsed = JSON.parse(content);
      await questionGroupService.importJson(parsed);
      await fetchGroups();
      alert('Grup soal berhasil diimpor.');
    } catch (err) {
      alert(err instanceof SyntaxError ? 'File JSON tidak valid.' : getError(err, 'Gagal mengimpor grup soal.'));
    }
  };

  const handleGroupCreated = (newGroup) => {
    setShowModal(false);
    // Langsung navigasi ke detail grup yang baru dibuat
    navigate(`/admin/questions/${newGroup.id}`);
  };

  return (
    <div>
      {showModal && (
        <CreateGroupModal
          onClose={() => setShowModal(false)}
          onCreated={handleGroupCreated}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>Bank Soal</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Kelola grup soal dan pertanyaan yang digunakan dalam ujian.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleImport} hidden />
          <button className="btn" style={{ backgroundColor: '#e9ecef', color: '#495057' }} onClick={() => fileInputRef.current?.click()}>
            Impor JSON
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Icon name="plus" size={16} /> Buat Grup
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h4 style={{ margin: 0 }}>Daftar Grup Soal ({groups.length})</h4>
        </div>
        <div className="card-body">
          {loading ? (
            <p>Loading data...</p>
          ) : groups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📂</div>
              <p style={{ margin: 0 }}>Belum ada grup soal. Klik "Buat Grup" untuk memulai.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Grup</th>
                    <th>Deskripsi</th>
                    <th>Jumlah Soal</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.id} style={{ cursor: 'pointer' }}>
                      <td
                        onClick={() => navigate(`/admin/questions/${group.id}`)}
                        style={{ fontWeight: 600, color: 'var(--primary, #4a90e2)' }}
                      >
                        {group.name || group.title}
                      </td>
                      <td style={{ maxWidth: '300px', color: 'var(--text-muted)' }}>
                        {group.description || '-'}
                      </td>
                      <td onClick={() => navigate(`/admin/questions/${group.id}`)}>
                        {group.questionCount ?? group.questions?.length ?? 0}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleStatus(group)}
                          style={{
                            padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none',
                            cursor: 'pointer', fontSize: '0.85rem',
                            backgroundColor: group.isActive ? 'rgba(133,194,38,0.2)' : 'rgba(218,37,28,0.2)',
                            color: group.isActive ? '#85C226' : '#DA251C',
                          }}
                        >
                          {group.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.85rem', backgroundColor: '#e9ecef', color: '#495057' }}
                          onClick={() => navigate(`/admin/questions/${group.id}`)}
                        >
                          Lihat
                        </button>
                        <button
                          className="btn btn-danger"
                          aria-label={`Hapus ${group.name || group.title}`}
                          title="Hapus"
                          style={{ padding: '0.35rem' }}
                          onClick={() => handleDelete(group)}
                        >
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
    </div>
  );
};

export default QuestionBank;
