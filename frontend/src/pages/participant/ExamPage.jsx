import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Icon from '../../components/Icon';

const ExamPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const examData = location.state?.examData;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    const unanswered = questions.length - Object.keys(answers).length;
    const confirmMsg = unanswered > 0
      ? `Anda masih memiliki ${unanswered} soal yang belum dijawab. Yakin ingin submit?`
      : 'Apakah Anda yakin ingin submit ujian ini?';

    if (!window.confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          questionId: parseInt(questionId),
          selectedAnswer
        }))
      };
      const response = await api.post(`/exams/${examData.examId}/submit`, payload);
      navigate(`/peserta/result/${examData.examId}`, { state: { result: response.data } });
    } catch (err) {
      alert(err.response?.data || 'Gagal submit ujian.');
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Ujian IMKP</h3>
        <span style={{ color: 'var(--text-muted)' }}>
          Soal {currentIndex + 1} dari {questions.length} | Dijawab: {Object.keys(answers).length}/{questions.length}
        </span>
      </div>

      <div style={{ height: '6px', backgroundColor: '#e9ecef', borderRadius: '3px', marginBottom: '1.5rem' }}>
        <div style={{
          height: '100%',
          width: `${((currentIndex + 1) / questions.length) * 100}%`,
          backgroundColor: 'var(--primary-color)',
          borderRadius: '3px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Question Card */}
      <div className="card">
        <div className="card-body" style={{ padding: '2rem' }}>
          <h4 style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
            <span style={{ color: 'var(--primary-color)', marginRight: '8px' }}>#{currentIndex + 1}</span>
            {currentQuestion.questionText}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['A', 'B', 'C', 'D'].map((opt) => {
              const optionKey = `option${opt}`;
              const isSelected = answers[currentQuestion.id] === opt;
              return (
                <div key={opt}
                  onClick={() => handleAnswer(currentQuestion.id, opt)}
                  style={{
                    padding: '1rem 1.25rem',
                    border: isSelected ? '2px solid var(--primary-color)' : '2px solid #e9ecef',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(67, 97, 238, 0.08)' : '#fff',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <span style={{
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isSelected ? 'var(--primary-color)' : '#e9ecef',
                    color: isSelected ? '#fff' : '#495057',
                    fontWeight: 600, fontSize: '0.9rem',
                    flexShrink: 0
                  }}>
                    {opt}
                  </span>
                  <span>{currentQuestion[optionKey]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        <button className="btn" style={{ backgroundColor: '#e9ecef', color: '#495057' }}
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}>
          <Icon name="back" size={16} /> Sebelumnya
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {currentIndex < questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrentIndex(currentIndex + 1)}>
              Selanjutnya <Icon name="next" size={16} />
            </button>
          ) : (
            <button className="btn" style={{ backgroundColor: 'var(--success-color)', color: '#fff' }}
              onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Mengirim...' : 'Submit Ujian'}
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header"><h4 style={{ margin: 0 }}>Navigasi Soal</h4></div>
        <div className="card-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {questions.map((q, idx) => (
              <button key={q.id}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: '40px', height: '40px',
                  border: idx === currentIndex ? '2px solid var(--primary-color)' : '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: answers[q.id] ? 'var(--primary-color)' : '#fff',
                  color: answers[q.id] ? '#fff' : '#333',
                  fontWeight: idx === currentIndex ? 700 : 400,
                  fontSize: '0.85rem'
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
