import React, { useState, useEffect } from 'react';
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

  if (loading) return <p>Loading...</p>;
  if (!result) return <p>Data tidak ditemukan.</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Detail Hasil Ujian</h2>
        <button className="btn" style={{ backgroundColor: '#e9ecef', color: '#495057' }} onClick={() => navigate('/admin/results')}><Icon name="back" size={16} /> Kembali</button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><strong>Nama Peserta:</strong> {result.participantName}</div>
            <div><strong>Nilai:</strong> <span style={{ fontSize: '1.5rem', fontWeight: 700, color: result.score >= 70 ? '#85C226' : '#DA251C' }}>{result.score}</span></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h4 style={{ margin: 0 }}>Rincian Jawaban</h4>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Pertanyaan</th>
                  <th>Jawaban Peserta</th>
                  <th>Jawaban Benar</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {result.details.map((d, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td style={{ maxWidth: '400px' }}>{d.questionText}</td>
                    <td>{d.selectedAnswer || '-'}</td>
                    <td>{d.correctAnswer}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem',
                        backgroundColor: d.isCorrect ? 'rgba(76, 201, 240, 0.2)' : 'rgba(247, 37, 133, 0.2)',
                        color: d.isCorrect ? '#85C226' : '#DA251C'
                      }}>
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
    </div>
  );
};

export default ResultDetail;
