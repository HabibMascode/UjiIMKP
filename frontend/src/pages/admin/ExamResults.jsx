import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ExamResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get('/results');
        setResults(response.data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Hasil Ujian Peserta</h2>

      <div className="card">
        <div className="card-header">
          <h4 style={{ margin: 0 }}>Rekap Nilai ({results.length} ujian selesai)</h4>
        </div>
        <div className="card-body">
          {loading ? (
            <p>Loading data...</p>
          ) : results.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Belum ada peserta yang menyelesaikan ujian.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Peserta</th>
                    <th>Total Soal</th>
                    <th>Benar</th>
                    <th>Salah</th>
                    <th>Nilai</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => (
                    <tr key={r.examId}>
                      <td>{idx + 1}</td>
                      <td>{r.participantName}</td>
                      <td>{r.totalQuestions}</td>
                      <td style={{ color: '#85C226' }}>{r.correctAnswers}</td>
                      <td style={{ color: '#DA251C' }}>{r.wrongAnswers}</td>
                      <td>
                        <strong style={{ color: r.score >= 70 ? '#85C226' : '#DA251C' }}>{r.score}</strong>
                      </td>
                      <td>{r.finishedAt ? new Date(r.finishedAt).toLocaleDateString('id-ID') : '-'}</td>
                      <td>
                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                          onClick={() => navigate(`/admin/results/${r.examId}`)}>Detail</button>
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

export default ExamResults;
