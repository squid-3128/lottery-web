import React, { useState } from 'react';
import Header from './Header';
import DrawSection from './DrawSection';
import ParticipantsSection from './ParticipantsSection';
import PrizesSection from './PrizesSection';
import ActivitiesSection from './ActivitiesSection';

function AdminDashboard() {
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
