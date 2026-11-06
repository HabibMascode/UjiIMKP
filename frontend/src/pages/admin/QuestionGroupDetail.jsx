import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import questionGroupService from '../../services/questionGroupService';
import questionService from '../../services/questionService';
import { getImageUrl } from '../../services/api';
import Icon from '../../components/Icon';

const getError = (error, fallback) =>
  error.response?.data?.message || error.response?.data || fallback;

const QuestionGroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const fetchGroup = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await questionGroupService.get(id);
      setGroup(data);
    } catch (err) {
      setError(getError(err, 'Gagal memuat detail grup soal.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const handleDeleteQuestion = async (item) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus butir soal ini?')) return;
    try {
      await questionService.delete(item.id);
      await fetchGroup();
    } catch (err) {
      alert(getError(err, 'Gagal menghapus soal.'));
    }
  };

  const questions = group?.questions || group?.items || [];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
        Memuat detail modul soal...
      </div>
    );
  }

  if (!group) {
    return <div className="alert-error">{error || 'Grup soal tidak ditemukan.'}</div>;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* ── Modal Preview Gambar ── */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Preview Gambar Soal</h3>
              <button
                type="button"
                className="btn btn-icon btn-outline"
                style={{ width: '30px', height: '30px' }}
                onClick={() => setPreviewImage(null)}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#F8FAFC' }}>
              <img
                src={previewImage}
                alt="Gambar Soal"
                style={{ maxWidth: '100%', maxHeight: '450px', borderRadius: '8px', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="page-header-wrapper">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>{group.name || group.title}</h1>
            <span className={`badge ${group.isActive ? 'badge-green' : 'badge-red'}`}>
              {group.isActive ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
          <p className="page-subtitle">
            {group.description || 'Kelola daftar pertanyaan pada paket modul ini.'}
          </p>
        </div>

        <div className="page-actions">
          <button className="btn btn-outline" onClick={() => navigate('/admin/questions')}>
            <Icon name="arrowLeft" size={16} />
            Kembali
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/admin/questions/create?groupId=${id}`)}
          >
            <Icon name="plus" size={16} />
            Tambah Soal ke Grup
          </button>
        </div>
      </div>

      {/* ── Summary Card ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <div className="card" style={{ padding: '1.25rem 1.5rem', margin: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Total Pertanyaan
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: '0.35rem' }}>
            {questions.length} Butir
          </div>
        </div>
        <div className="card" style={{ padding: '1.25rem 1.5rem', margin: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Status Modul
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: group.isActive ? '#059669' : '#DC2626', marginTop: '0.35rem' }}>
            {group.isActive ? 'Siap Diuji' : 'Ditangguhkan'}
          </div>
        </div>
        <div className="card" style={{ padding: '1.25rem 1.5rem', margin: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            ID Paket Soal
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0066CB', marginTop: '0.35rem' }}>
            #{group.id}
          </div>
        </div>
      </div>

      {/* ── Table Card: Butir Soal ── */}
      <div className="modern-table-card">
        <div style={{
          padding: '1.25rem 1.4rem',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#0F172A' }}>
            Daftar Butir Pertanyaan
          </h3>
          <span className="badge badge-blue">{questions.length} Soal</span>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>NO</th>
                <th>PERTANYAAN</th>
                <th>PILIHAN JAWABAN</th>
                <th style={{ textAlign: 'center' }}>KUNCI</th>
                <th style={{ textAlign: 'center' }}>GAMBAR</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem', color: '#64748B' }}>
                    Belum ada soal dalam grup ini. Klik "Tambah Soal ke Grup" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                questions.map((item, idx) => {
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700, color: '#64748B' }}>{idx + 1}</td>
                      <td style={{ maxWidth: '320px' }}>
                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem', lineHeight: 1.4 }}>
                          {item.questionText}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#475569', maxWidth: '300px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                          <div><strong>A:</strong> {item.optionA}</div>
                          <div><strong>B:</strong> {item.optionB}</div>
                          <div><strong>C:</strong> {item.optionC}</div>
                          <div><strong>D:</strong> {item.optionD}</div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-blue" style={{ fontWeight: 800 }}>
                          {item.correctAnswer}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {item.imageUrl ? (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => setPreviewImage(getImageUrl(item.imageUrl))}
                          >
                            <Icon name="image" size={13} /> Lihat
                          </button>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>-</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${item.isActive !== false ? 'badge-green' : 'badge-red'}`}>
                          {item.isActive !== false ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/admin/questions/${item.id}/edit`)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-icon btn-outline-danger"
                            style={{ width: '30px', height: '30px' }}
                            onClick={() => handleDeleteQuestion(item)}
                            title="Hapus Soal"
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

export default QuestionGroupDetail;
