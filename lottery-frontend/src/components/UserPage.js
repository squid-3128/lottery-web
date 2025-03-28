import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function UserPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false); // 狀態控制顯示內容

  useEffect(() => {
    // 檢查是否已提交過表單
    if (localStorage.getItem('hasSubmitted')) {
      setIsSubmitted(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(formData.phone_number)) {
      alert('請輸入有效的手機號碼（10位數字）。');
      return;
    }

    if (localStorage.getItem('hasSubmitted')) {
      alert('您已經提交過表單，無法再次參加。');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/database/addparticipants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('表單提交成功！');
        setIsSubmitted(true); // 設置為已提交
        console.log('提交的數據：', result);
        localStorage.setItem('hasSubmitted', 'true'); // 標記為已提交
      } else {
        alert('提交失敗，請稍後再試。');
        console.error('提交失敗：', response.statusText);
      }
    } catch (error) {
      alert('提交過程中發生錯誤，請稍後再試。');
      console.error('錯誤信息：', error);
    }
  };

  return (
    <div style={styles.body}>
      <header style={styles.header}>
        <h2 style={styles.h2}>抽獎資料填寫</h2>
      </header>
      {!isSubmitted ? ( // 根據狀態顯示表單或提交成功的畫面
        <form style={styles.form} onSubmit={handleSubmit}>
          <label style={styles.label} htmlFor="name">
            姓名：
          </label>
          <input
            style={styles.input}
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <label style={styles.label} htmlFor="email">
            電子郵件：
          </label>
          <input
            style={styles.input}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label style={styles.label} htmlFor="phone_number">
            手機號碼：
          </label>
          <input
            style={styles.input}
            type="text"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
          />
          <button style={styles.button} type="submit">
            提交
          </button>
        </form>
      ) : (
        <div style={styles.successMessage}>
          <h2 style={styles.successText}>提交成功！</h2>
          <p style={styles.successDescription}>感謝您的參與。</p>
          <Link to="/" style={styles.link}>
            
          </Link>
        </div>
      )}
      <footer style={styles.footer}>
        <Link to="/admin/login" style={styles.link}>Admin Login</Link>
      </footer>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: "'Poppins', Arial, sans-serif",
    background: 'linear-gradient(135deg, #f4a261, #e76f51)',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    animation: 'fadeIn 1s ease-in',
    paddingTop: '80px', // 避免內容被固定的標題遮擋
    position: 'relative',
  },
  header: {
    position: 'fixed', // 固定在頁面頂部
    top: 0,
    left: 0,
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#264653',
    padding: '20px 0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    zIndex: 1000, // 確保標題在最上層
  },
  h2: {
    margin: 0,
    color: 'white',
    fontSize: '28px',
  },
  form: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    width: '320px',
    animation: 'fadeInUp 1s ease-in',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2a9d8f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
  successMessage: {
    textAlign: 'center',
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    animation: 'fadeIn 1s ease-in',
  },
  successText: {
    color: '#2a9d8f',
    fontSize: '24px',
    marginBottom: '20px',
  },
  successDescription: {
    color: '#333',
    fontSize: '16px',
    marginBottom: '20px',
  },
  link: {
    color: '#e76f51',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'color 0.3s ease',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    textAlign: 'center',
    padding: '10px 0',
    backgroundColor: '#264653',
    color: 'white',
  },
};

export default UserPage;