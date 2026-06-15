import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AdminOverview = () => {
  const [stats, setStats] = useState({ customers: 0, elevators: 0, requests: 0 });

  useEffect(() => {
    const fetch = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        const [c, e, r] = await Promise.all([
          axios.get(`${API_URL}/customers`, config),
          axios.get(`${API_URL}/elevators`, config),
          axios.get(`${API_URL}/service-requests`, config)
        ]);
        setStats({ customers: c.data.length, elevators: e.data.length, requests: r.data.length });
      } catch (err) {}
    };
    fetch();
  }, []);

  return (
    <div>
      <h3>Admin Overview</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div className="card" style={{ borderLeft: '5px solid #90A955' }}>
          <h4>Total Customers</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.customers}</p>
        </div>
        <div className="card" style={{ borderLeft: '5px solid #132A13' }}>
          <h4>Total Elevators</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.elevators}</p>
        </div>
        <div className="card" style={{ borderLeft: '5px solid #4F772D' }}>
          <h4>Pending Requests</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.requests}</p>
        </div>
      </div>
    </div>
  );
};
export default AdminOverview;
