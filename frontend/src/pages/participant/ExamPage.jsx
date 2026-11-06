import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../../services/api';
import Icon from '../../components/Icon';

const ExamPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const examData = location.state?.examData;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    if (!examData) {
      navigate('/peserta/dashboard');
    }
  }, [examData, navigate]);

  if (!examData) return null;

  const questions = examData.questions;
  const currentQuestion = questions[currentIndex];

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    const unanswered = questions.length - answeredCount;
    const confirmMsg =
      unanswered > 0
        ? `Anda masih memiliki ${unanswered} dari ${questions.length} soal yang belum dijawab. Yakin ingin mengakhiri dan mengirim ujian?`
        : `Anda telah menjawab seluruh ${questions.length} soal. Yakin ingin submit jawaban?`;

    if (!window.confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          questionId: parseInt(questionId),
          selectedAnswer,
        })),
      };
      const response = await api.post(`/exams/${examData.examId}/submit`, payload);
      navigate(`/peserta/result/${examData.examId}`, { state: { result: response.data } });
    } catch (err) {
      alert(err.response?.data || 'Gagal mengirim ujian.');
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Zoom Modal Gambar Soal */}
      {zoomedImage && (
        <div className="modal-overlay" onClick={() => setZoomedImage(null)}>
          <div className="modal-dialog" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h4 style={{ margin: 0 }}>Gambar Soal #{currentIndex + 1}</h4>
              <button
                type="button"
                className="btn btn-icon btn-outline"
                style={{ width: '30px', height: '30px' }}
                onClick={() => setZoomedImage(null)}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#F8FAFC' }}>
              <img
                src={zoomedImage}
                alt={`Zoom Soal ${currentIndex + 1}`}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Top Exam Status Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <span className="page-eyebrow">LEMBAR UJIAN DIGITAL</span>
          <h2 style={{ fontSize: '1.35rem', margin: '0.2rem 0 0', color: '#0F172A' }}>
            Soal No. {currentIndex + 1} <span style={{ color: '#64748B', fontSize: '0.95rem', fontWeight: 500 }}>dari {questions.length}</span>
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Terjawab
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0066CB' }}>
              {answeredCount} / {questions.length}
            </div>
          </div>
          <span className="badge badge-green" style={{ padding: '0.35rem 0.75rem' }}>
            {progressPercent}% Selesai
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '9999px', marginBottom: '1.75rem', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          backgroundColor: '#0066CB',
          borderRadius: '9999px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* ── Question Card ── */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {currentQuestion.questionText}
        </h3>

        {/* Gambar Soal (Jika Ada) */}
        {currentQuestion.imageUrl && (
          <div style={{
            marginBottom: '1.5rem',
            textAlign: 'center',
            backgroundColor: '#F8FAFC',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #E2E8F0'
          }}>
            <img
              src={getImageUrl(currentQuestion.imageUrl)}
              alt={`Gambar Soal ${currentIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '320px',
                borderRadius: '8px',
                objectFit: 'contain',
                cursor: 'zoom-in',
                display: 'inline-block'
              }}
              onClick={() => setZoomedImage(getImageUrl(currentQuestion.imageUrl))}
              title="Klik untuk memperbesar gambar"
            />
            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setZoomedImage(getImageUrl(currentQuestion.imageUrl))}
              >
                <Icon name="search" size={13} /> Perbesar Gambar
              </button>
            </div>
          </div>
        )}

        {/* Pilihan Jawaban A-D */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {['A', 'B', 'C', 'D'].map((opt) => {
            const optionKey = `option${opt}`;
            const isSelected = answers[currentQuestion.id] === opt;
            return (
              <div
                key={opt}
                onClick={() => handleAnswer(currentQuestion.id, opt)}
                style={{
                  padding: '1rem 1.25rem',
                  border: isSelected ? '2px solid #0066CB' : '1.5px solid #E2E8F0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: isSelected ? '0 4px 12px rgba(0, 102, 203, 0.12)' : 'var(--shadow-xs)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? '#0066CB' : '#F1F5F9',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}>
                  {opt}
                </div>
                <span style={{
                  fontSize: '0.92rem',
                  color: isSelected ? '#0066CB' : '#334155',
                  fontWeight: isSelected ? 600 : 400
                }}>
                  {currentQuestion[optionKey]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Navigation Bottom Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button
          className="btn btn-outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
        >
          <Icon name="arrowLeft" size={16} /> Sebelumnya
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {currentIndex < questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrentIndex(currentIndex + 1)}>
              Selanjutnya <Icon name="arrowRight" size={16} />
            </button>
          ) : (
            <button
              className="btn"
              style={{ backgroundColor: '#10B981', color: '#ffffff', fontWeight: 700 }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              <Icon name="check" size={16} />
              {submitting ? 'Mengirim Lembar Jawaban...' : 'Submit Ujian Sekarang'}
            </button>
          )}
        </div>
      </div>

      {/* ── Question Grid Navigator ── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#0F172A' }}>Navigasi Nomor Soal</h4>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Warna biru menandakan soal telah dijawab
          </span>
        </div>
        <div style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const hasAnswer = Boolean(answers[q.id]);
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    border: isCurrent ? '2px solid #0066CB' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    backgroundColor: hasAnswer ? '#0066CB' : '#FFFFFF',
                    color: hasAnswer ? '#FFFFFF' : '#334155',
                    fontWeight: isCurrent ? 800 : (hasAnswer ? 700 : 500),
                    fontSize: '0.85rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
