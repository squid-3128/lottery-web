const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    console.error('Error: SECRET_KEY is undefined.');
    return res.status(500).json({ error: 'Internal server error' });
}

// 管理端驗證中間件
function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // 從 Authorization 標頭中提取 Bearer Token
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Not an admin.' });
    }
    req.user = decoded; // 將解碼後的資訊附加到請求物件
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
}

router.get('/user/data', (req, res) => {
  res.json({ message: 'Public user data', data: { someUserInfo: 'value' } });
});

module.exports = {
  router,
  authenticateAdmin,
};
