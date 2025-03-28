import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomModal from '../Common/CustomModal'; // 引入自訂 Modal

function ParticipantsSection() {
  const [participants, setParticipants] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [editId, setEditId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '', onConfirm: null });

  // 獲取所有參與者
  const fetchParticipants = () => {
    axios.get('http://localhost:3001/database/allparticipants')
      .then(response => setParticipants(response.data))
      .catch(error => console.error('Error fetching participants:', error));
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  // 新增參與者
  const addParticipant = () => {
    if (!name || !email || !phone) {
      alert('所有欄位都必須填寫');
      return;
    }

    axios.post('http://localhost:3001/database/addparticipants', { name, email, phone_number: phone })
      .then(response => {
        const newParticipant = { id: response.data.result.insertId, name, email, phone_number: phone };
        setParticipants([...participants, newParticipant]);
        setName(''); setEmail(''); setPhone('');
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
    axios.post('http://localhost:3001/database/searchparticipants', {
      name: updatedName,
      email: updatedEmail,
      phone_number: updatedPhone
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
  const handleSave = () => {
    setModalInfo({
      show: true,
      title: '確認修改',
      message: `確定要保存對 ID: ${editedData.id} 的修改嗎？`,
      onConfirm: async () => {
        try {
          await axios.put(`http://localhost:3001/database/updateparticipant`, editedData);
          setParticipants(participants.map(p => (p.id === editedData.id ? editedData : p)));
          setEditId(null);
          closeModal();
        } catch (error) {
          console.error('Error updating participant:', error);
        }
      }
    });
  };

  // 刪除參與者
  const handleDelete = (id) => {
    setModalInfo({
      show: true,
      title: '確認刪除',
      message: `確定要刪除參與者 ID: ${id} 嗎？`,
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:3001/database/delparticipants`, { data: { id } });
          setParticipants(participants.filter(p => p.id !== id));
          closeModal();
        } catch (error) {
          console.error('Error deleting participant:', error);
        }
      }
    });
  };

  // 關閉 Modal
  const closeModal = () => {
    setModalInfo({ show: false, title: '', message: '', onConfirm: null });
  };

  // 更新輸入資料
  const handleChange = (e, field) => {
    setEditedData({ ...editedData, [field]: e.target.value });
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'pending':
        return '驗證中';
      case 'valid':
        return '有效';
      case 'canceled':
        return '已取消';
      case 'won':
        return '獲獎';
      default:
        return status;
    }
  };  

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'gold' };     // 黃色
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
    <div style={containerStyle}>
      {/* <h2 style={titleStyle}>管理參與者</h2> */}
      <h3 style={{ marginTop: '30px', color: '#007bff' }}>新增參與者</h3>
      <div style={formStyle}>
        <input
          type="text"
          placeholder="姓名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="電話"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
        />
        <button onClick={addParticipant} style={buttonStyle}>新增參與者</button>
      </div>

      {/* 搜尋條件表單 */}
      <h3 style={{ marginTop: '30px', color: '#007bff' }}>搜尋參與者</h3>
      <div style={formStyle}>
        <input
          type="text"
          placeholder="搜尋姓名"
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
            searchParticipants('name', e.target.value);
          }}
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="搜尋 Email"
          value={searchEmail}
          onChange={(e) => {
            setSearchEmail(e.target.value);
            searchParticipants('email', e.target.value);
          }}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="搜尋電話"
          value={searchPhone}
          onChange={(e) => {
            setSearchPhone(e.target.value);
            searchParticipants('phone', e.target.value);
          }}
          style={inputStyle}
        />
        <button onClick={clearSearch} style={clearButtonStyle}>清除搜尋</button>
      </div>

      {/* 參與者表格 */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>姓名</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>電話</th>
            <th style={thStyle}>狀態</th>
            <th style={thStyle}>操作</th>
          </tr>
        </thead>
        <tbody>
          {participants.map(participant => (
            <tr key={participant.id}>
              <td style={tdStyle}>{participant.id}</td>
              <td style={tdStyle}>
                {editId === participant.id ? (
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) => handleChange(e, 'name')}
                    style={inputStyle}
                  />
                ) : (
                  participant.name
                )}
              </td>
              <td style={tdStyle}>
                {editId === participant.id ? (
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) => handleChange(e, 'email')}
                    style={inputStyle}
                  />
                ) : (
                  participant.email
                )}
              </td>
              <td style={tdStyle}>
                {editId === participant.id ? (
                  <input
                    type="text"
                    value={editedData.phone_number}
                    onChange={(e) => handleChange(e, 'phone_number')}
                    style={inputStyle}
                  />
                ) : (
                  participant.phone_number
                )}
              </td>
              <td style={tdStyle}>
                {editId === participant.id ? (
                  <input
                    type="text"
                    value={editedData.status}
                    onChange={(e) => handleChange(e, 'status')}
                    style={inputStyle}
                  />
                ) : (
                  <span style={getStatusStyle(participant.status)}>
                    {translateStatus(participant.status)}
                  </span>
                )}
              </td>
              <td style={tdStyle}>
                {editId === participant.id ? (
                  <>
                    <button onClick={() => handleSave(participant.id)} style={saveButtonStyle}>💾 保存</button>
                    <button onClick={() => setEditId(null)} style={cancelButtonStyle}>❌ 取消</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(participant)} style={editButtonStyle}>✏️ 編輯</button>
                    <button onClick={() => handleDelete(participant.id)} style={deleteButtonStyle}>🗑 刪除</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <CustomModal
        show={modalInfo.show}
        title={modalInfo.title}
        message={modalInfo.message}
        onConfirm={modalInfo.onConfirm}
        onCancel={closeModal}
      />
    </div>
  );
}

// 樣式
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  backgroundColor: '#f8f9fa',
  minHeight: '100vh',
};

// const titleStyle = {
//   color: '#007bff',
//   marginBottom: '20px',
// };

const formStyle = {
  display: 'flex',
  gap: '10px',
  marginBottom: '30px',
};

const inputStyle = {
  padding: '10px',
  fontSize: '16px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  width: '200px',
};

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const clearButtonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#6c757d',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const tableStyle = {
  width: '80%',
  borderCollapse: 'collapse',
  backgroundColor: '#fff',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
};

const thStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '10px',
  textAlign: 'center',
};

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #ddd',
  textAlign: 'center',
};

const editButtonStyle = {
  padding: '5px 10px',
  marginRight: '5px',
  backgroundColor: '#ffc107',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const deleteButtonStyle = {
  padding: '5px 10px',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const saveButtonStyle = {
  padding: '5px 10px',
  marginRight: '5px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const cancelButtonStyle = {
  padding: '5px 10px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default ParticipantsSection;
