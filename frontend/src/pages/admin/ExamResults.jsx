import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

/* ── inline styles untuk filter panel ── */
const S = {
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  filterPanel: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,146,221,0.08)',
    border: '1px solid #e9ecef',
    marginBottom: '1.25rem',
    overflow: 'hidden',
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.4rem',
    borderBottom: '1px solid #f0f0f0',
    background: 'linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)',
  },
  filterTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#2b2d42',
  },
  filterBody: {
    padding: '1.25rem 1.4rem',
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    flex: '1',
    minWidth: '200px',
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '0.8rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#adb5bd',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '0.6rem 1rem 0.6rem 2.4rem',
    fontSize: '0.9rem',
    border: '1.5px solid #e9ecef',
    borderRadius: '8px',
    outline: 'none',
    color: '#333',
    background: '#fafafa',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    fontFamily: 'Inter, sans-serif',
  },
  clearBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.58rem 1.1rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    border: '1.5px solid #e9ecef',
    borderRadius: '8px',
    background: '#fff',
    color: '#6c757d',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    alignSelf: 'flex-end',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.25rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: 'rgba(0,146,221,0.1)',
    color: '#0092DD',
    border: '1px solid rgba(0,146,221,0.2)',
  },
  badgeX: {
    cursor: 'pointer',
    opacity: 0.7,
    fontWeight: 700,
    marginLeft: '0.15rem',
    lineHeight: 1,
  },
  tableHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  countBadge: {
    fontSize: '0.8rem',
    fontWeight: 600,
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    background: 'rgba(0,146,221,0.1)',
    color: '#0092DD',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.75rem',
  },
};

/* ── Icon helpers (inline SVG) ── */
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ExamResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [nameFocus, setNameFocus] = useState(false);
  const [dateFocus, setDateFocus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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

  const filteredResults = results.filter(r => {
    const matchName = r.participantName?.toLowerCase().includes(filterName.toLowerCase()) ?? false;
    let matchDate = true;
    if (filterDate) {
      if (r.finishedAt) {
        const rDate = new Date(r.finishedAt).toISOString().split('T')[0];
        matchDate = rDate === filterDate;
      } else {
        matchDate = false;
      }
    }
    return matchName && matchDate;
  });

  // Pagination logic
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [filteredResults.length, currentPage, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);

  const hasFilter = filterName !== '' || filterDate !== '';
  const clearAll = () => { 
    setFilterName(''); 
    setFilterDate(''); 
    setCurrentPage(1);
  };

  const inputStyle = (focused) => ({
    ...S.input,
    borderColor: focused ? '#0092DD' : '#e9ecef',
    boxShadow: focused ? '0 0 0 3px rgba(0,146,221,0.12)' : 'none',
    background: focused ? '#fff' : '#fafafa',
  });

  const formatDateID = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      {/* Page Header */}
      <div style={S.pageHeader}>
        <h2 style={{ margin: 0 }}>Hasil Ujian Peserta</h2>
      </div>

      {/* ── Filter Panel ── */}
      <div style={S.filterPanel}>
        {/* Filter Header */}
        <div style={S.filterHeader}>
          <span style={S.filterTitle}>
            <span style={{ color: '#0092DD' }}><IconFilter /></span>
            Filter &amp; Pencarian
          </span>
          {/* Active filter badges */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {filterName && (
              <span style={S.badge}>
                <IconSearch /> {filterName}
                <span style={S.badgeX} onClick={() => setFilterName('')} title="Hapus filter nama">×</span>
              </span>
            )}
            {filterDate && (
              <span style={S.badge}>
                <IconCalendar /> {new Date(filterDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                <span style={S.badgeX} onClick={() => setFilterDate('')} title="Hapus filter tanggal">×</span>
              </span>
            )}
            {!hasFilter && (
              <span style={{ fontSize: '0.78rem', color: '#adb5bd', fontStyle: 'italic' }}>Belum ada filter aktif</span>
            )}
          </div>
        </div>

        {/* Filter Inputs */}
        <div style={S.filterBody}>
          {/* Nama */}
          <div style={S.fieldGroup}>
            <label style={S.label}>Nama Peserta</label>
            <div style={S.inputWrapper}>
              <span style={S.inputIcon}><IconSearch /></span>
              <input
                type="text"
                placeholder="Cari nama peserta..."
                value={filterName}
                onChange={(e) => {
                  setFilterName(e.target.value);
                  setCurrentPage(1);
                }}
                onFocus={() => setNameFocus(true)}
                onBlur={() => setNameFocus(false)}
                style={inputStyle(nameFocus)}
              />
            </div>
          </div>

          {/* Tanggal */}
          <div style={S.fieldGroup}>
            <label style={S.label}>Tanggal Ujian</label>
            <div style={S.inputWrapper}>
              <span style={S.inputIcon}><IconCalendar /></span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setCurrentPage(1);
                }}
                onFocus={() => setDateFocus(true)}
                onBlur={() => setDateFocus(false)}
                style={inputStyle(dateFocus)}
              />
            </div>
          </div>

          {/* Clear Button */}
          <button
            style={{
              ...S.clearBtn,
              opacity: hasFilter ? 1 : 0.45,
              cursor: hasFilter ? 'pointer' : 'not-allowed',
              borderColor: hasFilter ? '#DA251C' : '#e9ecef',
              color: hasFilter ? '#DA251C' : '#6c757d',
            }}
            onClick={clearAll}
            disabled={!hasFilter}
            title="Hapus semua filter"
          >
            <IconX />
            Reset Filter
          </button>
        </div>
      </div>

      {/* ── Results Table ── */}
      <div className="card">
        <div className="card-header">
          <div style={S.tableHeaderRow}>
            <h4 style={{ margin: 0 }}>Rekap Nilai</h4>
            <span style={S.countBadge}>
              {filteredResults.length} dari {results.length} data
            </span>
          </div>
        </div>
        <div className="card-body" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat data...</p>
          ) : filteredResults.length === 0 ? (
            <div style={S.emptyBox}>
              <div style={S.emptyIcon}>🔍</div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Tidak ada hasil yang cocok</p>
              <p style={{ color: '#adb5bd', fontSize: '0.875rem' }}>
                {hasFilter ? 'Coba ubah atau reset filter pencarian.' : 'Belum ada peserta yang menyelesaikan ujian.'}
              </p>
              {hasFilter && (
                <button
                  onClick={clearAll}
                  style={{ ...S.clearBtn, marginTop: '1rem', borderColor: '#0092DD', color: '#0092DD' }}
                >
                  <IconX /> Reset Filter
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table" style={{ marginBottom: 0 }}>
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
                    {paginatedResults.map((r, idx) => (
                      <tr key={r.examId}>
                        <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{startIndex + idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{r.participantName}</td>
                        <td>{r.totalQuestions}</td>
                        <td>
                          <span style={{
                            display: 'inline-block', padding: '0.2rem 0.6rem',
                            borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600,
                            background: 'rgba(133,194,38,0.12)', color: '#85C226',
                          }}>{r.correctAnswers}</span>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block', padding: '0.2rem 0.6rem',
                            borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600,
                            background: 'rgba(218,37,28,0.1)', color: '#DA251C',
                          }}>{r.wrongAnswers}</span>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '44px', height: '44px', borderRadius: '50%',
                            background: r.score >= 70 ? 'rgba(133,194,38,0.12)' : 'rgba(218,37,28,0.1)',
                            color: r.score >= 70 ? '#85C226' : '#DA251C',
                            fontWeight: 700, fontSize: '0.95rem',
                          }}>{r.score}</span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          {formatDateID(r.finishedAt)}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.3rem 0.8rem', fontSize: '0.82rem', borderRadius: '6px' }}
                            onClick={() => navigate(`/admin/results/${r.examId}`)}
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1rem 1.5rem', 
                  borderTop: '1px solid #e9ecef',
                  background: '#fafafa',
                  borderBottomLeftRadius: '0.5rem',
                  borderBottomRightRadius: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 500 }}>
                    Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredResults.length)} dari {filteredResults.length} data
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      style={{ 
                        ...S.clearBtn, 
                        padding: '0.4rem 0.8rem',
                        opacity: currentPage === 1 ? 0.5 : 1,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>
                      {currentPage} / {totalPages}
                    </div>
                    <button 
                      style={{ 
                        ...S.clearBtn, 
                        padding: '0.4rem 0.8rem',
                        opacity: currentPage === totalPages ? 0.5 : 1,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                      }}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
