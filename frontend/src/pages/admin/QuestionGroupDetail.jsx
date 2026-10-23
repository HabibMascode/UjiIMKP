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
    if (!window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;
    try {
      await questionService.delete(item.id);
      await fetchGroup();
    } catch (err) {
      alert(getError(err, 'Gagal menghapus soal.'));
    }
  };

  const questions = group?.questions || group?.items || [];

  if (loading) return <p>Loading data...</p>;
  if (!group) return <div className="alert-error">{error || 'Grup soal tidak ditemukan.'}</div>;

  return (
    <div>
      {/* Modal Preview Gambar */}
      {previewImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            style={{
              position: 'relative',
              background: '#fff',
              borderRadius: '12px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <h4 style={{ margin: 0 }}>Preview Gambar Soal</h4>
              <button
                type="button"
                className="btn"
                style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e9ecef', color: '#495057' }}
                onClick={() => setPreviewImage(null)}
              >
                ✕ Tutup
              </button>
            </div>
            <img
              src={previewImage}
              alt="Preview Soal"
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
            <div style={{ marginTop: '0.75rem' }}>
              <a
                href={previewImage}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.9rem', color: 'var(--primary, #4a90e2)', textDecoration: 'none' }}
              >
                Buka di tab baru ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>{group.name || group.title}</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {group.description || 'Tidak ada deskripsi.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn"
            style={{ backgroundColor: '#e9ecef', color: '#495057' }}
            onClick={() => navigate('/admin/questions')}
          >
            <Icon name="back" size={16} /> Kembali
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/admin/questions/create?groupId=${id}`)}
          >
            <Icon name="plus" size={16} /> Tambah Soal
          </button>
        </div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Daftar Soal */}
      <div className="card">
        <div
          className="card-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h4 style={{ margin: 0 }}>Soal dalam Grup ({questions.length})</h4>
          <span
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              backgroundColor: group.isActive ? 'rgba(133,194,38,0.15)' : 'rgba(218,37,28,0.15)',
              color: group.isActive ? '#85C226' : '#DA251C',
              fontWeight: 600,
            }}
          >
            {group.isActive ? 'Grup Aktif' : 'Grup Nonaktif'}
          </span>
        </div>
        <div className="card-body">
          {questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
              <p style={{ margin: 0, marginBottom: '1rem' }}>Belum ada soal dalam grup ini.</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/admin/questions/create?groupId=${id}`)}
              >
                <Icon name="plus" size={16} /> Tambah Soal Pertama
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '45px' }}>No</th>
                    <th>Pertanyaan & Gambar</th>
                    <th>Pilihan Jawaban</th>
                    <th style={{ width: '120px' }}>Jawaban Benar</th>
                    <th style={{ width: '90px' }}>Status</th>
                    <th style={{ width: '130px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((item, index) => (
                    <tr key={item.id} style={{ verticalAlign: 'top' }}>
                      <td style={{ fontWeight: 600 }}>{index + 1}</td>
                      <td style={{ minWidth: '240px' }}>
                        <div style={{ fontWeight: 500, marginBottom: item.imageUrl ? '0.6rem' : 0 }}>
                          {item.questionText}
                        </div>
                        {item.imageUrl && (
                          <div style={{ marginTop: '0.4rem' }}>
                            <img
                              src={getImageUrl(item.imageUrl)}
                              alt={`Gambar Soal ${index + 1}`}
                              style={{
                                maxHeight: '90px',
                                maxWidth: '180px',
                                objectFit: 'contain',
                                borderRadius: '6px',
                                border: '1px solid #dee2e6',
                                backgroundColor: '#f8f9fa',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'block',
                                transition: 'transform 0.15s ease',
                              }}
                              onClick={() => setPreviewImage(getImageUrl(item.imageUrl))}
                              title="Klik untuk melihat gambar lebih besar"
                            />
                            <small
                              style={{
                                color: 'var(--primary, #4a90e2)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                display: 'inline-block',
                                marginTop: '0.2rem',
                              }}
                              onClick={() => setPreviewImage(getImageUrl(item.imageUrl))}
                            >
                              🔍 Perbesar gambar
                            </small>
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.88rem', color: '#495057', minWidth: '200px' }}>
                        <div><strong>A:</strong> {item.optionA}</div>
                        <div><strong>B:</strong> {item.optionB}</div>
                        <div><strong>C:</strong> {item.optionC}</div>
                        <div><strong>D:</strong> {item.optionD}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '4px',
                            fontWeight: 700,
                            backgroundColor: '#e7f5ff',
                            color: '#1c7ed6',
                          }}
                        >
                          Pilihan {item.correctAnswer}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            backgroundColor: item.isActive !== false ? 'rgba(133,194,38,0.15)' : 'rgba(218,37,28,0.15)',
                            color: item.isActive !== false ? '#85C226' : '#DA251C',
                          }}
                        >
                          {item.isActive !== false ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn"
                            style={{
                              padding: '0.25rem 0.6rem',
                              fontSize: '0.85rem',
                              backgroundColor: '#e9ecef',
                              color: '#495057',
                            }}
                            onClick={() => navigate(`/admin/questions/${item.id}/edit`)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.35rem' }}
                            title="Hapus Soal"
                            onClick={() => handleDeleteQuestion(item)}
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
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

export default QuestionGroupDetail;
