import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Icon from '../../components/Icon';

const ResultDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/results/${id}`);
        setResult(response.data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
        Memuat rincian hasil ujian...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="alert-error">
        Data hasil ujian tidak ditemukan.
      </div>
    );
  }

  const isPassed = result.score >= 70;
  const correctCount = result.details?.filter((d) => d.isCorrect).length ?? result.correctAnswers ?? 0;
  const totalCount = result.details?.length ?? result.totalQuestions ?? 0;
  const wrongCount = totalCount - correctCount;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div className="page-header-wrapper">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Detail Hasil Ujian</h1>
            <span className={`badge ${isPassed ? 'badge-green' : 'badge-red'}`}>
              {isPassed ? 'Lulus Sertifikasi' : 'Belum Lulus'}
            </span>
            {(result.finishedAt || result.FinishedAt) && (
              <span className="badge badge-gray" style={{ fontSize: '0.78rem' }}>
                <Icon name="calendar" size={13} />
                {new Date(result.finishedAt || result.FinishedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })} WIB
              </span>
            )}
          </div>
          <p className="page-subtitle">
            Rincian lembar jawaban dan evaluasi butir soal peserta ujian IMKP.
          </p>
        </div>

        <button className="btn btn-outline" onClick={() => navigate('/admin/results')}>
          <Icon name="arrowLeft" size={16} />
          Kembali ke Rekap Nilai
        </button>
      </div>

      {/* ── Participant & Score Overview Card ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        <div className="card" style={{ padding: '1.25rem 1.4rem', margin: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            NAMA PESERTA
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginTop: '0.45rem' }}>
            {result.participantName}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem 1.4rem', margin: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            NILAI AKHIR
          </div>
          <div style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: isPassed ? '#059669' : '#DC2626',
            marginTop: '0.2rem',
            lineHeight: 1
          }}>
            {result.score}/100
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem 1.4rem', margin: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            JAWABAN BENAR
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem', lineHeight: 1 }}>
            {correctCount} <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>/ {totalCount} soal</span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem 1.4rem', margin: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            JAWABAN SALAH
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#DC2626', marginTop: '0.2rem', lineHeight: 1 }}>
            {wrongCount} <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>soal</span>
          </div>
        </div>
      </div>

      {/* ── Table Card: Rincian Jawaban ── */}
      <div className="modern-table-card">
        <div style={{
          padding: '1.25rem 1.4rem',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#0F172A' }}>
            Rincian Lembar Jawaban Peserta
          </h3>
          <span className="badge badge-gray">{totalCount} Butir Soal</span>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>NO</th>
                <th>PERTANYAAN SOAL</th>
                <th style={{ textAlign: 'center' }}>JAWABAN PESERTA</th>
                <th style={{ textAlign: 'center' }}>KUNCI BENAR</th>
                <th style={{ textAlign: 'center' }}>STATUS EVALUASI</th>
              </tr>
            </thead>
            <tbody>
              {result.details?.map((d, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: '#64748B' }}>{idx + 1}</td>
                  <td style={{ maxWidth: '480px' }}>
                    <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem', lineHeight: 1.4 }}>
                      {d.questionText}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontWeight: 700,
                      backgroundColor: d.isCorrect ? '#ECFDF5' : '#FEF2F2',
                      color: d.isCorrect ? '#059669' : '#DC2626'
                    }}>
                      {d.selectedAnswer || 'Tidak Dijawab'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-blue" style={{ fontWeight: 800 }}>
                      {d.correctAnswer}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${d.isCorrect ? 'badge-green' : 'badge-red'}`}>
                      {d.isCorrect ? '✓ Benar' : '✗ Salah'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultDetail;
