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
            <div className="login-logo">
              <img src="/Pertamina_Logo.svg" alt="Pertamina" />
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
