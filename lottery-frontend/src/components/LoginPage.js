import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [role, setRole] = useState(null); // null | "participant" | "admin"
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [adminRoomCode, setAdminRoomCode] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [participantCode, setParticipantCode] = useState('');
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE;

  const handleBack = () => {
    setRole(null);
    setShowCreateRoom(false);
  };

  const fetchRoomCode = async () => {
    try {
      const response = await axios.get(`${API_BASE}/database/room-code`);
      setRoomCode(response.data.roomCode);
    } catch (error) {
      setRoomCode('取得房間代碼失敗');
    }
  };

  const handleCreateRoomClick = () => {
    fetchRoomCode();
    setShowCreateRoom(true);
  };

  const renderInitialButtons = () => (
    <div>
      <div className="login-title">選擇登入方式</div>
      <div className="login-form">
        <button className="login-button" onClick={() => setRole('participant')}>我是參與者</button>
        <button className="login-button" onClick={() => setRole('admin')}>我是管理者</button>
      </div>
    </div>
  );

  const renderParticipantForm = () => (
    <div>
      <div className="login-title">參與者登入</div>
      <div className="login-form">
        <input
          type="text"
          className="login-input"
          placeholder="請輸入代碼"
          value={participantCode}
          onChange={(e) => setParticipantCode(e.target.value)}
        />
        <button
          className="login-button"
          onClick={async () => {
            if (participantCode.trim() === '') {
              alert('請輸入代碼');
              return;
            }
            try {
              const res = await axios.get(`${API_BASE}/database/check-room`, {
                params: { room: participantCode }
              });

              if (res.data.exists) {
                navigate(`/userpage?room=${encodeURIComponent(participantCode)}`);
              } else {
                alert('找不到此代碼');
              }
            } catch (err) {
              alert('伺服器錯誤，請稍後再試');
              console.error("錯誤詳細：", err);
            }
          }}
        >
          確認
        </button>
      </div>
    </div>
  );

  const renderAdminForm = () => {  
    const handleAdminLogin = async () => {
      if (adminRoomCode.trim() === '' || adminPassword.trim() === '') {
        alert('請輸入房間代碼和密碼');
        return;
      }
    
      try {
        const res = await axios.post(`${API_BASE}/admin/login`, {
          room_code: adminRoomCode,
          password: adminPassword,
        });
    
        if (res.data.token) {
          localStorage.setItem('authToken', res.data.token); // 儲存 Token
          navigate(`/admindashboard?room=${encodeURIComponent(adminRoomCode)}`);
        } else {
          alert('登入失敗');
        }
      } catch (err) {
        if (err.response) {
          alert(err.response.data.message); // 顯示錯誤訊息
        } else {
          alert('伺服器錯誤，請稍後再試');
        }
      }
    };
  
    return (
      <div>
        <div className='login-title'>管理者登入</div>
        <div className="login-form">
          <input
            type="text"
            className="login-input"
            placeholder="請輸入房間代碼..."
            value={adminRoomCode}
            onChange={(e) => setAdminRoomCode(e.target.value)}
          />
          <input
            type="password"
            className="login-input"
            placeholder="請輸入密碼..."
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
          <button className="login-button" onClick={handleAdminLogin}>確認</button>
          <div className="divider-line"></div>
          <button className="login-button" onClick={handleCreateRoomClick}>創建新房間</button>
        </div>
      </div>
    );
  };

  const renderCreateRoomForm = () => {
    const handleCreateRoom = async () => {
      if (adminName.trim() === '' || adminPassword.trim() === '') {
        alert('請輸入管理者名稱和密碼');
        return;
      }
  
      try {
        const res = await axios.post(`${API_BASE}/database/create-room`, {
          roomCode,
          administrator_name: adminName,
          password: adminPassword,
        });
  
        if (res.data.roomCode) {
          alert(`房間建立成功！房間代碼為：${res.data.roomCode}，請保存好這個代碼`);
          setAdminRoomCode(res.data.roomCode);
          setShowCreateRoom(false); // 返回管理者登入畫面
        } else {
          alert('房間建立失敗');
        }
      } catch (err) {
        alert('伺服器錯誤，請稍後再試');
        console.error('錯誤詳細：', err);
      }
    };
  
    return (
      <div className="login-title">
        房間代碼
        <div className="login-form">
          <h1>{roomCode}</h1>
          <input
            type="text"
            className="login-input"
            placeholder="請輸入管理者名稱..."
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
          />
          <input
            type="password"
            className="login-input"
            placeholder="請輸入密碼..."
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
          <button className="login-button" onClick={handleCreateRoom}>確認創建新房間</button>
        </div>
      </div>
    );
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {role !== null && (
          <button
            className="back-button"
            onClick={showCreateRoom ? () => setShowCreateRoom(false) : handleBack}
          >
            {"↩ "}回上頁
          </button>
        )}
        {role === null && renderInitialButtons()}
        {role === 'participant' && renderParticipantForm()}
        {role === 'admin' && (showCreateRoom ? renderCreateRoomForm() : renderAdminForm())}
      </div>
    </div>
  );
};

export default LoginPage;