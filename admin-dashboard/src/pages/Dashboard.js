import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ElevatorsPage from './ElevatorsPage';
import RequestsPage from './RequestsPage';
import MaintenancePage from './MaintenancePage';
import AdminOverview from './AdminOverview';

const API_URL = 'http://localhost:5000/api';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/customers`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setCustomers(res.data);
      } catch(e) {}
    };
    fetch();
  }, []);
  return (
    <div className="card">
      <h3>Customers</h3>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
        <tbody>
          {customers.map(c => <tr key={c.customerId}><td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: '250px', background: '#132A13', color: 'white', padding: '20px' }}>
        <h2 style={{ color: '#90A955' }}>Argo App</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
          <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Overview</Link>
          <Link to="/dashboard/customers" style={{ color: 'white', textDecoration: 'none' }}>Customers</Link>
          <Link to="/dashboard/elevators" style={{ color: 'white', textDecoration: 'none' }}>Elevators</Link>
          <Link to="/dashboard/requests" style={{ color: 'white', textDecoration: 'none' }}>Service Requests</Link>
          <Link to="/dashboard/maintenance" style={{ color: 'white', textDecoration: 'none' }}>Maintenance</Link>
          <button onClick={handleLogout} style={{ marginTop: '20px', background: 'transparent', color: 'white', border: '1px solid white', padding: '8px', cursor: 'pointer' }}>Logout</button>
        </nav>
      </div>
      <div style={{ flex: 1, padding: '30px', backgroundColor: '#F8F9FA' }}>
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="elevators" element={<ElevatorsPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
        </Routes>
      </div>
    </div>
  );
};
export default Dashboard;
