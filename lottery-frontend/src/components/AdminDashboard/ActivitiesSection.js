import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ActivitiesSection.module.css';

function ActivitiesSection() {
  const [activities, setActivities] = useState([]);
  const [activityName, setActivityName] = useState('');
  const [performer, setPerformer] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);
  const [editedData, setEditedData] = useState({});

  // 獲取所有活動
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = () => {
    axios.get('http://localhost:3001/database/allactivity')
      .then(response => setActivities(response.data))
      .catch(error => console.error('Error fetching activities:', error));
  };

  // 新增活動
  const addActivity = async () => {
    if (!activityName || !performer || !startTime || !endTime || !description) {
      alert('請填寫所有欄位！');
      return;
    }

    const newActivity = {
      name: activityName,
      performer: performer,
      start_time: startTime,
      end_time: endTime,
      description: description
    };

    try {
      const response = await axios.post('http://localhost:3001/database/addactivitie', newActivity);
      if (response.data.insertId) {
        alert('活動新增成功！');
        fetchActivities();
        setActivityName('');
        setPerformer('');
        setStartTime('');
        setEndTime('');
        setDescription('');
      } else {
        alert('新增失敗，請稍後再試。');
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('新增失敗，請檢查伺服器連線。');
    }
  };

  // 進入編輯模式
  const handleEdit = (activity) => {
    setEditId(activity.id);
    setEditedData({ ...activity });
  };

  // 修改輸入值
  const handleInputChange = (e, field) => {
    setEditedData({ ...editedData, [field]: e.target.value });
  };

  // 保存修改
  const handleSave = async (id) => {
    try {
      await axios.put('http://localhost:3001/database/updateactivitie', {
        id,
        name: editedData.activity_name,
        performer: editedData.performer,
        start_time: editedData.start_time,
        end_time: editedData.end_time,
        description: editedData.description
      });
      alert('活動更新成功！');
      setEditId(null);
      fetchActivities();
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('更新失敗，請稍後再試。');
    }
  };

  // 刪除活動
  const handleDelete = async (id) => {
    if (window.confirm('確定要刪除此活動嗎？')) {
      try {
        await axios.delete('http://localhost:3001/database/delactivitie', { data: { id } });
        alert('活動刪除成功！');
        fetchActivities();
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('刪除失敗，請稍後再試。');
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* <h2 className={styles.title}>管理活動</h2> */}
      <h3 style={{ marginTop: '30px', color: '#007bff' }}>新增活動</h3>
      <div className={styles.form}>
        <input
          type="text"
          placeholder="活動名稱"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="表演者"
          value={performer}
          onChange={(e) => setPerformer(e.target.value)}
          className={styles.input}
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className={styles.input}
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="活動描述"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.input}
        />
        <button onClick={addActivity} className={styles.button}>➕ 新增活動</button>
      </div>

      {/* 活動列表 */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>ID</th>
            <th className={styles.th}>活動名稱</th>
            <th className={styles.th}>表演者</th>
            <th className={styles.th}>開始時間</th>
            <th className={styles.th}>結束時間</th>
            <th className={styles.th}>描述</th>
            <th className={styles.th}>操作</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id}>
              <td className={styles.td}>{activity.id}</td>

              {/* 編輯模式 - 名稱 */}
              <td className={styles.td}>
                {editId === activity.id ? (
                  <input
                    type="text"
                    value={editedData.activity_name}
                    onChange={(e) => handleInputChange(e, 'activity_name')}
                    className={styles.input}
                  />
                ) : (
                  activity.activity_name
                )}
              </td>

              {/* 編輯模式 - 表演者 */}
              <td className={styles.td}>
                {editId === activity.id ? (
                  <input
                    type="text"
                    value={editedData.performer}
                    onChange={(e) => handleInputChange(e, 'performer')}
                    className={styles.input}
                  />
                ) : (
                  activity.performer
                )}
              </td>

              {/* 編輯模式 - 開始時間 */}
              <td className={styles.td}>
                {editId === activity.id ? (
                  <input
                    type="time"
                    value={editedData.start_time}
                    onChange={(e) => handleInputChange(e, 'start_time')}
                    className={styles.input}
                  />
                ) : (
                  activity.start_time
                )}
              </td>

              {/* 編輯模式 - 結束時間 */}
              <td className={styles.td}>
                {editId === activity.id ? (
                  <input
                    type="time"
                    value={editedData.end_time}
                    onChange={(e) => handleInputChange(e, 'end_time')}
                    className={styles.input}
                  />
                ) : (
                  activity.end_time
                )}
              </td>

              {/* 編輯模式 - 描述 */}
              <td className={styles.td}>
                {editId === activity.id ? (
                  <input
                    type="text"
                    value={editedData.description}
                    onChange={(e) => handleInputChange(e, 'description')}
                    className={styles.input}
                  />
                ) : (
                  activity.description
                )}
              </td>

              {/* 操作按鈕 */}
              <td className={styles.td}>
                {editId === activity.id ? (
                  <>
                    <button onClick={() => handleSave(activity.id)} className={styles.saveButton}>💾 保存</button>
                    <button onClick={() => setEditId(null)} className={styles.cancelButton}>❌ 取消</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(activity)} className={styles.editButton}>✏️ 編輯</button>
                    <button onClick={() => handleDelete(activity.id)} className={styles.deleteButton}>🗑 刪除</button>
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

export default ActivitiesSection;
