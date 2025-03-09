import React, { useState } from 'react';
import axios from 'axios';
import './AdminLoginPage.css';

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
      alert('登入失敗，請檢查用戶名和密碼。');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">管理員登入</h1>
        <div className="login-form">
          <input
            type="text"
            placeholder="用戶名"
            className="login-input"
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="密碼"
            className="login-input"
            onChange={e => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="login-button"
          >
            登入
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
