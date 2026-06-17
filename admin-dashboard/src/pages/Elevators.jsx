import { useState, useEffect } from 'react';
import api from '../api/axios';
import './Dashboard.css';

export default function Elevators() {
  const [elevators, setElevators] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ customerId: '', elevatorCode: '', location: '', installationDate: '', warrantyExpiry: '', nextMaintenance: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [elvRes, custRes] = await Promise.all([api.get('/elevators'), api.get('/customers')]);
      if (elvRes.data.success) setElevators(elvRes.data.data);
      if (custRes.data.success) setCustomers(custRes.data.data);
    } catch (err) { console.error(err.message); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm({ customerId: '', elevatorCode: '', location: '', installationDate: '', warrantyExpiry: '', nextMaintenance: '' }); setShowModal(true); };
  const openEdit = (e) => { setEditing(e); setForm({ customerId: e.customerId, elevatorCode: e.elevatorCode, location: e.location, installationDate: e.installationDate, warrantyExpiry: e.warrantyExpiry || '', nextMaintenance: e.nextMaintenance || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/elevators/${editing.elevatorId}`, form);
      } else {
        await api.post('/elevators', form);
      }
      setShowModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error saving elevator'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try { await api.delete(`/elevators/${id}`); fetchData(); }
    catch (err) { alert('Error deleting elevator'); }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Elevators</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Elevator</button>
      </div>

      <div className="table-container">
        {elevators.length === 0 ? (
          <div className="empty-state">No elevators found</div>
        ) : (
          <table>
            <thead><tr><th>Code</th><th>Customer</th><th>Location</th><th>Installed</th><th>Next Maintenance</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {elevators.map((e) => (
                <tr key={e.elevatorId}>
                  <td><strong>{e.elevatorCode}</strong></td>
                  <td>{e.customerName || e.customerId}</td>
                  <td>{e.location}</td>
                  <td>{e.installationDate || '-'}</td>
                  <td>{e.nextMaintenance || '-'}</td>
                  <td><span className={`badge ${e.status === 'Active' ? 'badge-active' : 'badge-pending'}`}>{e.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => openEdit(e)}>Edit</button>
                    <button className="btn btn-sm btn-danger" style={{ marginLeft: 8 }} onClick={() => handleDelete(e.elevatorId)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Elevator' : 'Add Elevator'}</h2>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div>
                <label>Customer *</label>
                <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required>
                  <option value="">Select customer</option>
                  {customers.map((c) => <option key={c.customerId} value={c.customerId}>{c.name}</option>)}
                </select>
              </div>
              <div><label>Elevator Code *</label><input value={form.elevatorCode} onChange={(e) => setForm({ ...form, elevatorCode: e.target.value })} required /></div>
              <div><label>Location *</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></div>
              <div><label>Installation Date *</label><input type="date" value={form.installationDate} onChange={(e) => setForm({ ...form, installationDate: e.target.value })} required /></div>
              <div><label>Warranty Expiry</label><input type="date" value={form.warrantyExpiry} onChange={(e) => setForm({ ...form, warrantyExpiry: e.target.value })} /></div>
              <div><label>Next Maintenance</label><input type="date" value={form.nextMaintenance} onChange={(e) => setForm({ ...form, nextMaintenance: e.target.value })} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
