import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import questionGroupService from '../../services/questionGroupService';
import Icon from '../../components/Icon';

const blankQuestion = { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', isActive: true };
const getError = (error, fallback) => error.response?.data?.message || error.response?.data || fallback;

const QuestionGroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [question, setQuestion] = useState(blankQuestion);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGroup = useCallback(async () => {
    try { setLoading(true); const { data } = await questionGroupService.get(id); setGroup(data); }
    catch (err) { setError(getError(err, 'Gagal memuat detail grup soal.')); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => {
    const timer = setTimeout(fetchGroup, 0);
    return () => clearTimeout(timer);
  }, [fetchGroup]);

  const questions = group?.questions || group?.items || [];
  const submitQuestion = async (event) => {
    event.preventDefault();
    try {
      if (editingId) await questionGroupService.updateQuestion(id, editingId, question);
      else await questionGroupService.addQuestion(id, question);
      setQuestion(blankQuestion); setEditingId(null); await fetchGroup();
    } catch (err) { setError(getError(err, 'Gagal menyimpan soal.')); }
  };
  const editQuestion = (item) => {
    setEditingId(item.id);
    setQuestion({
      questionText: item.questionText,
      optionA: item.optionA,
      optionB: item.optionB,
      optionC: item.optionC,
      optionD: item.optionD,
      correctAnswer: item.correctAnswer,
      isActive: item.isActive !== false
    });
  };
  const deleteQuestion = async (item) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;
    try { await questionGroupService.deleteQuestion(id, item.id); await fetchGroup(); }
    catch (err) { alert(getError(err, 'Gagal menghapus soal.')); }
  };

  if (loading) return <p>Loading data...</p>;
  if (!group) return <div className="alert-error">{error || 'Grup soal tidak ditemukan.'}</div>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div><h2 style={{ marginBottom: '0.25rem' }}>{group.name || group.title}</h2><p style={{ color: 'var(--text-muted)' }}>{group.description || 'Tidak ada deskripsi.'}</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}><button className="btn" style={{ backgroundColor: '#e9ecef', color: '#495057' }} onClick={() => navigate('/admin/questions')}><Icon name="back" size={16} /> Kembali</button><button className="btn btn-primary" onClick={() => navigate(`/admin/questions/${id}/edit`)}>Edit Grup</button></div>
      </div>
      {error && <div className="alert-error">{error}</div>}
      <div className="card"><div className="card-header"><h4 style={{ margin: 0 }}>Soal dalam Grup ({questions.length})</h4></div><div className="card-body">
        {questions.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Belum ada soal dalam grup ini.</p> : <div className="table-responsive"><table className="table"><thead><tr><th>No</th><th>Pertanyaan</th><th>Jawaban Benar</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{questions.map((item, index) => <tr key={item.id}><td>{index + 1}</td><td>{item.questionText}</td><td><strong>{item.correctAnswer}</strong></td><td>{item.isActive === false ? 'Nonaktif' : 'Aktif'}</td><td><button className="btn" style={{ padding: '0.25rem 0.6rem', backgroundColor: '#e9ecef', color: '#495057' }} onClick={() => editQuestion(item)}>Edit</button><button className="btn btn-danger" style={{ padding: '0.35rem', marginLeft: '0.4rem' }} onClick={() => deleteQuestion(item)}><Icon name="trash" size={16} /></button></td></tr>)}</tbody></table></div>}
      </div></div>
      <div className="card"><div className="card-header"><h4 style={{ margin: 0 }}>{editingId ? 'Edit Soal' : 'Tambah Soal'}</h4></div><div className="card-body"><form onSubmit={submitQuestion}>
        <div className="form-group"><label className="form-label">Pertanyaan *</label><textarea className="form-control" rows="3" value={question.questionText} onChange={(e) => setQuestion({ ...question, questionText: e.target.value })} required /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>{['A', 'B', 'C', 'D'].map((option) => <div className="form-group" key={option}><label className="form-label">Pilihan {option} *</label><input className="form-control" value={question[`option${option}`]} onChange={(e) => setQuestion({ ...question, [`option${option}`]: e.target.value })} required /></div>)}</div>
        <div className="form-group"><label className="form-label">Jawaban Benar *</label><select className="form-control" style={{ width: '200px' }} value={question.correctAnswer} onChange={(e) => setQuestion({ ...question, correctAnswer: e.target.value })}><option>A</option><option>B</option><option>C</option><option>D</option></select></div>
        <button type="submit" className="btn btn-primary">{editingId ? 'Simpan Soal' : 'Tambah Soal'}</button>{editingId && <button type="button" className="btn" style={{ marginLeft: '0.5rem', backgroundColor: '#e9ecef', color: '#495057' }} onClick={() => { setEditingId(null); setQuestion(blankQuestion); }}>Batal</button>}
      </form></div></div>
    </div>
  );
};

export default QuestionGroupDetail;
