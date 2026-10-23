import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import questionService from '../../services/questionService';
import questionGroupService from '../../services/questionGroupService';
import { getImageUrl } from '../../services/api';

const emptyForm = {
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  isActive: true,
  questionGroupId: '',
  imageUrl: '',
};

const getError = (error, fallback) =>
  error.response?.data?.message || error.response?.data || fallback;

const CreateQuestion = () => {
  const { id } = useParams(); // id soal jika edit
  const location = useLocation();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const queryParams = new URLSearchParams(location.search);
  const preselectedGroupId = queryParams.get('groupId') || '';

  const [formData, setFormData] = useState({
    ...emptyForm,
    questionGroupId: preselectedGroupId,
  });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const fetchGroups = useCallback(async () => {
    try {
      const { data } = await questionGroupService.list();
      const list = Array.isArray(data) ? data : data.groups || data.items || [];
      setGroups(list);
    } catch {
      // grup tidak wajib tersedia
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    if (!editing) return;
    questionService.get(id)
      .then(({ data }) => {
        setFormData({
          questionText: data.questionText || '',
          optionA: data.optionA || '',
          optionB: data.optionB || '',
          optionC: data.optionC || '',
          optionD: data.optionD || '',
          correctAnswer: data.correctAnswer || 'A',
          isActive: data.isActive !== false,
          questionGroupId: data.questionGroupId ? String(data.questionGroupId) : '',
          imageUrl: data.imageUrl || '',
        });
      })
      .catch((err) => setError(getError(err, 'Gagal memuat soal.')))
      .finally(() => setLoading(false));
  }, [editing, id, fetchGroups]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      let imageUrl = formData.imageUrl;
      // Upload gambar baru jika ada file dipilih
      if (formData.imageFile) {
        const { data } = await questionService.uploadImage(formData.imageFile);
        imageUrl = data.url;
      }
      const { imageFile, ...rest } = formData;
      const targetGroupId = formData.questionGroupId ? parseInt(formData.questionGroupId) : null;
      const payload = {
        ...rest,
        imageUrl,
        questionGroupId: targetGroupId,
      };
      if (editing) {
        await questionService.update(id, payload);
      } else {
        await questionService.create(payload);
      }

      if (targetGroupId) {
        navigate(`/admin/questions/${targetGroupId}`);
      } else {
        navigate('/admin/questions');
      }
    } catch (err) {
      setError(getError(err, 'Gagal menyimpan soal.'));
    }
  };

  const previewSrc = formData.imageFile
    ? URL.createObjectURL(formData.imageFile)
    : formData.imageUrl
    ? getImageUrl(formData.imageUrl)
    : null;

  const backUrl = formData.questionGroupId
    ? `/admin/questions/${formData.questionGroupId}`
    : '/admin/questions';

  if (loading) return <p>Loading data...</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>{editing ? 'Edit Soal' : 'Buat Soal'}</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {editing ? 'Ubah data soal yang sudah ada.' : 'Tambah soal baru ke bank soal.'}
          </p>
        </div>
        <button
          className="btn"
          style={{ backgroundColor: '#e9ecef', color: '#495057' }}
          onClick={() => navigate(backUrl)}
        >
          ← Kembali
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleSubmit}>

            {/* Pertanyaan */}
            <div className="form-group">
              <label className="form-label">Pertanyaan *</label>
              <textarea
                className="form-control"
                rows={4}
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                required
                placeholder="Tulis pertanyaan di sini..."
              />
            </div>

            {/* Pilihan A-D */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {['A', 'B', 'C', 'D'].map((opt) => (
                <div className="form-group" key={opt}>
                  <label className="form-label">Pilihan {opt} *</label>
                  <input
                    className="form-control"
                    value={formData[`option${opt}`]}
                    onChange={(e) => setFormData({ ...formData, [`option${opt}`]: e.target.value })}
                    required
                    placeholder={`Isi pilihan ${opt}...`}
                  />
                </div>
              ))}
            </div>

            {/* Baris bawah: Jawaban Benar | Grup Soal | Gambar Soal */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
              {/* Jawaban Benar */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Jawaban Benar *</label>
                <select
                  className="form-control"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              {/* Grup Soal */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Grup Soal</label>
                <select
                  className="form-control"
                  value={formData.questionGroupId}
                  onChange={(e) => setFormData({ ...formData, questionGroupId: e.target.value })}
                >
                  <option value="">— Tanpa Grup —</option>
                  {groups.map((g) => (
                    <option key={g.id} value={String(g.id)}>
                      {g.name || g.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Gambar */}
              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ margin: 0 }}>Gambar Soal (opsional)</label>
                  {previewSrc && (
                    <span style={{ fontSize: '0.75rem', color: '#85C226', fontWeight: 600 }}>✓ Gambar ada</span>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  className="form-control"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFormData((f) => ({ ...f, imageFile: file }));
                  }}
                />
                {previewSrc && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <img
                      src={previewSrc}
                      alt="Thumbnail Preview"
                      style={{
                        width: '36px',
                        height: '36px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #ced4da',
                      }}
                    />
                    <small style={{ color: 'var(--text-muted)' }}>
                      {formData.imageFile ? `File baru: ${formData.imageFile.name}` : 'Gambar tersimpan'}
                    </small>
                  </div>
                )}
              </div>
            </div>

            {/* Status Aktif */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.25rem 0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Soal aktif
            </label>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary">
                {editing ? 'Simpan Perubahan' : 'Simpan Soal'}
              </button>
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: '#e9ecef', color: '#495057' }}
                onClick={() => navigate(backUrl)}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestion;
