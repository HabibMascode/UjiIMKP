import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

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
          console.error('Error:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchResult();
    }
  }, [id, result]);

  if (loading) return <p style={{ textAlign: 'center', padding: '3rem' }}>Loading...</p>;
  if (!result) return <p style={{ textAlign: 'center', padding: '3rem' }}>Hasil ujian tidak ditemukan.</p>;

  const passed = result.score >= 70;

  return (
    <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
      <div className="card" style={{ maxWidth: '550px', margin: '0 auto' }}>
        <div className="card-body" style={{ padding: '2.5rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
            {passed ? '🎉' : '📚'}
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>
            {passed ? 'Selamat!' : 'Ujian Selesai'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {passed ? 'Anda telah lulus ujian IMKP.' : 'Terus belajar dan coba lagi!'}
          </p>

          <div style={{
            width: '140px', height: '140px',
            borderRadius: '50%',
            border: `6px solid ${passed ? '#85C226' : '#DA251C'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem'
          }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: passed ? '#85C226' : '#DA251C' }}>{result.score}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nilai</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--dark-color)' }}>{result.totalQuestions}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Soal</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#85C226' }}>{result.correctAnswers}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Benar</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#DA251C' }}>{result.wrongAnswers}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Salah</div>
            </div>
          </div>

          <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}
            onClick={() => navigate('/peserta/dashboard')}>
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResult;
