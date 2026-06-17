import { useState, useEffect } from 'react';
import api from '../api/axios';
import './Dashboard.css';

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [elevators, setElevators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ elevatorId: '', serviceDate: '', nextServiceDate: '', remarks: '', technicianName: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [mntRes, elvRes] = await Promise.all([api.get('/maintenance'), api.get('/elevators')]);
      if (mntRes.data.success) setRecords(mntRes.data.data);
      if (elvRes.data.success) setElevators(elvRes.data.data);
    } catch (err) { console.error(err.message); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm({ elevatorId: '', serviceDate: '', nextServiceDate: '', remarks: '', technicianName: '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', form);
      setShowModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error adding maintenance record'); }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const getElevatorCode = (id) => elevators.find((e) => e.elevatorId === id)?.elevatorCode || id;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Maintenance Records</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Record</button>
      </div>

      <div className="table-container">
        {records.length === 0 ? (
          <div className="empty-state">No maintenance records found</div>
        ) : (
          <table>
            <thead><tr><th>ID</th><th>Elevator</th><th>Service Date</th><th>Next Service</th><th>Technician</th><th>Remarks</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.maintenanceId}>
                  <td>{r.maintenanceId}</td>
                  <td>{getElevatorCode(r.elevatorId)}</td>
                  <td>{r.serviceDate}</td>
                  <td>{r.nextServiceDate || '-'}</td>
                  <td>{r.technicianName || '-'}</td>
                  <td>{r.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Maintenance Record</h2>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div>
                <label>Elevator *</label>
                <select value={form.elevatorId} onChange={(e) => setForm({ ...form, elevatorId: e.target.value })} required>
                  <option value="">Select elevator</option>
                  {elevators.map((e) => <option key={e.elevatorId} value={e.elevatorId}>{e.elevatorCode} - {e.customerName || e.location}</option>)}
                </select>
              </div>
              <div><label>Service Date *</label><input type="date" value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} required /></div>
              <div><label>Next Service Date</label><input type="date" value={form.nextServiceDate} onChange={(e) => setForm({ ...form, nextServiceDate: e.target.value })} /></div>
              <div><label>Technician Name</label><input value={form.technicianName} onChange={(e) => setForm({ ...form, technicianName: e.target.value })} /></div>
              <div><label>Remarks</label><textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={3} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
