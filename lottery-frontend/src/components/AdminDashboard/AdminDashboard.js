import React, { useState, useEffect } from 'react'; // 加入 useEffect
import { useNavigate } from 'react-router-dom'; // 加入 useNavigate
import axios from 'axios'; // 加入 axios
import Header from './Header';
import DrawSection from './DrawSection';
import ParticipantsSection from './ParticipantsSection';
import PrizesSection from './PrizesSection';
import ActivitiesSection from './ActivitiesSection';

function AdminDashboard() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login'); // 若無 Token，重定向到登入頁面
    } else {
      axios.get('http://localhost:3001/admin/data', {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {
        alert('驗證失敗，請重新登入。');
        localStorage.removeItem('token');
        navigate('/admin/login');
      });
    }
  }, [navigate]);

  const [activeSection, setActiveSection] = useState('draw');

  const renderSection = () => {
    switch (activeSection) {
      case 'draw':
        return <DrawSection />;
      case 'participants':
        return <ParticipantsSection />;
      case 'prizes':
        return <PrizesSection />;
      case 'activities':
        return <ActivitiesSection />;
      default:
        return <DrawSection />;
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
