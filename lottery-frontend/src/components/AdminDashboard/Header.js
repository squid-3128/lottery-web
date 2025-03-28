import React from 'react';

function Header({ setActiveSection }) {
  return (
    <div style={headerContainerStyle}>
      <div style={navWrapperStyle}>
        <button style={buttonStyle} onClick={() => setActiveSection('draw')}>🎉 抽獎開始</button>
        <button style={buttonStyle} onClick={() => setActiveSection('participants')}>👥 管理參與者</button>
        <button style={buttonStyle} onClick={() => setActiveSection('prizes')}>🎁 管理獎項</button>
        <button style={buttonStyle} onClick={() => setActiveSection('activities')}>📋 管理活動</button>
      </div>
    </div>
  );
}

const headerContainerStyle = {
  position: 'fixed',
  top: 0,
  width: '100%',
  zIndex: 1000,
  backgroundColor: '#007bff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
};

const navWrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  padding: '12px 20px',
  flexWrap: 'wrap',
  gap: '10px',
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#ffffff',
  color: '#007bff',
  border: '2px solid #ffffff',
  borderRadius: '30px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

buttonStyle[':hover'] = {
  backgroundColor: '#e6f0ff',
};

// button {
//   outline: none;
// }

// button:hover {
//   background-color: #e6f0ff;
//   transform: scale(1.05);
//   box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
// }

// button:active {
//   transform: scale(0.97);
//   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
// }

// button:focus {
//   box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.4);
// }

export default Header;
