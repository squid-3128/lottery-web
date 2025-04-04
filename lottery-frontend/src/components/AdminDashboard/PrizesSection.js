import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // 引入 sweetalert2
import styles from './AdminDashboard.module.css';

function PrizesSection({ room }) {
  const [prizes, setPrizes] = useState([]);
  const [prizeName, setPrizeName] = useState('');
  const [prizeDescription, setPrizeDescription] = useState('');
  const [prizeQuantity, setPrizeQuantity] = useState('');
  const [prizeLevel, setPrizeLevel] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 排序順序
  const [editId, setEditId] = useState(null);
  const [prizeImage, setPrizeImage] = useState('');
  const [editedData, setEditedData] = useState({
    prize_name: '',
    prize_description: '',
    prize_level: '',
    quantity: '',
  });
  const API_BASE = process.env.REACT_APP_API_BASE;

  const fetchPrizes = useCallback(() => {
    axios.get(`${API_BASE}/database/allprizes?room=${room}`)
      .then(response => setPrizes(response.data))
      .catch(error => console.error('Error fetching prizes:', error));
  }, [room, API_BASE]);

  useEffect(() => {
    fetchPrizes();
  }, [fetchPrizes]);

  // 排序功能
  const sortByPrizeLevel = () => {
    const sortedPrizes = [...prizes].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.prize_level - b.prize_level;
      } else {
        return b.prize_level - a.prize_level;
      }
    });
    setPrizes(sortedPrizes);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // 切換排序順序
  };

  const addPrize = async () => {
    if (!prizeName || !prizeDescription || !prizeLevel || !prizeQuantity) {
      Swal.fire('錯誤', '請填寫所有欄位！', 'error');
      return;
    }

    const newPrize = {
      name: prizeName,
      description: prizeDescription,
      level: prizeLevel,
      quantity: prizeQuantity,
      image: prizeImage,
      room_code: room,
    };

    try {
      const response = await axios.post(`${API_BASE}/database/addprizes`, newPrize);
      if (response.data.insertId) {
        Swal.fire('成功', '獎項新增成功！', 'success');
        fetchPrizes();
        setPrizeName('');
        setPrizeDescription('');
        setPrizeLevel('');
        setPrizeQuantity('');
        setPrizeImage('');
      } else {
        Swal.fire('錯誤', '新增失敗，請稍後再試。', 'error');
      }
    } catch (error) {
      console.error('Error adding prize:', error);
      Swal.fire('錯誤', '新增失敗，請檢查伺服器連線。', 'error');
    }
  };

  const handleEdit = (prize) => {
    setEditId(prize.prize_id);
    setEditedData({ ...prize });
  };

  const handleInputChange = (e, field) => {
    setEditedData({ ...editedData, [field]: e.target.value });
  };

  const handleSave = async (order) => {
    Swal.fire({
      title: '確認修改',
      text: `確定要保存對獎品 ID: ${order} 的修改嗎？`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`${API_BASE}/database/updateprizes`, {
            id: editId,
            name: editedData.prize_name,
            description: editedData.prize_description,
            level: editedData.prize_level,
            quantity: editedData.quantity,
          });
          setEditId(null);
          fetchPrizes();
          Swal.fire('成功', '修改已保存！', 'success');
        } catch (error) {
          console.error('Error updating prize:', error);
          Swal.fire('錯誤', '更新失敗，請稍後再試。', 'error');
        }
      }
    });
  };

  const handleDelete = async (id, order) => {
    Swal.fire({
      title: '確認刪除',
      text: `刪除後將無法復原，確定要刪除獎品 ID: ${order} 嗎？`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE}/database/delprizes`, { data: { id } });
          Swal.fire('成功', '獎項刪除成功！', 'success');
          fetchPrizes();
        } catch (error) {
          console.error('Error deleting prize:', error);
          Swal.fire('錯誤', '刪除失敗，請稍後再試。', 'error');
        }
      }
    });
  };

  const handleImageClick = (imageUrl) => {
    Swal.fire({
      imageUrl: `${API_BASE}${imageUrl}`,
      imageAlt: 'Prize Image',
      showCloseButton: true,
      showConfirmButton: false,
      width: '80%',
    });
  };

  return (
    <div className={styles.container}>
      {/* <h3 style={{ marginTop: '30px', color: '#007bff' }}>新增獎項</h3> */}
      <div className={styles.form}>
        <input
          type="text"
          placeholder="獎項名稱"
          value={prizeName}
          onChange={(e) => setPrizeName(e.target.value)}
          className={styles.add_input}
        />
        <input
          type="text"
          placeholder="獎項描述"
          value={prizeDescription}
          onChange={(e) => setPrizeDescription(e.target.value)}
          className={styles.add_input}
        />
        <input
          type="number"
          placeholder="獎項數量"
          value={prizeQuantity}
          onChange={(e) => setPrizeQuantity(e.target.value)}
          className={styles.add_input}
        />
        <input
          type="text"
          placeholder="獎項等級"
          value={prizeLevel}
          onChange={(e) => setPrizeLevel(e.target.value)}
          className={styles.add_input}
        />
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (file) {
              const formData = new FormData();
              formData.append('prize_img', file);

              try {
                const response = await axios.post(`${API_BASE}/database/upload-prize-image`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });
                setPrizeImage(response.data.imagePath);
                Swal.fire('成功', '圖片上傳成功！', 'success');
              } catch (error) {
                console.error('圖片上傳失敗：', error);
                Swal.fire('錯誤', '圖片上傳失敗，請稍後再試。', 'error');
              }
            }
          }}
          className={styles.add_input}
        />
        <button onClick={addPrize} className={styles.button}>➕ 新增獎項</button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>名稱</th>
              <th className={styles.th}>描述</th>
              <th className={styles.th}>數量</th>
              <th className={styles.th}>
                等級
                <button
                  onClick={sortByPrizeLevel}
                  style={{
                    padding: '5px',
                    fontSize: '16px',
                    backgroundColor: '#007bff',
                    border: '#007bff',
                    cursor: 'pointer',
                  }}
                >
                  {sortOrder === 'asc' ? '⬆️' : '⬇️'}
                </button>
              </th>
              <th className={styles.th}>圖片</th>
              <th className={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {prizes.map((prize) => (
              <tr key={prize.order}>
                <td className={styles.td}>{prize.order}</td>
                <td className={styles.td}>
                  {editId === prize.prize_id ? (
                    <input
                      type="text"
                      value={editedData.prize_name}
                      onChange={(e) => handleInputChange(e, 'prize_name')}
                      className={styles.input}
                    />
                  ) : (
                    prize.prize_name
                  )}
                </td>
                <td className={`${styles.td} ${styles.tdDescription}`}>
                  {editId === prize.prize_id ? (
                    <input
                      type="text"
                      value={editedData.prize_description}
                      onChange={(e) => handleInputChange(e, 'prize_description')}
                      className={styles.input}
                    />
                  ) : (
                    prize.prize_description
                  )}
                </td>
                <td className={styles.td}>
                  {editId === prize.prize_id ? (
                    <input
                      type="number"
                      value={editedData.quantity}
                      onChange={(e) => handleInputChange(e, 'quantity')}
                      className={styles.input}
                    />
                  ) : (
                    prize.quantity
                  )}
                </td>
                <td className={styles.td}>
                  {editId === prize.prize_id ? (
                    <input
                      type="text"
                      value={editedData.prize_level}
                      onChange={(e) => handleInputChange(e, 'prize_level')}
                      className={styles.input}
                    />
                  ) : (
                    prize.prize_level
                  )}
                </td>
                <td className={styles.td}>
                  <img
                    src={`${API_BASE}${prize.prize_img}`}
                    alt="獎項圖片"
                    className={styles.imgClickable}
                    onClick={() => handleImageClick(prize.prize_img)}
                  />
                </td>
                <td className={styles.td}>
                  {editId === prize.prize_id ? (
                    <>
                      <button onClick={() => handleSave(prize.order)} className={styles.saveButton}>💾 保存</button>
                      <button onClick={() => setEditId(null)} className={styles.cancelButton}>❌ 取消</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(prize)} className={styles.editButton}>✏️ 編輯</button>
                      <button onClick={() => handleDelete(prize.prize_id, prize.order)} className={styles.deleteButton}>🗑 刪除</button>
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

export default PrizesSection;