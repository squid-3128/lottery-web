const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    console.error('Error: SECRET_KEY is undefined.');
    return res.status(500).json({ error: 'Internal server error' });
}

// 管理端驗證中間件
const authenticateAdmin = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  });
};

router.get('/user/data', (req, res) => {
  res.json({ message: 'Public user data', data: { someUserInfo: 'value' } });
});

module.exports = {
  router,
  authenticateAdmin,
};
