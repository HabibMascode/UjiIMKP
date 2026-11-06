import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Icon from '../../components/Icon';

const ExamResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  const handleDelete = async (examId, participantName) => {
    if (deleteConfirm !== examId) {
      setDeleteConfirm(examId);
      return;
    }
    try {
      await api.delete(`/results/${examId}`);
      setResults((prev) => prev.filter((r) => (r.examId || r.id) !== examId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Gagal menghapus hasil ujian:', err);
      alert('Gagal menghapus hasil ujian. Silakan coba lagi.');
      setDeleteConfirm(null);
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get('/results');
      setResults(response.data);
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const getItemDate = (item) => {
    return (
      item.finishedAt ||
      item.FinishedAt ||
      item.finished_at ||
      item.startedAt ||
      item.StartedAt ||
      item.started_at ||
      item.createdAt ||
      item.CreatedAt ||
      item.created_at ||
      null
    );
  };

  // Filtered results
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const matchName =
        !nameFilter ||
        (item.participantName &&
          item.participantName.toLowerCase().includes(nameFilter.toLowerCase()));

      let matchDate = true;
      if (dateFilter) {
        const rawDate = getItemDate(item);
        if (!rawDate) {
          matchDate = false;
        } else {
          const d = new Date(rawDate);
          if (isNaN(d.getTime())) {
            matchDate = false;
          } else {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const localDateStr = `${year}-${month}-${day}`;
            matchDate = localDateStr === dateFilter;
          }
        }
      }

      return matchName && matchDate;
    });
  }, [results, nameFilter, dateFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    if (!results || results.length === 0) {
      return { total: 0, average: 0, passRate: 0, maxScore: 0 };
    }
    const total = results.length;
    const sum = results.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const average = (sum / total).toFixed(2);
    const passed = results.filter((r) => (r.score || 0) >= 70).length;
    const passRate = ((passed / total) * 100).toFixed(1);
    const maxScore = Math.max(...results.map((r) => r.score || 0));

    return { total, average, passRate, maxScore };
  }, [results]);

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  // Export functions
  const handleExportExcel = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['No', 'Nama Peserta', 'Total Soal', 'Benar', 'Salah', 'Nilai', 'Status', 'Tanggal'],
        ...filteredResults.map((r, i) => [
          i + 1,
          `"${r.participantName}"`,
          r.totalQuestions,
          r.correctAnswers,
          r.wrongAnswers,
          r.score,
          r.score >= 70 ? 'Lulus' : 'Tidak Lulus',
          `"${formatDate(getItemDate(r))}"`,
        ]),
      ]
        .map((e) => e.join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_hasil_ujian_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const isFilterActive = Boolean(nameFilter || dateFilter);

  const resetFilter = () => {
    setNameFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div className="page-header-wrapper">
        <div>
          <h1 className="page-title">Hasil Ujian Peserta</h1>
          <p className="page-subtitle">
            Daftar rekapitulasi nilai, statistik kelulusan, dan riwayat pengerjaan ujian sertifikasi IMKP.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-outline-success"
            onClick={handleExportExcel}
            style={{ fontWeight: 600 }}
          >
            <Icon name="fileSpreadsheet" size={16} />
            Export Excel
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={handlePrintPdf}
            style={{ fontWeight: 600 }}
          >
            <Icon name="printer" size={16} />
            Cetak PDF
          </button>
        </div>
      </div>

      {/* ── 4 KPI Summary Cards ── */}
      <div className="stats-grid-4">
        {/* Total Ujian */}
        <div className="card" style={{ padding: '1.25rem 1.4rem', margin: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div className="modern-stat-icon icon-blue">
              <Icon name="fileText" size={20} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                TOTAL UJIAN SELESAI
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '0.35rem', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{stats.total}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>sesi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rata-Rata Nilai */}
        <div className="card" style={{ padding: '1.25rem 1.4rem', margin: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div className="modern-stat-icon icon-amber">
              <Icon name="trendingUp" size={20} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                RATA-RATA NILAI
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '0.35rem', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#D97706', lineHeight: 1 }}>{stats.average}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tingkat Kelulusan */}
        <div className="card" style={{ padding: '1.25rem 1.4rem', margin: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div className="modern-stat-icon icon-green">
              <Icon name="checkCircle" size={20} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                TINGKAT KELULUSAN
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '0.35rem', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#059669', lineHeight: 1 }}>{stats.passRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nilai Tertinggi */}
        <div className="card" style={{ padding: '1.25rem 1.4rem', margin: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div className="modern-stat-icon icon-red">
              <Icon name="award" size={20} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                NILAI TERTINGGI
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '0.35rem', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0066CB', lineHeight: 1 }}>{stats.maxScore}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>skor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter & Search Panel ── */}
      <div className="filter-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
            <Icon name="filter" size={17} style={{ color: '#0066CB' }} />
            Filter & Pencarian
          </div>
          <span style={{ fontSize: '0.78rem', color: isFilterActive ? '#0066CB' : '#94A3B8', fontWeight: isFilterActive ? 600 : 400 }}>
            {isFilterActive ? 'Filter aktif diterapkan' : 'Belum ada filter aktif'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
              Nama Peserta
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                display: 'flex'
              }}>
                <Icon name="search" size={16} />
              </span>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="Cari nama peserta..."
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
              Tanggal Ujian
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                className="form-control"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div>
            <button
              className="btn btn-outline"
              style={{ padding: '0.65rem 1rem' }}
              onClick={resetFilter}
              disabled={!isFilterActive}
            >
              <Icon name="x" size={15} />
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* ── Table Card: Rekap Nilai ── */}
      <div className="modern-table-card">
        <div style={{
          padding: '1.25rem 1.4rem',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#0F172A' }}>Rekap Nilai</h3>
            <span className="badge badge-blue">
              {filteredResults.length} dari {results.length} data
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Format: Standar Kelulusan IMKP (≥ 70)
          </div>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>NO</th>
                <th>NAMA PESERTA</th>
                <th style={{ textAlign: 'center' }}>TOTAL SOAL</th>
                <th style={{ textAlign: 'center' }}>BENAR</th>
                <th style={{ textAlign: 'center' }}>SALAH</th>
                <th style={{ textAlign: 'center' }}>NILAI</th>
                <th>TANGGAL</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                    Memuat hasil ujian...
                  </td>
                </tr>
              ) : paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                    Tidak ada data hasil ujian yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedResults.map((item, idx) => {
                  const globalIdx = startIndex + idx + 1;
                  const isPassed = item.score >= 70;
                  const itemExamId = item.examId || item.id;
                  const rawDate = getItemDate(item);

                  return (
                    <tr key={itemExamId || idx}>
                      <td style={{ color: '#64748B', fontWeight: 600 }}>{globalIdx}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="avatar-chip">
                            {getInitials(item.participantName)}
                          </div>
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>
                            {item.participantName}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                        {item.totalQuestions}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#059669' }}>
                        {item.correctAnswers}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#DC2626' }}>
                        {item.wrongAnswers}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          backgroundColor: isPassed ? '#ECFDF5' : (item.score > 0 ? '#FFFBEB' : '#FEF2F2'),
                          color: isPassed ? '#059669' : (item.score > 0 ? '#D97706' : '#DC2626'),
                        }}>
                          {item.score}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 500 }}>
                        {formatDate(rawDate)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.35rem 0.85rem' }}
                            onClick={() => navigate(`/admin/results/${itemExamId}`)}
                          >
                            Detail
                          </button>
                          <button
                            className="btn btn-sm"
                            title={deleteConfirm === itemExamId ? 'Klik lagi untuk konfirmasi hapus' : 'Hapus hasil ujian'}
                            style={{
                              padding: '0.35rem 0.5rem',
                              backgroundColor: deleteConfirm === itemExamId ? '#DC2626' : '#FEF2F2',
                              color: deleteConfirm === itemExamId ? '#fff' : '#DC2626',
                              border: `1px solid ${deleteConfirm === itemExamId ? '#DC2626' : '#FECACA'}`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onClick={() => handleDelete(itemExamId, item.participantName)}
                            onMouseLeave={() => { if (deleteConfirm === itemExamId) setDeleteConfirm(null); }}
                          >
                            <Icon name="trash" size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Modern Pagination ── */}
        <div className="pagination-wrap">
          <span className="pagination-info">
            Menampilkan {paginatedResults.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredResults.length)} dari {filteredResults.length} data
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </button>
            <div style={{ padding: '0 0.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
              {currentPage} / {totalPages}
            </div>
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
