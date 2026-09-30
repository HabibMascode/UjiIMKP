import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { logout } from '../services/authService';

const ParticipantLayout = () => {
  const name = localStorage.getItem('name') || 'Peserta';

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: '#f5f6fa' }}>
      <nav style={{
        background: '#0092DD',
        padding: '0 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#fff', margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/Pertamina_Logo.svg" alt="Pertamina" style={{ width: '150px', height: 'auto', display: 'block' }} />
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/peserta/dashboard" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '0.95rem' }}>Dashboard</Link>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Halo, {name}</span>
          <button onClick={handleLogout} style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            padding: '6px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease'
          }}>
            Logout
          </button>
        </div>
      </nav>
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default ParticipantLayout;
