import { useState, useEffect } from 'react';
import api from '../api/axios';
import './Dashboard.css';

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/service-requests');
      if (data.success) setRequests(data.data);
    } catch (err) { console.error(err.message); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/service-requests/${id}/status`, { status });
      fetchRequests();
    } catch (err) { alert('Error updating status'); }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'In Progress': return 'badge-progress';
      case 'Completed': return 'badge-completed';
      default: return '';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Service Requests</h1>
      </div>

      <div className="table-container">
        {requests.length === 0 ? (
          <div className="empty-state">No service requests found</div>
        ) : (
          <table>
            <thead><tr><th>Request ID</th><th>Customer</th><th>Elevator</th><th>Issue</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.requestId}>
                  <td>{r.requestId}</td>
                  <td>{r.customerId}</td>
                  <td>{r.elevatorId}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.issue}</td>
                  <td><span className={`badge ${getBadgeClass(r.status)}`}>{r.status}</span></td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r.requestId, e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
