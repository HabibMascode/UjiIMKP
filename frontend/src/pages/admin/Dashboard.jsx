import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Icon from '../../components/Icon';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalGroups: 0, totalExams: 0 });
  const name = localStorage.getItem('name') || 'Admin';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, questionsRes, resultsRes] = await Promise.all([
          api.get('/users'),
          api.get('/question-groups'),
          api.get('/results'),
        ]);
        setStats({
          totalUsers: usersRes.data.filter(u => u.role === 'Peserta').length,
          totalGroups: Array.isArray(questionsRes.data) ? questionsRes.data.length : (questionsRes.data.groups || []).length,
          totalExams: resultsRes.data.length,
        });
      } catch (err) {
        console.error('Gagal memuat statistik:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">Ringkasan sistem</span>
          <h2>Selamat datang, {name}</h2>
          <p>Berikut ringkasan data sistem Uji IMKP.</p>
        </div>
        <div className="dashboard-date">Panel admin</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card-blue" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-top">
            <span className="stat-title">Total Peserta</span>
            <span className="stat-icon"><Icon name="users" size={19} /></span>
          </div>
          <span className="stat-value">{stats.totalUsers}</span>
          <span className="stat-link">Lihat peserta <Icon name="next" size={14} /></span>
        </div>
        <div className="stat-card stat-card-green" onClick={() => navigate('/admin/questions')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-top">
            <span className="stat-title">Total Grup Soal</span>
            <span className="stat-icon"><Icon name="question" size={19} /></span>
          </div>
          <span className="stat-value">{stats.totalGroups}</span>
          <span className="stat-link">Kelola grup <Icon name="next" size={14} /></span>
        </div>
        <div className="stat-card stat-card-red" onClick={() => navigate('/admin/results')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-top">
            <span className="stat-title">Ujian Selesai</span>
            <span className="stat-icon"><Icon name="chart" size={19} /></span>
          </div>
          <span className="stat-value">{stats.totalExams}</span>
          <span className="stat-link">Lihat hasil <Icon name="next" size={14} /></span>
        </div>
        <div className="stat-card stat-card-green" onClick={() => navigate('/admin/questions')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-top">
            <span className="stat-title">Kelola Pertanyaan</span>
            <span className="stat-icon"><Icon name="plus" size={19} /></span>
          </div>
          <span className="stat-value stat-value-text">Buka</span>
          <span className="stat-link">Buka bank soal <Icon name="next" size={14} /></span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
