import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import questionGroupService from '../../services/questionGroupService';
import Icon from '../../components/Icon';

const getError = (error, fallback) => error.response?.data?.message || error.response?.data || fallback;
const getGroups = (data) => Array.isArray(data) ? data : data.groups || data.items || [];

const QuestionBank = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      setGroups((current) => current.map((item) => item.id === group.id ? { ...item, isActive: !group.isActive } : item));
    } catch (err) {
      alert(getError(err, 'Gagal mengubah status grup.'));
    }
  };

  const handleDelete = async (group) => {
    const groupName = group.name || group.title;
    if (!window.confirm(`Apakah Anda yakin ingin menghapus grup "${groupName}"? Semua soal di dalamnya juga akan dihapus.`)) return;

    try {
      await questionGroupService.delete(group.id);
      setGroups((current) => current.filter((item) => item.id !== group.id));
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
      alert(err instanceof SyntaxError ? 'File yang dipilih bukan JSON yang valid.' : getError(err, 'Gagal mengimpor grup soal.'));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>Bank Soal</h2>
          <p style={{ color: 'var(--text-muted)' }}>Kelola grup soal dan pertanyaan yang digunakan dalam ujian.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleImport} hidden />
          <button className="btn" style={{ backgroundColor: '#e9ecef', color: '#495057' }} onClick={() => fileInputRef.current?.click()}>
            Impor JSON
          </button>
          <Link to="/admin/questions/create" className="btn btn-primary"><Icon name="plus" size={16} /> Buat Grup</Link>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}
      <div className="card">
        <div className="card-header"><h4 style={{ margin: 0 }}>Daftar Grup Soal ({groups.length})</h4></div>
        <div className="card-body">
          {loading ? <p>Loading data...</p> : groups.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Belum ada grup soal.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead><tr><th>Nama Grup</th><th>Deskripsi</th><th>Jumlah Soal</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody>{groups.map((group) => (
                  <tr key={group.id}>
                    <td><strong>{group.name || group.title}</strong></td>
                    <td style={{ maxWidth: '300px' }}>{group.description || '-'}</td>
                    <td>{group.questionCount ?? group.questions?.length ?? 0}</td>
                    <td>
                      <button type="button" onClick={() => handleStatus(group)} style={{
                        padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
                        backgroundColor: group.isActive ? 'rgba(133, 194, 38, 0.2)' : 'rgba(218, 37, 28, 0.2)',
                        color: group.isActive ? '#85C226' : '#DA251C'
                      }}>{group.isActive ? 'Aktif' : 'Nonaktif'}</button>
                    </td>
                    <td style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn" style={{ padding: '0.25rem 0.6rem', fontSize: '0.85rem', backgroundColor: '#e9ecef', color: '#495057' }} onClick={() => navigate(`/admin/questions/${group.id}/edit`)}>Edit</button>
                      <button className="btn btn-danger" aria-label={`Hapus ${group.name || group.title}`} title="Hapus" style={{ padding: '0.35rem' }} onClick={() => handleDelete(group)}>
                        <Icon name="trash" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
