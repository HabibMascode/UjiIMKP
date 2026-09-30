import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Icon from '../../components/Icon';

const ParticipantDashboard = () => {
  const name = localStorage.getItem('name') || 'Peserta';
  const navigate = useNavigate();
  const [hasActiveExam, setHasActiveExam] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStartExam = async () => {
    if (!window.confirm('Apakah Anda yakin ingin memulai ujian? Ujian yang sudah dimulai tidak dapat diulang.')) return;
    setLoading(true);
    try {
      const response = await api.post('/exams/start');
      navigate('/peserta/exam', { state: { examData: response.data } });
    } catch (err) {
      alert(err.response?.data || 'Gagal memulai ujian.');
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Selamat datang, {name}!</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>
        Anda dapat memulai ujian IMKP dengan menekan tombol di bawah ini.
      </p>

      <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}><Icon name="question" size={56} strokeWidth={1.5} /></div>
        <h3 style={{ marginBottom: '0.5rem' }}>Ujian IMKP</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Soal akan diacak secara otomatis oleh sistem. Jawablah seluruh pertanyaan dengan teliti sebelum menekan tombol Submit.
        </p>
        <button 
          className="btn btn-primary" 
          style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
          onClick={handleStartExam}
          disabled={loading}
        >
          {loading ? 'Memulai...' : <><Icon name="play" size={16} /> Mulai Ujian</>}
        </button>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
