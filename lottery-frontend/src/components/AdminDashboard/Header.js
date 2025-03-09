import React from 'react';

function Header({ setActiveSection }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px', backgroundColor: '#007bff' }}>
      <button style={buttonStyle} onClick={() => setActiveSection('draw')}>抽獎開始</button>
      <button style={buttonStyle} onClick={() => setActiveSection('participants')}>管理參與者</button>
      <button style={buttonStyle} onClick={() => setActiveSection('prizes')}>管理獎項</button>
      <button style={buttonStyle} onClick={() => setActiveSection('activities')}>管理活動</button>
    </div>
  );
}

const buttonStyle = {
  margin: '0 10px',
  padding: '10px 20px',
  backgroundColor: '#fff',
  border: '1px solid #007bff',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default Header;
