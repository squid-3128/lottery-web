import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // 引入 sweetalert2
import styles from './AdminDashboard.module.css';

function ActivitiesSection({ room }) {
  const [activities, setActivities] = useState([]);
  const [activityName, setActivityName] = useState('');
  const [performer, setPerformer] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const API_BASE = process.env.REACT_APP_API_BASE;

  const fetchActivities = useCallback(() => {
    axios.get(`${API_BASE}/database/allactivity?room=${room}`)
      .then(response => setActivities(response.data))
      .catch(error => console.error('Error fetching activities:', error));
  }, [room, API_BASE]);

  // 獲取所有活動
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // 新增活動
  const addActivity = async () => {
    if (!activityName || !performer || !startTime || !endTime || !description) {
      Swal.fire('錯誤', '請填寫所有欄位！', 'error');
      return;
    }

    const newActivity = {
      name: activityName,
      performer: performer,
      start_time: startTime,
      end_time: endTime,
      description: description,
      room_code: room,
    };

    try {
      const response = await axios.post(`${API_BASE}/database/addactivitie`, newActivity);
      if (response.data.insertId) {
        Swal.fire('成功', '活動新增成功！', 'success');
        fetchActivities();
        setActivityName('');
        setPerformer('');
        setStartTime('');
        setEndTime('');
        setDescription('');
      } else {
        Swal.fire('失敗', '新增失敗，請稍後再試。', 'error');
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      Swal.fire('錯誤', '新增失敗，請檢查伺服器連線。', 'error');
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
  const handleSave = async (order) => {
    const result = await Swal.fire({
      title: '確認修改',
      text: `確定要保存對活動 ID: ${order} 的修改嗎？`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '是的，保存',
      cancelButtonText: '取消',
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`${API_BASE}/database/updateactivitie`, {
          id: editId,
          name: editedData.activity_name,
          performer: editedData.performer,
          start_time: editedData.start_time,
          end_time: editedData.end_time,
          description: editedData.description
        });
        setEditId(null);
        fetchActivities();
        Swal.fire('成功', '修改已保存！', 'success');
      } catch (error) {
        console.error('Error updating activity:', error);
        Swal.fire('錯誤', '更新失敗，請稍後再試。', 'error');
      }
    }
  };

  // 刪除活動
  const handleDelete = async (id, order) => {
    const result = await Swal.fire({
      title: '確認刪除',
      text: `刪除後將無法復原，確定要刪除活動 ID: ${order} 嗎？`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '是的，刪除',
      cancelButtonText: '取消',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/database/delactivitie`, { data: { id } });
        fetchActivities();
        Swal.fire('成功', '活動已刪除！', 'success');
      } catch (error) {
        console.error('Error deleting activity:', error);
        Swal.fire('錯誤', '刪除失敗，請稍後再試。', 'error');
      }
    }
  };
  
  return (
    <div className={styles.container}>
      {/* <h2 className={styles.title}>管理活動</h2> */}
      {/* <h3 style={{ marginTop: '30px', color: '#007bff' }}>新增活動</h3> */}
      <div className={styles.form}>
        <input
          type="text"
          placeholder="活動名稱"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
          className={styles.add_input}
        />
        <input
          type="text"
          placeholder="表演者"
          value={performer}
          onChange={(e) => setPerformer(e.target.value)}
          className={styles.add_input}
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className={styles.add_input}
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className={styles.add_input}
        />
        <input
          type="text"
          placeholder="活動描述"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.add_input}
        />
        <button onClick={addActivity} className={styles.button}>➕ 新增活動</button>
      </div>

      <div className={styles.tableContainer}>
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
              <tr key={activity.order}>
                <td className={styles.td}>{activity.order}</td>
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
                <td className={`${styles.td} ${styles.tdDescription}`}>
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
                      <button onClick={() => handleSave(activity.order)} className={styles.saveButton}>💾 保存</button>
                      <button onClick={() => setEditId(null)} className={styles.cancelButton}>❌ 取消</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(activity)} className={styles.editButton}>✏️ 編輯</button>
                      <button onClick={() => handleDelete(activity.id, activity.order)} className={styles.deleteButton}>🗑 刪除</button>
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

export default ActivitiesSection;
