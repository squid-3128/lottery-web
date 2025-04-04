const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticateAdmin } = require('./auth'); // 確保正確導入
const db = require('./db');

const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    console.error('Error: SECRET_KEY is undefined.');
    return res.status(500).json({ error: 'Internal server error' });
}

//之後需要移除
// const admin = { username: 'ADMINI', password: 'admin' };

// 管理端登入 API
router.post('/login', (req, res) => {
  const { room_code, password } = req.body;

  if (!room_code || !password) {
    return res.status(400).json({ message: '房間代碼與密碼為必填項' });
  }

  const query = 'SELECT * FROM room WHERE room_code = ? AND password = ?';
  db.query(query, [room_code, password], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: '伺服器錯誤' });
    }

    if (results.length > 0) {
      const room = results[0];
      const token = jwt.sign(
        { roomId: room.id, roomCode: room.room_code, role: 'admin' },
        SECRET_KEY,
        { expiresIn: '1h' }
      );
      res.json({ token });
    } else {
      res.status(401).json({ message: '房間代碼或密碼錯誤' });
    }
  });
});


// 管理端資料 API
router.get('/data', authenticateAdmin, (req, res) => {
  res.json({ message: 'Admin data', data: { someAdminInfo: 'value' } });
});

module.exports = router;
