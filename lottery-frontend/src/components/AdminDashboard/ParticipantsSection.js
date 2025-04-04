import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import styles from './AdminDashboard.module.css';
import Swal from 'sweetalert2'; // 引入 sweetalert2

function ParticipantsSection({ room }) {
  const [participants, setParticipants] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [editId, setEditId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const API_BASE = process.env.REACT_APP_API_BASE;

  // 獲取所有參與者
  const fetchParticipants = useCallback(() => {
    axios.get(`${API_BASE}/database/allparticipants?room=${room}`)
      .then(response => setParticipants(response.data))
      .catch(error => console.error('Error fetching participants:', error));
  }, [room, API_BASE]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // 新增參與者
  const addParticipant = () => {
    if (!name || !email || !phone) {
      Swal.fire('錯誤', '所有欄位都必須填寫', 'error');
      return;
    }

    axios.post(`${API_BASE}/database/addparticipants`, { name, email, phone_number: phone, room_code: room})
      .then(response => {
        const newParticipant = { id: response.data.result.insertId, name, email, phone_number: phone };
        setParticipants([...participants, newParticipant]);
        setName(''); setEmail(''); setPhone('');
        Swal.fire('成功', '參與者已新增', 'success');
      })
      .catch(error => console.error('Error adding participant:', error));
  };

  // 即時搜尋參與者
  const searchParticipants = (field, value) => {
    const updatedName = field === 'name' ? value : searchName;
    const updatedEmail = field === 'email' ? value : searchEmail;
    const updatedPhone = field === 'phone' ? value : searchPhone;

    // 如果所有欄位皆為空，回傳所有參與者
    if (!updatedName && !updatedEmail && !updatedPhone) {
      fetchParticipants();
      return;
    }

    // 發送搜尋請求
    axios.post(`${API_BASE}/database/searchparticipants`, {
      name: updatedName,
      email: updatedEmail,
      phone_number: updatedPhone,
      room_code: room
    })
    .then(response => setParticipants(response.data))
    .catch(error => console.error('Error searching participants:', error));
  };

  // 清除搜尋條件
  const clearSearch = () => {
    setSearchName('');
    setSearchEmail('');
    setSearchPhone('');
    fetchParticipants();
  };

  // 編輯模式
  const handleEdit = (participant) => {
    setEditId(participant.id);
    setEditedData({ ...participant });
  };

  // 保存修改
  const handleSave = (order) => {
    Swal.fire({
      title: '確認修改',
      text: `確定要保存對參與者 ID: ${order} 的修改嗎？`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '是的，保存',
      cancelButtonText: '取消'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`${API_BASE}/database/updateparticipant`, editedData);
          setParticipants(participants.map(p => (p.id === editedData.id ? editedData : p)));
          setEditId(null);
          Swal.fire('成功', '修改已保存', 'success');
        } catch (error) {
          console.error('Error updating participant:', error);
          Swal.fire('錯誤', '保存修改時發生錯誤', 'error');
        }
      }
    });
  };

  // 刪除參與者
  const handleDelete = (id, order) => {
    Swal.fire({
      title: '確認刪除',
      text: `刪除後將無法復原，確定要刪除參與者 ID: ${order} 嗎？`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '是的，刪除',
      cancelButtonText: '取消'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE}/database/delparticipants`, { data: { id } });
          setParticipants(participants.filter(p => p.id !== id));
          Swal.fire('成功', '參與者已刪除', 'success');
        } catch (error) {
          console.error('Error deleting participant:', error);
          Swal.fire('錯誤', '刪除時發生錯誤', 'error');
        }
      }
    });
  };

  // 更新輸入資料
  const handleChange = (e, field) => {
    setEditedData({ ...editedData, [field]: e.target.value });
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'pending':
        return '待確認';
      case 'valid':
        return '有效';
      case 'canceled':
        return '取消';
      case 'won':
        return '獲獎';
      default:
        return status;
    }
  };  

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return { color: "black" };     // 黃色
      case 'valid':
        return { color: 'green' };    // 綠色
      case 'canceled':
        return { color: 'red' };      // 紅色
      case 'won':
        return { color: 'blue' };     // 藍色
      default:
        return {};
    }
  };

  return (
    <div className={styles.container}>
      {/* <h2 className={titleStyle}>管理參與者</h2> */}
      {/* <h3 style={{ marginTop: '30px', color: '#007bff' }}>新增參與者</h3> */}
      <div className={styles.form}>
        <input
          type="text"
          placeholder="姓名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.add_input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.add_input}
        />
        <input
          type="text"
          placeholder="電話"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={styles.add_input}
        />
        <button onClick={addParticipant} className={styles.button}>新增參與者</button>
      </div>

      {/* 搜尋條件表單 */}
      {/* <h3 style={{ marginTop: '30px', color: '#007bff' }}>搜尋參與者</h3> */}
      <div className={styles.form}>
        <input
          type="text"
          placeholder="搜尋姓名"
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
            searchParticipants('name', e.target.value);
          }}
          className={styles.add_input}
        />
        <input
          type="email"
          placeholder="搜尋 Email"
          value={searchEmail}
          onChange={(e) => {
            setSearchEmail(e.target.value);
            searchParticipants('email', e.target.value);
          }}
          className={styles.add_input}
        />
        <input
          type="text"
          placeholder="搜尋電話"
          value={searchPhone}
          onChange={(e) => {
            setSearchPhone(e.target.value);
            searchParticipants('phone', e.target.value);
          }}
          className={styles.add_input}
        />
        <button onClick={clearSearch} className={styles.clearButton}>清除搜尋</button>
      </div>

      {/* 參與者表格 */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>姓名</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>電話</th>
              <th className={styles.th}>狀態</th>
              <th className={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {participants.map(participant => (
              <tr key={participant.order}>
                <td className={styles.td}>{participant.order}</td>
                <td className={styles.td}>
                  {editId === participant.id ? (
                    <input
                      type="text"
                      value={editedData.name}
                      onChange={(e) => handleChange(e, 'name')}
                      className={styles.input}
                    />
                  ) : (
                    participant.name
                  )}
                </td>
                <td className={styles.td}>
                  {editId === participant.id ? (
                    <input
                      type="email"
                      value={editedData.email}
                      onChange={(e) => handleChange(e, 'email')}
                      className={styles.input}
                    />
                  ) : (
                    participant.email
                  )}
                </td>
                <td className={styles.td}>
                  {editId === participant.id ? (
                    <input
                      type="text"
                      value={editedData.phone_number}
                      onChange={(e) => handleChange(e, 'phone_number')}
                      className={styles.input}
                    />
                  ) : (
                    participant.phone_number
                  )}
                </td>
                <td className={styles.td}>
                  {editId === participant.id ? (
                    // <input
                    //   type="text"
                    //   value={editedData.status}
                    //   onChange={(e) => handleChange(e, 'status')}
                    //   className={styles.input}
                    // />
                    <select
                      value={editedData.status}
                      onChange={(e) => handleChange(e, 'status')}
                      className={styles.input}
                    >
                      <option value="pending">驗證中</option>
                      <option value="valid">有效</option>
                      <option value="canceled">取消</option>
                      <option value="won">獲獎</option>
                    </select>
                  ) : (
                    <span style={getStatusStyle(participant.status)}>
                      {translateStatus(participant.status)}
                    </span>
                  )}
                </td>
                <td className={styles.td}>
                  {editId === participant.id ? (
                    <>
                      <button onClick={() => handleSave(participant.order)} className={styles.saveButton}>💾 保存</button>
                      <button onClick={() => setEditId(null)} className={styles.cancelButton}>❌ 取消</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(participant)} className={styles.editButton}>✏️ 編輯</button>
                      <button onClick={() => handleDelete(participant.id, participant.order)} className={styles.deleteButton}>🗑 刪除</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ParticipantsSection;
