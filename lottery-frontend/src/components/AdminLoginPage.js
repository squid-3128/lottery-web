import React, { useState } from 'react';
import axios from 'axios';

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:3001/admin/login', { username, password });
      const token = res.data.token;
      localStorage.setItem('token', token);
      window.location.href = '/admin/dashboard';
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div>
      <h1>Admin Login</h1>
      <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default AdminLoginPage;
