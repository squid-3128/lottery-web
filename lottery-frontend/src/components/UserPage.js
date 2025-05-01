import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './UserPage.css';
import Swal from 'sweetalert2'; // 引入 sweetalert2

function UserPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const room = queryParams.get("room");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    room_code: room,
  });
  const [isSubmitted, setIsSubmitted] = useState(false); // 狀態控制顯示內容
  const [activities, setActivities] = useState([]); // 儲存活動資訊
  const [prizes, setPrizes] = useState([]); // 儲存獎品資訊
  const [winners, setWinners] = useState([]); // 儲存中獎名單
  const API_BASE = process.env.REACT_APP_API_BASE;

  useEffect(() => {
    // 檢查是否已提交過當前的 roomCode
    const submittedRooms = JSON.parse(localStorage.getItem('submittedRooms')) || [];
    if (submittedRooms.includes(room)) {
      setIsSubmitted(true);
    }
  }, [room]);

  useEffect(() => {
    // 透過 API 獲取活動資訊
    if (room) {
      fetch(`${API_BASE}/database/allactivity?room=${room}`)
        .then((response) => response.json())
        .then((data) => {
          setActivities(data);
        })
        .catch((error) => {
          console.error('Error fetching activities:', error);
        });
    }
  }, [API_BASE, room]);

  useEffect(() => {
    // 獲取獎品資訊並根據 prize_level 排序
    if (room) {
      fetch(`${API_BASE}/database/allprizes?room=${room}`)
        .then((response) => response.json())
        .then((data) => {
          const sortedPrizes = data.sort((a, b) => a.prize_level - b.prize_level);
          setPrizes(sortedPrizes);
        })
        .catch((error) => {
          console.error('Error fetching prizes:', error);
        });
    }
  }, [API_BASE, room]);

  useEffect(() => {
    // 獲取中獎名單
    if (room) {
      fetch(`${API_BASE}/database/view-draw-results?room=${room}`)
        .then((response) => response.json())
        .then((data) => {
          setWinners(data);
        })
        .catch((error) => {
          console.error('Error fetching draw results:', error);
        });
    }
  }, [API_BASE, room]);

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

    const submittedRooms = JSON.parse(localStorage.getItem('submittedRooms')) || [];
    if (submittedRooms.includes(room)) {
      alert('您已經提交過此房間的表單，無法再次參加。');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/database/addparticipants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('表單提交成功！');
        setIsSubmitted(true);
        console.log('提交的數據：', result);

        submittedRooms.push(room);
        localStorage.setItem('submittedRooms', JSON.stringify(submittedRooms));
      } else {
        alert('提交失敗，請稍後再試。');
        Swal.fire('錯誤', '提交失敗，請稍後再試。', 'error');
        console.error('提交失敗：', response.statusText);
      }
    } catch (error) {
      alert('提交過程中發生錯誤，請稍後再試。');
      Swal.fire('錯誤', '提交失敗，請稍後再試。', 'error');
      console.error('錯誤信息：', error);
    }
  };

  return (
    <div>
      <div className="body">
        <header className="header">
          <h2 className="h2">抽獎資料填寫</h2>
        </header>
        {!isSubmitted ? (
          <form className="form" onSubmit={handleSubmit}>
            <label className="label" htmlFor="name">
              姓名：
            </label>
            <input
              className="input"
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <label className="label" htmlFor="email">
              電子郵件：
            </label>
            <input
              className="input"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label className="label" htmlFor="phone_number">
              手機號碼：
            </label>
            <input
              className="input"
              type="text"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
            />
            <button className="button" type="submit">
              提交
            </button>
          </form>
        ) : (
          <div className="success_message">
            <h2 className="success_text">提交成功！</h2>
            <p className="success_description">感謝您的參與。</p>
            <Link to="/" className="link">
              返回首頁
            </Link>
          </div>
        )}
        {/* 活動列表 */}
        <div className="activity-list">
          <h3>流程表</h3>
          <ul>
            {activities.map((activity) => (
              <li key={activity.id} className="activity-item">
                <h4>{activity.activity_name}</h4>
                <p>表演者：{activity.performer}</p>
                <p>開始時間：{activity.start_time}</p>
                <p>結束時間：{activity.end_time}</p>
                <p>描述：{activity.description}</p>
              </li>
            ))}
          </ul>
        </div>
        {/* 獎品列表 */}
        <div className="prize-list">
        <h3>獎品列表</h3>
          <ul>
            {prizes.map((prize) => {
              // 根據 prize_level 設置不同的 className
              let prizeClass = "prize-item";
              if (prize.prize_level === '1') {
                prizeClass += " gold";
              } else if (prize.prize_level === '2') {
                prizeClass += " silver";
              } else if (prize.prize_level === '3') {
                prizeClass += " bronze";
              }

              return (
                <li key={prize.prize_id} className={prizeClass}>
                  <img src={`${API_BASE}${prize.prize_img}`} alt={prize.prize_name} className="prize-image" />
                  <h4>{prize.prize_name} ({prize.quantity})</h4>
                  <p>{prize.prize_description}</p>
                </li>
              );
            })}
          </ul>
        </div>
        {/* 中獎名單 */}
        <div className="winner-list">
          <h3>中獎名單</h3>
          <table className="winner-table">
            <thead>
              <tr>
                <th>順序</th>
                <th>姓名</th>
                <th>獎品名稱</th>
                <th>獎第</th>
              </tr>
            </thead>
            <tbody>
              {winners.map((winner, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{winner.participant_name}</td>
                  <td>{winner.prize_name}</td>
                  <td>{winner.prize_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <footer className="footer">
      <Link to="login" className="link">Admin Login</Link>
      </footer>
    </div>
  );
}

export default UserPage;