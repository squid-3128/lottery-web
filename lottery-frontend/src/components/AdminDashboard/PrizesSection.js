import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './PrizesSection.module.css';

function PrizesSection() {
  const [prizes, setPrizes] = useState([]);
  const [prizeName, setPrizeName] = useState('');
  const [prizeDescription, setPrizeDescription] = useState('');
  const [prizeQuantity, setPrizeQuantity] = useState(''); // 新增數量欄位
  const [prizeLevel, setPrizeLevel] = useState('');
  const [editId, setEditId] = useState(null);
  const [prizeImage, setPrizeImage] = useState(''); // 新增圖片路徑狀態
  const [editedData, setEditedData] = useState({
    prize_name: '',
    prize_description: '',
    prize_level: '',
    prize_quantity: '', // 新增數量欄位
  });

  // 獲取所有獎項
  useEffect(() => {
    fetchPrizes();
  }, []);

  const fetchPrizes = () => {
    axios.get('http://localhost:3001/database/allprizes')
      .then(response => setPrizes(response.data))
      .catch(error => console.error('Error fetching prizes:', error));
  };

  // 新增獎項
  const addPrize = async () => {
    if (!prizeName || !prizeDescription || !prizeLevel || !prizeQuantity || !prizeImage) {
      alert('請填寫所有欄位並上傳圖片！');
      return;
    }
  
    const newPrize = {
      name: prizeName,
      description: prizeDescription,
      level: prizeLevel,
      quantity: prizeQuantity,
      image: prizeImage, // 傳送圖片路徑
    };
  
    try {
      const response = await axios.post('http://localhost:3001/database/addprizes', newPrize);
      if (response.data.insertId) {
        alert('獎項新增成功！');
        fetchPrizes();
        setPrizeName('');
        setPrizeDescription('');
        setPrizeLevel('');
        setPrizeQuantity('');
        setPrizeImage(''); // 清空圖片路徑
      } else {
        alert('新增失敗，請稍後再試。');
      }
    } catch (error) {
      console.error('Error adding prize:', error);
      alert('新增失敗，請檢查伺服器連線。');
    }
  };

  // 編輯模式
  const handleEdit = (prize) => {
    setEditId(prize.prize_id);
    setEditedData({ ...prize });
  };

  // 修改輸入值
  const handleInputChange = (e, field) => {
    setEditedData({ ...editedData, [field]: e.target.value });
  };

  // 保存修改
  const handleSave = async (id) => {
    try {
      await axios.put('http://localhost:3001/database/updateprizes', {
        id,
        name: editedData.prize_name,
        description: editedData.prize_description,
        level: editedData.prize_level,
        quantity: editedData.prize_quantity, // 新增數量
      });
      alert('獎項更新成功！');
      setEditId(null);
      fetchPrizes();
    } catch (error) {
      console.error('Error updating prize:', error);
      alert('更新失敗，請稍後再試。');
    }
  };

  // 刪除獎項
  const handleDelete = async (id) => {
    if (window.confirm('確定要刪除此獎項嗎？')) {
      try {
        await axios.delete('http://localhost:3001/database/delprizes', { data: { id } });
        alert('獎項刪除成功！');
        fetchPrizes();
      } catch (error) {
        console.error('Error deleting prize:', error);
        alert('刪除失敗，請稍後再試。');
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* <h2 className={styles.title}>管理獎項</h2> */}
      <h3 style={{ marginTop: '30px', color: '#007bff' }}>新增獎項</h3>
      <div className={styles.form}>
        <input
          type="text"
          placeholder="獎項名稱"
          value={prizeName}
          onChange={(e) => setPrizeName(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="獎項描述"
          value={prizeDescription}
          onChange={(e) => setPrizeDescription(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          placeholder="獎項數量"
          value={prizeQuantity}
          onChange={(e) => setPrizeQuantity(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="獎項等級"
          value={prizeLevel}
          onChange={(e) => setPrizeLevel(e.target.value)}
          className={styles.input}
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
                const response = await axios.post('http://localhost:3001/database/upload-prize-image', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });
                setPrizeImage(response.data.imagePath); // 儲存圖片路徑
                alert('圖片上傳成功！');
              } catch (error) {
                console.error('圖片上傳失敗：', error);
                alert('圖片上傳失敗，請稍後再試。');
              }
            }
          }}
          className={styles.input}
        />
        <button onClick={addPrize} className={styles.button}>➕ 新增獎項</button>
      </div>

      {/* 獎項列表 */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>ID</th>
            <th className={styles.th}>名稱</th>
            <th className={styles.th}>描述</th>
            <th className={styles.th}>數量</th> 
            <th className={styles.th}>等級</th>
            <th className={styles.th}>圖片</th>
            <th className={styles.th}>操作</th>
          </tr>
        </thead>
        <tbody>
          {prizes.map((prize) => (
            <tr key={prize.prize_id}>
              <td className={styles.td}>{prize.prize_id}</td>

              {/* 名稱欄位 */}
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

              {/* 描述欄位 */}
              <td className={styles.td}>
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

              {/* 數量欄位 */}
              <td className={styles.td}>
                {editId === prize.prize_id ? (
                  <input
                    type="number"
                    value={editedData.quantity}
                    onChange={(e) => handleInputChange(e, 'prize_quantity')}
                    className={styles.input}
                  />
                ) : (
                  prize.quantity
                )}
              </td>

              {/* 等級欄位 */}
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

              {/* 圖片欄位 */}
              <td className={styles.td}>
                <img src={`http://localhost:3001${prize.prize_img}`} alt="獎項圖片" style={{ width: '50px', height: '50px' }} />
              </td>

              {/* 操作按鈕 */}
              <td className={styles.td}>
                {editId === prize.prize_id ? (
                  <>
                    <button onClick={() => handleSave(prize.prize_id)} className={styles.saveButton}>💾 保存</button>
                    <button onClick={() => setEditId(null)} className={styles.cancelButton}>❌ 取消</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(prize)} className={styles.editButton}>✏️ 編輯</button>
                    <button onClick={() => handleDelete(prize.prize_id)} className={styles.deleteButton}>🗑 刪除</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PrizesSection;