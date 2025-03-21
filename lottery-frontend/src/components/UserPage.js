import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function UserPage() {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '', // 修改為 phone_number
  });

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
        <label style={styles.label} htmlFor="phone">
          手機號碼：
        </label>
        <input
          style={styles.input}
          type="text"
          id="phone"
          name="phone_number" // 修改為 phone_number
          value={formData.phone_number}
          onChange={handleChange}
          required
        />
        <button style={styles.button} type="submit">
          提交
        </button>
      </form>
      <p>
        <Link to="/admin/login">Admin Login</Link>
      </p>
    </div>
  );
};

const styles = {
  body: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f9',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '100vh',
  },
  header: {
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#f00a0a',
    padding: '20px 0',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  h2: {
    margin: 0,
    color: 'white',
    fontSize: '24px',
  },
  form: {
    backgroundColor: '#fff',
    padding: '50px',
    borderRadius: '8px',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
    width: '300px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '8px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#e77911',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default UserPage;
