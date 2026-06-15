import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const MaintenancePage = () => {
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ elevatorId: '', serviceDate: '', nextServiceDate: '', remarks: '', technicianName: '' });

  const fetchHistory = async () => {
    const res = await axios.get(`${API_URL}/maintenance`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setHistory(res.data);
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/maintenance`, form, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    fetchHistory();
    alert('Maintenance record added');
  };

  return (
    <div className="card">
      <h3>Maintenance Records</h3>
      <form onSubmit={handleAdd} style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <input placeholder="Elevator ID" onChange={e => setForm({...form, elevatorId: e.target.value})} required />
        <input type="date" placeholder="Service Date" onChange={e => setForm({...form, serviceDate: e.target.value})} required />
        <input type="date" placeholder="Next Service Date" onChange={e => setForm({...form, nextServiceDate: e.target.value})} required />
        <input placeholder="Technician Name" onChange={e => setForm({...form, technicianName: e.target.value})} required />
        <textarea placeholder="Remarks" onChange={e => setForm({...form, remarks: e.target.value})} />
        <button type="submit" className="btn-primary">Add Record</button>
      </form>
      <table>
        <thead><tr><th>Elevator</th><th>Service Date</th><th>Technician</th><th>Remarks</th></tr></thead>
        <tbody>
          {history.map(h => (
            <tr key={h.maintenanceId}><td>{h.elevatorId}</td><td>{h.serviceDate}</td><td>{h.technicianName}</td><td>{h.remarks}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default MaintenancePage;
