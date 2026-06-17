import { useState, useEffect } from 'react';
import api from '../api/axios';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/dashboard');
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const cards = [
    { label: 'Total Customers', value: stats?.totalCustomers || 0, color: '#90A955' },
    { label: 'Total Elevators', value: stats?.totalElevators || 0, color: '#4F772D' },
    { label: 'Upcoming Maintenance', value: stats?.upcomingMaintenance || 0, color: '#F4A261' },
    { label: 'Pending Requests', value: stats?.pendingRequests || 0, color: '#E63946' },
  ];

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card" style={{ borderTopColor: card.color }}>
            <span className="stat-value">{card.value}</span>
            <span className="stat-label">{card.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
