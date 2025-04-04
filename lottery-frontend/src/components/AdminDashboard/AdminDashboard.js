import React, { useState, useEffect } from 'react'; // 加入 useEffect
import { useNavigate } from 'react-router-dom'; // 加入 useNavigate
import { useLocation } from 'react-router-dom';
import axios from 'axios'; // 加入 axios
import Header from './Header';
import DrawSection from './DrawSection';
import ParticipantsSection from './ParticipantsSection';
import PrizesSection from './PrizesSection';
import ActivitiesSection from './ActivitiesSection';

function AdminDashboard() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const room = queryParams.get("room");
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE;
  
  useEffect(() => {
    let isMounted = true; // 用於避免在元件卸載後更新狀態
    const token = localStorage.getItem('authToken'); // 確保使用正確的 token 名稱
  
    if (!token) {
      navigate('/login'); // 若無 Token，重定向到登入頁面
    } else {
      axios
        .get(`${API_BASE}/admin/data?room=${room}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (isMounted) {
            console.log('Token 驗證成功:', response.data);
          }
        })
        .catch((error) => {
          if (isMounted) {
            console.error('Token 驗證失敗:', error);
            alert('驗證失敗，請重新登入。');
            localStorage.removeItem('authToken'); // 移除無效的 Token
            navigate('/login');
          }
        });
    }
  
    return () => {
      isMounted = false; // 清理函式，避免內存洩漏
    };
  }, [navigate, API_BASE, room]);

  const [activeSection, setActiveSection] = useState('draw');

  const renderSection = () => {
    switch (activeSection) {
      case 'draw':
        return <DrawSection room={room} />;
      case 'participants':
        return <ParticipantsSection room={room} />;
      case 'prizes':
        return <PrizesSection room={room} />;
      case 'activities':
        return <ActivitiesSection room={room} />;
      default:
        return <DrawSection room={room} />;
    }
  };

  return (
    <div>
      <Header setActiveSection={setActiveSection} />
      <div style={{ padding: '20px' }}>
        {renderSection()}
      </div>
    </div>
  );
}

export default AdminDashboard;
