import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ElevatorsPage = () => {
  const [elevators, setElevators] = useState([]);
  const [form, setForm] = useState({ elevatorCode: '', location: '', customerId: '', installationDate: '', warrantyExpiry: '', nextMaintenance: '', status: 'Active' });

  const fetchElevators = async () => {
    const res = await axios.get(`${API_URL}/elevators`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setElevators(res.data);
  };

  useEffect(() => { fetchElevators(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/elevators`, form, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchElevators();
      alert('Elevator added');
    } catch (err) { alert('Failed to add'); }
  };

  return (
    <div className="card">
      <h3>Elevator Management</h3>
      <form onSubmit={handleAdd} style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <input placeholder="Code" onChange={e => setForm({...form, elevatorCode: e.target.value})} required />
        <input placeholder="Location" onChange={e => setForm({...form, location: e.target.value})} required />
        <input placeholder="Customer ID" onChange={e => setForm({...form, customerId: e.target.value})} required />
        <input type="date" placeholder="Installation Date" onChange={e => setForm({...form, installationDate: e.target.value})} required />
        <input type="date" placeholder="Warranty Expiry" onChange={e => setForm({...form, warrantyExpiry: e.target.value})} required />
        <input type="date" placeholder="Next Maintenance" onChange={e => setForm({...form, nextMaintenance: e.target.value})} required />
        <button type="submit" className="btn-primary">Add Elevator</button>
      </form>
      <table>
        <thead><tr><th>Code</th><th>Location</th><th>Status</th><th>Next Maintenance</th></tr></thead>
        <tbody>
          {elevators.map(e => (
            <tr key={e.elevatorId}><td>{e.elevatorCode}</td><td>{e.location}</td><td>{e.status}</td><td>{e.nextMaintenance}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ElevatorsPage;
