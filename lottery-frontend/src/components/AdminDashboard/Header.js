import React, { useState } from 'react';

function Header({ setActiveSection }) {
  const buttons = [
    { label: '🎉 抽獎開始', section: 'draw' },
    { label: '👥 管理參與者', section: 'participants' },
    { label: '🎁 管理獎項', section: 'prizes' },
    { label: '📋 管理活動', section: 'activities' },
  ];

  return (
    <div style={headerContainerStyle}>
      <div style={navWrapperStyle}>
        {buttons.map((btn, i) => (
          <InteractiveButton
            key={i}
            label={btn.label}
            onClick={() => setActiveSection(btn.section)}
          />
        ))}
      </div>
    </div>
  );
}

function InteractiveButton({ label, onClick }) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const dynamicStyle = {
    ...buttonBaseStyle,
    backgroundColor: hover ? '#e6f0ff' : '#ffffff',
    transform: active ? 'scale(0.96)' : hover ? 'scale(1.05)' : 'scale(1)',
    boxShadow: active
      ? '0 2px 4px rgba(0, 0, 0, 0.2)'
      : hover
      ? '0 6px 10px rgba(0, 0, 0, 0.15)'
      : '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  return (
    <button
      style={dynamicStyle}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setActive(false);
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      {label}
    </button>
  );
}

// Header container style
const headerContainerStyle = {
  position: 'fixed',
  top: 0,
  width: '100%',
  zIndex: 1000,
  backgroundColor: '#007bff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
};

// Navigation container
const navWrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  padding: '12px 20px',
  flexWrap: 'wrap',
  gap: '10px',
};

// Base button style
const buttonBaseStyle = {
  padding: '10px 20px',
  color: '#007bff',
  border: '2px solid #ffffff',
  borderRadius: '30px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  outline: 'none',
};

export default Header;
