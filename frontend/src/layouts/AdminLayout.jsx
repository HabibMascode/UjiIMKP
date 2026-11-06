import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import api from '../services/api';
import Icon from '../components/Icon';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Administrator HSE';
  const email = localStorage.getItem('email') || 'hse.pertamina@pertamina.com';
  const [counts, setCounts] = useState({ users: 0, groups: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [usersRes, groupsRes] = await Promise.allSettled([
          api.get('/users'),
          api.get('/question-groups'),
        ]);
        const userCount = usersRes.status === 'fulfilled' ? usersRes.value.data.length : 8;
        const groupsData = groupsRes.status === 'fulfilled' ? groupsRes.value.data : [];
        const groupCount = Array.isArray(groupsData) ? groupsData.length : (groupsData.groups?.length || 8);
        setCounts({ users: userCount, groups: groupCount });
      } catch {
        // Fallback default numbers if offline
      }
    };
    fetchCounts();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/users', label: 'Manajemen User', icon: 'users', badge: counts.users || null },
    { path: '/admin/questions', label: 'Bank Soal', icon: 'question', badge: counts.groups || null },
    { path: '/admin/questions/create', label: 'Buat Soal', icon: 'plus' },
    { path: '/admin/results', label: 'Hasil Ujian', icon: 'chart', hasDot: true },
  ];

  const isActive = (path) => {
    if (path === '/admin/questions') {
      return location.pathname === path ||
        (location.pathname.startsWith(`${path}/`) && !location.pathname.startsWith('/admin/questions/create'));
    }
    return location.pathname === path;
  };

  // Generate dynamic breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return ['Portal', 'Manajemen User', 'Daftar Pengguna'];
    if (path.includes('/admin/questions/create')) return ['Portal', 'Bank Soal', 'Buat Soal'];
    if (path.includes('/admin/questions/') && path.includes('/edit')) return ['Portal', 'Bank Soal', 'Edit Soal'];
    if (path.includes('/admin/questions/')) return ['Portal', 'Bank Soal', 'Detail Grup Soal'];
    if (path.includes('/admin/questions')) return ['Portal', 'Bank Soal', 'Daftar Grup'];
    if (path.includes('/admin/results/')) return ['Portal', 'Hasil Ujian', 'Detail Peserta'];
    if (path.includes('/admin/results')) return ['Portal', 'Hasil Ujian', 'Rekap Nilai'];
    return ['Portal', 'Dashboard', 'Ringkasan Sistem'];
  };

  const breadcrumbs = getBreadcrumbs();
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'AD';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* ── Left Sidebar ── */}
      <aside style={{
        width: '272px',
        backgroundColor: '#0066CB',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50,
        boxShadow: '4px 0 20px rgba(0, 102, 203, 0.15)'
      }}>
        {/* Brand Logo Header */}
        <div style={{ padding: '1.5rem 1.25rem 1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}>
            {/* White Squircle Box with Logo */}
            <div style={{
              width: '58px',
              height: '58px',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.14)',
              flexShrink: 0
            }}>
              <img
                src="/pertamina_logo_stacked.jpg"
                alt="Pertamina"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Typography on Blue Background */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '1.25rem',
                letterSpacing: '0.04em',
                lineHeight: 1.15,
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}>
                PERTAMINA
              </span>
              <span style={{
                color: '#ffffff',
                fontSize: '0.94rem',
                fontWeight: 500,
                lineHeight: 1.2,
                marginTop: '3px',
                letterSpacing: '-0.01em'
              }}>
                Portal Ujian IMKP
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, padding: '1.25rem 0.95rem', overflowY: 'auto' }}>
          <div style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            padding: '0 0.75rem 0.85rem'
          }}>
            Menu Utama
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.95rem',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontSize: '0.88rem',
                    fontWeight: active ? 700 : 500,
                    color: active ? '#0066CB' : '#ffffff',
                    backgroundColor: active ? '#ffffff' : 'transparent',
                    boxShadow: active ? '0 4px 14px rgba(0, 0, 0, 0.12)' : 'none',
                    transition: 'all 0.18s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: active ? '#0066CB' : 'rgba(255, 255, 255, 0.9)'
                    }}>
                      <Icon name={item.icon} size={18} strokeWidth={active ? 2.2 : 1.9} />
                    </span>
                    <span>{item.label}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.badge != null && !active && (
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        minWidth: '20px',
                        textAlign: 'center'
                      }}>
                        {item.badge}
                      </span>
                    )}
                    {item.hasDot && !active && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        display: 'inline-block'
                      }} />
                    )}
                    {active && (
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#0066CB',
                        display: 'inline-block'
                      }} />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Logout Box */}
        <div style={{ padding: '1rem 0.95rem 1.25rem' }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.16)',
            borderRadius: '12px',
            padding: '0.75rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '0.65rem'
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              color: '#0066CB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.78rem',
              flexShrink: 0
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}>
                {name}
              </div>
              <div style={{
                color: 'rgba(255, 255, 255, 0.72)',
                fontSize: '0.7rem',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}>
                {email}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              padding: '0.65rem 0.85rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.85)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
            }}
          >
            <Icon name="logout" size={16} />
            Logout Sistem
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header / Breadcrumb Bar */}
        <header style={{
          height: '62px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          {/* Breadcrumb Path */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.83rem' }}>
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  color: idx === breadcrumbs.length - 1 ? '#0066CB' : '#64748B',
                  fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400
                }}>
                  {crumb}
                </span>
                {idx < breadcrumbs.length - 1 && (
                  <span style={{ color: '#CBD5E1', fontSize: '0.75rem' }}>›</span>
                )}
              </span>
            ))}
          </div>

          {/* Right Header Items (Profile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: '#F1F5F9'
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#0066CB',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.7rem'
              }}>
                {initials}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                {name.split(' ')[0]} HSE
              </span>
            </div>
          </div>
        </header>

        {/* Page Inner Content */}
        <main style={{ flex: 1, padding: '2rem 2.25rem' }}>
          <Outlet />
        </main>

        {/* Standard System Footer */}
        <footer style={{
          padding: '1.25rem 2.25rem',
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
            <span style={{ cursor: 'pointer', color: '#64748B' }}>Panduan Sistem</span>
            <span>•</span>
            <span style={{ cursor: 'pointer', color: '#64748B' }}>Kebijakan Privasi</span>
            <span>•</span>
            <span style={{ cursor: 'pointer', color: '#64748B' }}>Bantuan IT</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
