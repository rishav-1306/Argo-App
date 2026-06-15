import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password, role: 'admin' });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      navigate('/dashboard');
    } catch (err) { alert('Login failed'); }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="card" style={{ width: '400px' }}>
        <h2 style={{ textAlign: 'center' }}>Argo Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" style={{ width: '100%', padding: '10px', marginBottom: '20px' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Login</button>
        </form>
      </div>
    </div>
  );
};
export default Login;
