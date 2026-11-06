import { Outlet, Link } from 'react-router-dom';
import { logout } from '../services/authService';
import Icon from '../components/Icon';

const ParticipantLayout = () => {
  const name = localStorage.getItem('name') || 'Peserta Ujian';

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'PS';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      {/* ── Topbar Peserta ── */}
      <header style={{
        backgroundColor: '#0066CB',
        color: '#ffffff',
        height: '70px',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 14px rgba(0, 102, 203, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.12)',
            flexShrink: 0
          }}>
            <img
              src="/pertamina_logo_stacked.jpg"
              alt="Pertamina"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1.15rem',
              letterSpacing: '0.04em',
              lineHeight: 1.15,
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              PERTAMINA
            </span>
            <span style={{
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 500,
              lineHeight: 1.2,
              marginTop: '1px'
            }}>
              Portal Ujian IMKP
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              color: '#0066CB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.72rem'
            }}>
              {initials}
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
              {name}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.85)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
          >
            <Icon name="logout" size={15} />
            Keluar
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, padding: '2.5rem 2rem', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer style={{
        padding: '1.25rem 2rem',
        borderTop: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: '#64748B',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          © 2026 PT Pertamina (Persero). Seluruh hak cipta dilindungi undang-undang.
        </div>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <span>Panduan Ujian</span>
          <span>•</span>
          <span>Bantuan Teknis IMKP</span>
        </div>
      </footer>
    </div>
  );
};

export default ParticipantLayout;
