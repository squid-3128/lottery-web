import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { QRCodeCanvas } from 'qrcode.react';
import { createRoot } from 'react-dom/client';

function Header({ setActiveSection }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 動態檢測螢幕寬度
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const buttons = [
    { label: '🎉 抽獎開始', section: 'draw' },
    { label: '👥 管理參與者', section: 'participants' },
    { label: '🎁 管理獎項', section: 'prizes' },
    { label: '📋 管理活動', section: 'activities' },
  ];

  const handleQRCodeClick = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    const baseUrl = window.location.origin;
    const newUrl = `${baseUrl}/userpage?room=${roomId}`;
    Swal.fire({
      title: '分享 QR Code',
      html: `
        <div id="qrcode-container"></div>
        <p>${newUrl}</p>
        <button id="copy-button" style="margin-top: 10px; padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">複製連結</button>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      didOpen: () => {
        const container = document.getElementById('qrcode-container');
        if (container) {
          const qrCodeElement = document.createElement('div');
          container.appendChild(qrCodeElement);
          const root = createRoot(qrCodeElement);
          root.render(<QRCodeCanvas value={newUrl} size={300} />);
        }

        const copyButton = document.getElementById('copy-button');
        copyButton.addEventListener('click', () => {
          navigator.clipboard.writeText(newUrl).then(() => {
            Swal.fire({
              icon: 'success',
              title: '已複製到剪貼簿',
              timer: 1500,
              showConfirmButton: false,
            });
          });
        });
      },
    });
  };

  return (
    <div style={headerContainerStyle}>
      <div style={isMobile ? mobileNavWrapperStyle : desktopNavWrapperStyle}>
        {buttons.map((btn, i) => (
          <InteractiveButton
            key={i}
            label={btn.label}
            onClick={() => setActiveSection(btn.section)}
          />
        ))}
        <InteractiveButton label="📱 QRcode" onClick={handleQRCodeClick} />
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

// Navigation container styles
const desktopNavWrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  padding: '12px 20px',
  gap: '15px',
};

const mobileNavWrapperStyle = {
  display: 'flex',
  padding: '12px 20px',
  gap: '15px',
  overflowX: 'auto',
  whiteSpace: 'nowrap',
  WebkitOverflowScrolling: 'touch',
};

// Base button style
const buttonBaseStyle = {
  padding: '10px 20px',
  color: '#007bff',
  border: '2px solid #ffffff',
  borderRadius: '30px',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  outline: 'none',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

export default Header;