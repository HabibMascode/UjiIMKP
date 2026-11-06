import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Icon from '../../components/Icon';

const ParticipantDashboard = () => {
  const name = localStorage.getItem('name') || 'Peserta';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartExam = async () => {
    if (!window.confirm('Apakah Anda yakin ingin memulai ujian sekarang? Timer akan langsung berjalan dan ujian tidak dapat diulang.')) return;
    setLoading(true);
    try {
      const response = await api.post('/exams/start');
      navigate('/peserta/exam', { state: { examData: response.data } });
    } catch (err) {
      alert(err.response?.data || 'Gagal memulai ujian. Pastikan bank soal aktif tersedia.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '1rem' }}>
      {/* ── Welcome Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="page-eyebrow" style={{ justifyContent: 'center' }}>
          SERTIFIKASI KOMPETENSI IMKP • TAHUN 2026
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
          Selamat Datang, {name}!
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0, maxWidth: '580px', marginInline: 'auto' }}>
          Portal resmi ujian evaluasi kompetensi keselamatan kerja dan operasional Kilang Pertamina (IMKP).
        </p>
      </div>

      {/* ── Main Exam Preparation Card ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
        {/* Blue Accent Header */}
        <div style={{
          backgroundColor: '#0066CB',
          color: '#ffffff',
          padding: '1.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon name="question" size={28} />
          </div>
          <div>
            <h2 style={{ color: '#ffffff', margin: 0, fontSize: '1.35rem' }}>
              Ujian Sertifikasi IMKP
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
              Modul Standar Operasional & Keselamatan Kerja Kilang
            </p>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Petunjuk Pengerjaan */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.85rem' }}>
              Petunjuk dan Ketentuan Ujian:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.88rem', color: '#475569' }}>
                <span style={{ color: '#0066CB', marginTop: '2px' }}><Icon name="checkCircle" size={16} /></span>
                <span>Seluruh butir soal berupa pilihan ganda (A, B, C, D) dengan satu jawaban benar.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.88rem', color: '#475569' }}>
                <span style={{ color: '#0066CB', marginTop: '2px' }}><Icon name="checkCircle" size={16} /></span>
                <span>Standar kelulusan minimum sertifikasi adalah <strong>skor 70 dari 100</strong>.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.88rem', color: '#475569' }}>
                <span style={{ color: '#0066CB', marginTop: '2px' }}><Icon name="checkCircle" size={16} /></span>
                <span>Setiap peserta hanya dapat mengerjakan sesi ujian ini <strong>1 kali</strong>.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.88rem', color: '#475569' }}>
                <span style={{ color: '#0066CB', marginTop: '2px' }}><Icon name="checkCircle" size={16} /></span>
                <span>Pastikan koneksi internet stabil sebelum menekan tombol Mulai Ujian.</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem', borderRadius: '12px' }}
              onClick={handleStartExam}
              disabled={loading}
            >
              {loading ? (
                'Menyiapkan Lembar Soal...'
              ) : (
                <>
                  <Icon name="play" size={17} />
                  Mulai Ujian Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
