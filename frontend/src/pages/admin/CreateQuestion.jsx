import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import questionService from '../../services/questionService';
import questionGroupService from '../../services/questionGroupService';
import { getImageUrl } from '../../services/api';
import Icon from '../../components/Icon';

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
  const { id } = useParams();
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
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  const fetchGroups = useCallback(async () => {
    try {
      const { data } = await questionGroupService.list();
      const list = Array.isArray(data) ? data : data.groups || data.items || [];
      setGroups(list);
    } catch {
      // groups non mandatory
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    if (!editing) return;
    questionService
      .get(id)
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
    setSaving(true);
    try {
      let imageUrl = formData.imageUrl;
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
      setSaving(false);
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

  const selectedGroupName =
    groups.find((g) => String(g.id) === String(formData.questionGroupId))?.name ||
    'UMUM / TANPA GRUP';

  // Toolbar formatting helpers
  const applyFormat = (prefix, suffix = prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = formData.questionText;
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || 'teks'}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setFormData((prev) => ({ ...prev, questionText: newText }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
        Memuat formulir soal...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div className="page-header-wrapper">
        <div>
          <h1 className="page-title">{editing ? 'Edit Soal' : 'Buat Soal'}</h1>
          <p className="page-subtitle">
            Tambah butir soal evaluasi baru ke bank soal uji kompetensi IMKP.
          </p>
        </div>

        <button className="btn btn-outline" onClick={() => navigate(backUrl)}>
          <Icon name="arrowLeft" size={16} />
          Kembali
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* ── Two-Column Layout (Formulir & Live Preview) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.25fr 0.75fr',
        gap: '1.75rem',
        alignItems: 'start'
      }}>
        {/* ── Left Column: Formulir Pembuatan Soal ── */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, letterSpacing: '0.04em', margin: 0, textTransform: 'uppercase', color: '#0F172A' }}>
              Formulir Pembuatan Soal
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#EF4444', fontWeight: 600 }}>
              * Kolom wajib diisi
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
            {/* Pertanyaan */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Pertanyaan *</label>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  {formData.questionText.length}/500 karakter
                </span>
              </div>

              {/* Rich text formatting toolbar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.65rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderBottom: 'none',
                borderRadius: '10px 10px 0 0'
              }}>
                <button
                  type="button"
                  className="btn btn-icon btn-outline btn-sm"
                  style={{ width: '28px', height: '28px', fontWeight: 700 }}
                  title="Tebal"
                  onClick={() => applyFormat('**')}
                >
                  B
                </button>
                <button
                  type="button"
                  className="btn btn-icon btn-outline btn-sm"
                  style={{ width: '28px', height: '28px', fontStyle: 'italic', fontFamily: 'serif' }}
                  title="Miring"
                  onClick={() => applyFormat('*')}
                >
                  I
                </button>
                <button
                  type="button"
                  className="btn btn-icon btn-outline btn-sm"
                  style={{ width: '28px', height: '28px', textDecoration: 'underline' }}
                  title="Garis Bawah"
                  onClick={() => applyFormat('<u>', '</u>')}
                >
                  U
                </button>
                <div style={{ width: '1px', height: '18px', backgroundColor: '#CBD5E1', margin: '0 0.25rem' }} />
                <button
                  type="button"
                  className="btn btn-icon btn-outline btn-sm"
                  style={{ width: '28px', height: '28px' }}
                  title="Daftar"
                  onClick={() => applyFormat('\n- ')}
                >
                  <Icon name="list" size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-icon btn-outline btn-sm"
                  style={{ width: '28px', height: '28px', fontSize: '0.75rem', fontWeight: 700 }}
                  title="Formula / Rumus"
                  onClick={() => applyFormat('$', '$')}
                >
                  √x
                </button>
                <button
                  type="button"
                  className="btn btn-icon btn-outline btn-sm"
                  style={{ width: '28px', height: '28px' }}
                  title="Kode"
                  onClick={() => applyFormat('`')}
                >
                  <Icon name="code" size={14} />
                </button>
              </div>

              <textarea
                ref={textareaRef}
                className="form-control"
                rows={4}
                style={{ borderRadius: '0 0 10px 10px', resize: 'vertical' }}
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                required
                maxLength={500}
                placeholder="Tulis pertanyaan di sini... Contoh: Apa prosedur operasional pertama saat mendeteksi indikasi kebocoran hidrokarbon pada tangki timbun?"
              />
            </div>

            {/* Pilihan Jawaban */}
            <div className="form-group">
              <label className="form-label">Pilihan Jawaban *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <div
                    key={opt}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      border: formData.correctAnswer === opt ? '1.5px solid #0066CB' : '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '0.2rem 0.35rem 0.2rem 0.75rem',
                      boxShadow: 'var(--shadow-xs)'
                    }}
                  >
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      color: formData.correctAnswer === opt ? '#0066CB' : '#64748B',
                      marginRight: '0.65rem'
                    }}>
                      {opt}
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      style={{ border: 'none', boxShadow: 'none', padding: '0.5rem 0.25rem' }}
                      value={formData[`option${opt}`]}
                      onChange={(e) => setFormData({ ...formData, [`option${opt}`]: e.target.value })}
                      required
                      placeholder={`Isi pilihan ${opt}...`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Dropdowns Baris Bawah */}
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr', gap: '1rem', alignItems: 'end', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">Jawaban Benar *</label>
                <select
                  className="form-select"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                >
                  <option value="A">Pilihan A</option>
                  <option value="B">Pilihan B</option>
                  <option value="C">Pilihan C</option>
                  <option value="D">Pilihan D</option>
                </select>
              </div>

              <div>
                <label className="form-label">Grup Soal</label>
                <select
                  className="form-select"
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

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ margin: 0 }}>Gambar Soal (opsional)</label>
                  {previewSrc && (
                    <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700 }}>✓ Gambar ada</span>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFormData((f) => ({ ...f, imageFile: file }));
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    padding: '0.62rem 0.85rem',
                    color: '#64748B',
                    fontSize: '0.82rem'
                  }}
                  onClick={() => fileRef.current?.click()}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon name="upload" size={15} />
                    {formData.imageFile ? 'Ganti Gambar...' : 'Upload Gam...'}
                  </span>
                  <span style={{
                    backgroundColor: '#F1F5F9',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    color: '#0F172A',
                    fontWeight: 600
                  }}>
                    Pilih File
                  </span>
                </button>
              </div>
            </div>

            {/* Toggle Status Aktif */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.85rem 1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              marginBottom: '1.75rem',
              cursor: 'pointer'
            }} onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
              <div className="switch-container">
                <div className={`switch-track ${formData.isActive ? 'active' : ''}`}>
                  <div className="switch-thumb" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>Soal Aktif</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Soal ini akan langsung tampil dalam paket ujian siswa IMKP
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Icon name="check" size={16} />
                {saving ? 'Menyimpan...' : (editing ? 'Simpan Perubahan' : 'Simpan Soal')}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(backUrl)}
              >
                Batal
              </button>
            </div>
          </form>
        </div>

        {/* ── Right Column: LIVE PREVIEW PESERTA ── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden'
        }}>
          {/* Header Preview */}
          <div style={{
            backgroundColor: '#0F172A',
            color: '#ffffff',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              LIVE PREVIEW PESERTA
            </div>
            <span style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '6px'
            }}>
              Soal #1
            </span>
          </div>

          <div style={{ padding: '1.25rem' }}>
            {/* Tag Grup & Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="badge badge-gray" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                {selectedGroupName}
              </span>
              <span className={`badge ${formData.isActive ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.72rem' }}>
                {formData.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>

            {/* Question Text */}
            <div style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: '#0F172A',
              lineHeight: 1.5,
              marginBottom: '1.25rem',
              minHeight: '48px'
            }}>
              {formData.questionText || 'Tulis pertanyaan di form sebelah kiri untuk melihat simulasi tampilan pada lembar tes digital...'}
            </div>

            {/* Image Preview if available */}
            {previewSrc && (
              <div style={{ marginBottom: '1.25rem', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <img
                  src={previewSrc}
                  alt="Preview Soal"
                  style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', backgroundColor: '#F8FAFC' }}
                />
              </div>
            )}

            {/* Pilihan A-D Simulation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
              {['A', 'B', 'C', 'D'].map((opt) => {
                const isCorrect = formData.correctAnswer === opt;
                const optText = formData[`option${opt}`];
                return (
                  <div
                    key={opt}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: isCorrect ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                      backgroundColor: isCorrect ? '#ECFDF5' : '#FFFFFF',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      backgroundColor: isCorrect ? '#10B981' : '#F1F5F9',
                      color: isCorrect ? '#FFFFFF' : '#475569'
                    }}>
                      {opt}
                    </div>
                    <span style={{
                      fontSize: '0.85rem',
                      color: isCorrect ? '#065F46' : (optText ? '#334155' : '#94A3B8'),
                      fontWeight: isCorrect ? 600 : 400
                    }}>
                      {optText || `Pilihan ${opt} belum diisi`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer Kunci Terpilih */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: '#EFF6FF',
              borderRadius: '10px',
              border: '1px solid #BFDBFE'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E40AF' }}>
                Kunci Terpilih:
              </span>
              <span className="badge badge-blue" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}>
                Pilihan {formData.correctAnswer}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestion;
