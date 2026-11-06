import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Icon from '../../components/Icon';

const ExamResult = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);

  useEffect(() => {
    if (!result) {
      const fetchResult = async () => {
        try {
          const response = await api.get(`/exams/${id}/result`);
          setResult(response.data);
        } catch (err) {
          console.error('Error fetching exam result:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchResult();
    }
  }, [id, result]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
        Memuat hasil evaluasi ujian...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="alert-error" style={{ maxWidth: '500px', margin: '2rem auto' }}>
        Hasil ujian tidak ditemukan.
      </div>
    );
  }

  const passed = result.score >= 70;

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto', paddingTop: '1.5rem' }}>
      <div className="card" style={{ padding: 0, overflow: 'hidden', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
        {/* Top colored accent banner */}
        <div style={{
          backgroundColor: passed ? '#10B981' : '#EF4444',
          height: '8px',
          width: '100%'
        }} />

        <div style={{ padding: '3rem 2.5rem' }}>
          {/* Status Badge */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: passed ? '#ECFDF5' : '#FEF2F2',
            color: passed ? '#059669' : '#DC2626',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            {passed ? <Icon name="check" size={32} strokeWidth={2.5} /> : <Icon name="x" size={32} strokeWidth={2.5} />}
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
            {passed ? 'Selamat, Anda Lulus!' : 'Ujian Telah Selesai'}
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '2.5rem', maxWidth: '440px', marginInline: 'auto' }}>
            {passed
              ? 'Anda telah berhasil memenuhi standar kompetensi minimal sertifikasi IMKP.'
              : 'Skor Anda belum mencapai ambang batas kelulusan sertifikasi minimum (70/100).'}
          </p>

          {/* Circular Score Badge */}
          <div style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            border: `8px solid ${passed ? '#10B981' : '#EF4444'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2.5rem',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-card)'
          }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: passed ? '#059669' : '#DC2626', lineHeight: 1 }}>
              {result.score}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '0.2rem' }}>
              SKOR AKHIR
            </span>
          </div>

          {/* 3 Metric Breakdown Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2.5rem'
          }}>
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
                {result.totalQuestions}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                Total Soal
              </div>
            </div>

            <div style={{
              backgroundColor: '#ECFDF5',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid #A7F3D0'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>
                {result.correctAnswers}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                Jawaban Benar
              </div>
            </div>

            <div style={{
              backgroundColor: '#FEF2F2',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid #FECACA'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#DC2626' }}>
                {result.wrongAnswers}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#DC2626', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                Jawaban Salah
              </div>
            </div>
          </div>

          {/* Return Button */}
          <button
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}
            onClick={() => navigate('/peserta/dashboard')}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResult;
