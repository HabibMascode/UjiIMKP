import { useState } from 'react';
import { login } from '../services/authService';
import Icon from '../components/Icon';
import './Login.css';

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(usernameOrEmail, password);
      window.location.href = data.role === 'Admin' ? '/admin/dashboard' : '/peserta/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Login gagal. Periksa kembali kredensial Anda.');
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-banner">
        {/* Background Image Layer */}
        <div className="banner-image"></div>
        
        {/* iOS Style Glass Overlay */}
        <div className="glass-overlay"></div>
        
        {/* Background Ornaments (Glowing orbs) */}
        <div className="ornament-container">
          <div className="ornament circle-1"></div>
          <div className="ornament circle-2"></div>
        </div>
      </div>

      <div className="login-form-container">
        <div className="login-card">
          <div className="login-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.75rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0, 102, 203, 0.12)',
                border: '1px solid #E2E8F0',
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
                  color: '#0066CB',
                  fontWeight: 900,
                  fontSize: '1.22rem',
                  letterSpacing: '0.04em',
                  lineHeight: 1.15,
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}>
                  PERTAMINA
                </span>
                <span style={{
                  color: '#64748B',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  marginTop: '2px'
                }}>
                  Portal Ujian IMKP
                </span>
              </div>
            </div>
            <h2 className="login-title">Selamat Datang</h2>
            <p className="login-subtitle">Silakan masuk dengan akun Anda</p>
          </div>

          {error && (
            <div className="login-error">
              <Icon name="alertCircle" size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username atau Email</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="form-control"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Masukkan username atau email"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingRight: '2.8rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="password-toggle"
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={20} />
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary login-btn" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk ke Sistem'}
            </button>
          </form>
          
          <div className="login-footer">
            <p>&copy; {new Date().getFullYear()} PT Pertamina (Persero). All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
