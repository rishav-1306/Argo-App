import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await axios.get(`${API_URL}/service-requests`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setRequests(res.data);
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id, status) => {
    await axios.put(`${API_URL}/service-requests/${id}`, { status }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    fetchRequests();
  };

  return (
    <div className="card">
      <h3>Service Requests</h3>
      <table>
        <thead><tr><th>Request ID</th><th>Elevator</th><th>Issue</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.requestId}>
              <td>{r.requestId}</td><td>{r.elevatorId}</td><td>{r.issue}</td><td>{r.status}</td>
              <td>
                <button onClick={() => updateStatus(r.requestId, 'In Progress')}>In Progress</button>
                <button onClick={() => updateStatus(r.requestId, 'Completed')}>Complete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestsPage;
