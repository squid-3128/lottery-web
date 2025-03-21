const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticateAdmin } = require('./auth'); // 確保正確導入

const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    console.error('Error: SECRET_KEY is undefined.');
    return res.status(500).json({ error: 'Internal server error' });
}

//之後需要移除
const admin = { username: 'admin', password: 'admin123' };

// 管理端登入 API
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === admin.username && password === admin.password) {
    const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// 管理端資料 API
router.get('/data', authenticateAdmin, (req, res) => {
  res.json({ message: 'Admin data', data: { someAdminInfo: 'value' } });
});

module.exports = router;
