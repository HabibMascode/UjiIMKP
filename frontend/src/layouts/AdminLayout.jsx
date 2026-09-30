import { Outlet, Link, useLocation } from 'react-router-dom';
import { logout } from '../services/authService';
import Icon from '../components/Icon';

const AdminLayout = () => {
  const location = useLocation();
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/users', label: 'Manajemen User', icon: 'users' },
    { path: '/admin/questions', label: 'Bank Soal', icon: 'question' },
    { path: '/admin/questions/create', label: 'Buat Soal', icon: 'plus' },
    { path: '/admin/results', label: 'Hasil Ujian', icon: 'chart' },
  ];

  const isActive = (path) => {
    if (path === '/admin/questions') {
      return location.pathname === path ||
        (location.pathname.startsWith(`${path}/`) && !location.pathname.startsWith('/admin/questions/create'));
    }

    return location.pathname === path;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        backgroundColor: 'var(--sidebar-bg)',
        color: 'var(--sidebar-text)',
        padding: '1rem 0.85rem',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        <div style={{
          minHeight: '78px',
          padding: '1rem',
          backgroundColor: '#fff',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 5px 14px rgba(0, 0, 0, 0.08)'
        }}>
          <img src="/Pertamina_Logo.svg" alt="Pertamina" style={{ width: '175px', height: 'auto', display: 'block' }} />
        </div>

        <nav style={{ padding: '2rem 0.35rem 1rem', flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0 0.75rem 0.75rem',
            color: 'rgba(255, 255, 255, 0.72)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase'
          }}>
            <span>Menu</span>
            <span style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.4)', flex: 1 }} />
          </div>
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}
              style={{
                color: isActive(item.path) ? 'var(--sidebar-bg)' : 'var(--sidebar-text)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '0.8rem 0.9rem',
                marginBottom: '0.35rem',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontWeight: isActive(item.path) ? 600 : 500,
                backgroundColor: isActive(item.path) ? '#f1f3f5' : 'transparent',
                boxShadow: isActive(item.path) ? '0 4px 10px rgba(0, 0, 0, 0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                color: isActive(item.path) ? 'var(--sidebar-bg)' : 'rgba(255, 255, 255, 0.82)'
              }}>
                <Icon name={item.icon} size={19} strokeWidth={isActive(item.path) ? 2.2 : 1.8} />
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1rem 0.35rem 0.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.28)' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}
            style={{
              color: 'rgba(255, 255, 255, 0.88)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px',
              padding: '0.8rem 0.9rem', borderRadius: '10px', fontSize: '0.92rem', fontWeight: 500
            }}>
            <span style={{ display: 'inline-flex', width: '24px', justifyContent: 'center' }}><Icon name="logout" size={19} /></span>
            Logout
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, backgroundColor: '#f5f6fa', overflow: 'auto' }}>
        <div style={{ padding: '2rem' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
