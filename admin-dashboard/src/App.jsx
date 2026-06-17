import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Elevators from './pages/Elevators';
import Maintenance from './pages/Maintenance';
import ServiceRequests from './pages/ServiceRequests';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('argo_admin_token');
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('argo_admin_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('argo_admin_token', token);
    localStorage.setItem('argo_admin_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('argo_admin_token');
    localStorage.removeItem('argo_admin_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
