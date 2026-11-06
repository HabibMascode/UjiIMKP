import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import questionGroupService from '../../services/questionGroupService';
import Icon from '../../components/Icon';

const getError = (error, fallback) =>
  error.response?.data?.message || error.response?.data || fallback;
const getGroups = (data) =>
  Array.isArray(data) ? data : data.groups || data.items || [];

/* ── Modern Modal Buat Grup ── */
const CreateGroupModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama grup harus diisi.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { data } = await questionGroupService.create({
        name: name.trim(),
        description: description.trim(),
        isActive: true,
      });
      onCreated(data);
    } catch (err) {
      setError(getError(err, 'Gagal membuat grup soal.'));
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog">
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#0F172A' }}>
            Buat Grup Soal Baru
          </h3>
          <button
            type="button"
            className="btn btn-icon btn-outline"
            style={{ width: '30px', height: '30px' }}
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && <div className="alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Nama Grup / Modul *</label>
            <input
              ref={nameRef}
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Keselamatan Kerja HSE Level 1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Deskripsi Modul</label>
            <textarea
              className="form-control"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan cakupan kompetensi dan materi modul..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : 'Buat Grup'}
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
  const [searchQuery, setSearchQuery] = useState('');
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
      setGroups((cur) =>
        cur.map((g) => (g.id === group.id ? { ...g, isActive: !group.isActive } : g))
      );
    } catch (err) {
      alert(getError(err, 'Gagal mengubah status grup.'));
    }
  };

  const handleDelete = async (group) => {
    const groupName = group.name || group.title;
    if (!window.confirm(`Hapus grup "${groupName}"? Semua butir soal di dalamnya juga akan terhapus.`)) return;
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
      alert('Grup soal dan bank soal berhasil diimpor.');
    } catch (err) {
      alert(
        err instanceof SyntaxError
          ? 'File JSON tidak valid.'
          : getError(err, 'Gagal mengimpor grup soal.')
      );
    }
  };

  const filteredGroups = groups.filter((g) => {
    const term = searchQuery.toLowerCase();
    return (
      (g.name || g.title || '').toLowerCase().includes(term) ||
      (g.description || '').toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {showModal && (
        <CreateGroupModal
          onClose={() => setShowModal(false)}
          onCreated={(newGroup) => {
            setShowModal(false);
            navigate(`/admin/questions/${newGroup.id}`);
          }}
        />
      )}

      {/* ── Page Header ── */}
      <div className="page-header-wrapper">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Bank Soal</h1>
            <span className="badge badge-blue">
              Total {groups.length} Grup
            </span>
          </div>
          <p className="page-subtitle">
            Kelola grup soal evaluasi, modul uji, dan butir pertanyaan kompetensi IMKP.
          </p>
        </div>

        <div className="page-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            hidden
          />
          <button
            className="btn btn-outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="download" size={16} />
            Impor JSON
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Icon name="plus" size={16} />
            Buat Grup
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* ── Search Bar ── */}
      <div className="filter-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94A3B8',
            display: 'flex'
          }}>
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Cari nama grup atau materi modul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-icon btn-outline" onClick={fetchGroups} title="Segarkan Data">
          <Icon name="refresh" size={16} />
        </button>
      </div>

      {/* ── Table Card: Daftar Grup Soal ── */}
      <div className="modern-table-card">
        <div style={{
          padding: '1.25rem 1.4rem',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#0F172A' }}>
            Daftar Modul & Grup Soal
          </h3>
          <span className="badge badge-gray">{filteredGroups.length} grup</span>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>NAMA GRUP MODUL</th>
                <th>DESKRIPSI</th>
                <th style={{ textAlign: 'center' }}>JUMLAH SOAL</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3.5rem', color: '#64748B' }}>
                    Memuat daftar grup soal...
                  </td>
                </tr>
              ) : filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3.5rem', color: '#64748B' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📂</div>
                    <p style={{ margin: 0, fontWeight: 500 }}>Belum ada grup soal. Klik "Buat Grup" untuk memulai.</p>
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group, idx) => {
                  const qCount = group.questionCount ?? group.questions?.length ?? 0;
                  return (
                    <tr key={group.id} style={{ cursor: 'pointer' }}>
                      <td onClick={() => navigate(`/admin/questions/${group.id}`)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            backgroundColor: '#EEF6FF',
                            color: '#0066CB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Icon name="fileText" size={17} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0066CB', fontSize: '0.92rem' }}>
                              {group.name || group.title}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                              ID Modul: #{group.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        onClick={() => navigate(`/admin/questions/${group.id}`)}
                        style={{ maxWidth: '340px', color: '#475569', fontSize: '0.86rem' }}
                      >
                        {group.description || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Tidak ada deskripsi</span>}
                      </td>
                      <td
                        onClick={() => navigate(`/admin/questions/${group.id}`)}
                        style={{ textAlign: 'center' }}
                      >
                        <span className="badge badge-blue">
                          {qCount} Butir
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatus(group);
                          }}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            color: group.isActive ? '#059669' : '#DC2626'
                          }}
                        >
                          <span style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: group.isActive ? '#10B981' : '#EF4444'
                          }} />
                          {group.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/questions/${group.id}`);
                            }}
                          >
                            Kelola
                          </button>
                          <button
                            className="btn btn-icon btn-outline-danger"
                            style={{ width: '30px', height: '30px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(group);
                            }}
                            title="Hapus Grup"
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
      </div>
    </div>
  );
};

export default QuestionBank;
