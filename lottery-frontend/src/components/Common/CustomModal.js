import React from 'react';

function CustomModal({ show, title, message, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2 style={modalTitleStyle}>{title}</h2>
        <p>{message}</p>
        <div style={modalButtonGroupStyle}>
          <button onClick={onConfirm} style={confirmButtonStyle}>✅ 確認</button>
          <button onClick={onCancel} style={cancelButtonStyle}>❌ 取消</button>
        </div>
      </div>
    </div>
  );
}

// 樣式
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '10px',
  boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
  textAlign: 'center',
  width: '400px',
};

const modalTitleStyle = {
  marginBottom: '10px',
  color: '#007bff',
};

const modalButtonGroupStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '20px',
};

const confirmButtonStyle = {
  padding: '8px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginRight: '10px',
};

const cancelButtonStyle = {
  padding: '8px 15px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default CustomModal;
