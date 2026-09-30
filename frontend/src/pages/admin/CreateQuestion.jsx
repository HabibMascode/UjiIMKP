import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import questionGroupService from '../../services/questionGroupService';
import Icon from '../../components/Icon';

const emptyForm = { name: '', description: '', isActive: true };
const getError = (error, fallback) => error.response?.data?.message || error.response?.data || fallback;

const CreateQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) return;
    questionGroupService.get(id).then(({ data }) => {
      setFormData({ name: data.name || data.title || '', description: data.description || '', isActive: data.isActive !== false });
    }).catch((err) => setError(getError(err, 'Gagal memuat grup soal.'))).finally(() => setLoading(false));
  }, [editing, id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = editing
        ? await questionGroupService.update(id, formData)
        : await questionGroupService.create(formData);
      navigate(editing ? `/admin/questions/${id}` : `/admin/questions/${response.data.id}`);
    } catch (err) {
      setError(getError(err, 'Gagal menyimpan grup soal.'));
    }
  };

  if (loading) return <p>Loading data...</p>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>{editing ? 'Edit Grup Soal' : 'Buat Grup Soal'}</h2>
        <button className="btn" style={{ backgroundColor: '#e9ecef', color: '#495057' }} onClick={() => navigate('/admin/questions')}><Icon name="back" size={16} /> Kembali</button>
      </div>
      <div className="card"><div className="card-body">
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Nama Grup *</label><input className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
          <div className="form-group"><label className="form-label">Deskripsi</label><textarea className="form-control" rows="4" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} /> Grup aktif</label>
          <button type="submit" className="btn btn-primary">{editing ? 'Simpan Perubahan' : 'Buat Grup'}</button>
        </form>
      </div></div>
    </div>
  );
};

export default CreateQuestion;
