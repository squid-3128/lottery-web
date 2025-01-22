import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  // const [data, setData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [activitys, setActivitys] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhone] = useState('');
  const [winnerInfo, setWinnerInfo] = useState({
    id: '',
    name: '',
    email: '',
    phone_number: ''
  });
  // const [message, setMessage] = useState(''); //用於回報刪除、修改參與者
  const [query, setQuery] = useState("");     //用於搜索參與者
  const [contextMenu, setContextMenu] = useState(null); // 儲存右鍵選單的狀態
  const [selectedParticipant, setSelectedParticipant] = useState(null); // 儲存選中的參與者資料

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login as admin');
        window.location.href = '/admin/login';
        return;
      }

      try {
        // const res = await axios.get('http://localhost:3001/admin/data', {
        //   headers: { Authorization: token }
        // });
        // setData(res.data);
      } catch (err) {
        alert('Access denied');
        window.location.href = '/admin/login';
      }
    };
    fetchData();
  }, []);

  // Fetch participants from API
  useEffect(() => {
    axios.get('http://localhost:3001/database/allparticipants')
      .then(response => setParticipants(response.data))
      .catch(error => console.error('Error fetching participants:', error));
  }, []);

  // 初始化所有獎項資訊
  useEffect(() => {
    axios.get('http://localhost:3001/database/allprizes')
      .then(response => setPrizes(response.data))
      .catch(error => console.error('Error fetching prizes:', error));
  }, []);

    // 初始化所有活動資訊
    useEffect(() => {
      axios.get('http://localhost:3001/database/allactivity')
        .then(response => setActivitys(response.data))
        .catch(error => console.error('Error fetching prizes:', error));
    }, []);

  // Add new participant
  const addParticipant = () => {
    axios.post('http://localhost:3001/database/addparticipants', { name, email, phone_number })
      .then(response => {
        // 從回應中提取 insertId 並構建新的參與者資料
        const newParticipant = {
          id: response.data.result.insertId, // 從 result 中提取 insertId
          name,
          email,
          phone_number
        };
        // 更新 participants 陣列
        setParticipants([...participants, newParticipant]);
        // 清空輸入欄位
        setName('');
        setEmail('');
        setPhone('');
      })
      .catch(error => console.error('Error adding participant:', error));
  };

  // 右鍵點擊事件
  const handleRightClick = (event, participant) => {
    event.preventDefault(); // 禁止默認右鍵選單
    setSelectedParticipant(participant); // 設定選中的參與者
    setContextMenu({
      x: event.pageX,
      y: event.pageY,
    });
  };

  // 關閉右鍵選單
  const handleCloseMenu = () => {
    setContextMenu(null);
  };

  // 刪除參與者
  const handleDelete = async () => {
    if (!selectedParticipant) return;
    try {
      await axios.delete("http://localhost:3001/database/delparticipants", {
        data: { name: selectedParticipant.name },
      });
      setParticipants(
        participants.filter((p) => p.id !== selectedParticipant.id)
      );
      setContextMenu(null);
    } catch (error) {
      console.error("Error deleting participant:", error);
    }
  };

  //修改參與者名稱
  const UpdateName = async (field) => {
    if (!selectedParticipant) return;

    const newValue = prompt(`Enter new ${field}:`, selectedParticipant[field]);
    if (!newValue) {
      alert(`${field} cannot be empty!`);
      return;
    }

    try {
      await axios.put("http://localhost:3001/database/updateparticipant/name", {
        id: selectedParticipant.id,
        [field]: newValue,
      });

      setParticipants(
        participants.map((p) =>
          p.id === selectedParticipant.id
            ? { ...p, [field]: newValue }
            : p
        )
      );
      setContextMenu(null); // 關閉選單
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  //修改參與者郵件
  const Updateemail = async (field) => {
    if (!selectedParticipant) return;

    const newValue = prompt(`Enter new ${field}:`, selectedParticipant[field]);
    if (!newValue) {
      alert(`${field} cannot be empty!`);
      return;
    }

    try {
      await axios.put("http://localhost:3001/database/updateparticipant/email", {
        id: selectedParticipant.id,
        [field]: newValue,
      });

      setParticipants(
        participants.map((p) =>
          p.id === selectedParticipant.id
            ? { ...p, [field]: newValue }
            : p
        )
      );
      setContextMenu(null); // 關閉選單
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  //修改參與者電話
  const Updatephone = async (field) => {
    if (!selectedParticipant) return;

    const newValue = prompt(`Enter new ${field}:`, selectedParticipant[field]);
    if (!newValue) {
      alert(`${field} cannot be empty!`);
      return;
    }

    try {
      await axios.put("http://localhost:3001/database/updateparticipant/phone", {
        id: selectedParticipant.id,
        [field]: newValue,
      });

      setParticipants(
        participants.map((p) =>
          p.id === selectedParticipant.id
            ? { ...p, [field]: newValue }
            : p
        )
      );
      setContextMenu(null); // 關閉選單
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const SearchParticipant = async (event) => {
    const value = event.target.value;
    setQuery(value);

    try {
      const url = value.trim() === "" 
          ? `http://localhost:3001/database/allparticipants` // 修改為請求顯示所有內容的端點
          : `http://localhost:3001/database/search?query=${value}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
        console.error("Error fetching search results:", error);
    }
  };

  // Draw a random winner
  const drawWinner = async () => {
    try {
      const response = await fetch("http://localhost:3001/database/random-winner");
      const data = await response.json();
      setWinnerInfo(data[0]); // Update winner details
    } catch (error) {
      console.error("Error fetching winner:", error);
    }
  };



  return (
    <div>
      <h1 style={{ margin: "10px" }}>管理者介面</h1>
      <div>
        <details  style={{ margin: "10px" }}>
          <summary>抽獎開始</summary>
          <button onClick={drawWinner}>抽取參與者</button>
          {winnerInfo && (
            <div style={{ marginTop: "20px" }}>
              <h3>中獎者資訊</h3>
              <p><strong>ID:</strong> {winnerInfo.id}</p>
              <p><strong>name:</strong> {winnerInfo.name}</p>
              <p><strong>Email:</strong> {winnerInfo.email}</p>
              <p><strong>Phone:</strong> {winnerInfo.phone_number}</p>
            </div>
          )}
        </details>
      </div>
      <div>
        <details style={{ margin: "10px" }}>
          <summary>檢視中獎者狀態</summary>
        </details>
      </div>
      <div>
        <details style={{ margin: "10px" }}>
          <summary>管理參與者</summary>
          <div>
            <h3>新增參與著</h3>
            <input
              type="text"
              placeholder="姓名"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="電話"
              value={phone_number}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button onClick={addParticipant}>新增參與者</button>
            <h3>搜尋參與者</h3>
            <input
              type="text"
              value={query}
              onChange={SearchParticipant}
              placeholder="Type to search..."
              style={{ width: "300px", padding: "10px" }}
            />
          </div>
            <table border="1">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr
                    key={participant.id}
                    onContextMenu={(e) => handleRightClick(e, participant)} // 綁定右鍵事件
                  >
                    <td>{participant.id}</td>
                    <td>{participant.name}</td>
                    <td>{participant.email}</td>
                    <td>{participant.phone_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* 自定義右鍵選單 */}
            {contextMenu && (
              <div
                style={{
                  position: "absolute",
                  top: contextMenu.y,
                  left: contextMenu.x,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  padding: "10px",
                  zIndex: 1000,
                }}
                onMouseLeave={handleCloseMenu} // 滑鼠移開關閉選單
              >
                <button onClick={() => UpdateName("name")}>修改 Name</button>
                <button onClick={() => Updateemail("email")}>修改 Email</button>
                <button onClick={() => Updatephone("phone_number")}>修改 Phone</button>
                <button onClick={handleDelete}>刪除參與者</button>
              </div>
            )}
        </details>
      </div>
      <div>
        <details style={{ margin: "10px" }}>
          <summary>管理獎項</summary>
          <table border="1">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>name</th>
                  <th>description</th>
                  <th>level</th>
                </tr>
              </thead>
              <tbody>
                {prizes.map((prize) => (
                  <tr key={prize.id}>
                    <td>{prize.prize_id}</td>
                    <td>{prize.prize_name}</td>
                    <td>{prize.prize_description}</td>
                    <td>{prize.prize_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </details>
      </div>
      <div>
        <details style={{ margin: "10px" }}>
          <summary>管理活動</summary>
          <table border="1">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>name</th>
                  <th>performer</th>
                  <th>start_time</th>
                  <th>end_time</th>
                  <th>description</th>
                </tr>
              </thead>
              <tbody>
                {activitys.map((activity) => (
                  <tr key={activity.id}>
                    <td>{activity.id}</td>
                    <td>{activity.activity_name}</td>
                    <td>{activity.performer}</td>
                    <td>{activity.start_time}</td>
                    <td>{activity.end_time}</td>
                    <td>{activity.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </details>
      </div>
    </div>
  );
}

export default AdminDashboard;
