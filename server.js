require('dotenv').config(); // 載入 .env 文件
const HOST = process.env.HOST || 'localhost'; // 環境變數 HOST 預設為 localhost
const PORT = process.env.PORT || 3001; // 環境變數 PORT 預設為 3001
// if (!process.env.SECRET_KEY) {
//   console.error("環境變數未加載成功！");
// } else {
//   console.log("環境變數加載成功，密鑰為：", process.env.SECRET_KEY);
// }

const express = require('express');
const cors = require('cors');
const { router: authRoutes } = require('./routes/auth');
const databaseRoutes = require('./routes/database');
const adminRoutes = require('./routes/admin');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 設定視圖引擎為 EJS
app.set('view engine', 'ejs');

// 靜態文件夾
app.use(express.static('public'));

// 確保用戶路由存在（例如 /user/data）
app.get('/user/data', (req, res) => {
  res.json({ message: 'This is user data.' });
});

app.use('/auth', authRoutes);
app.use('/database', databaseRoutes);
app.use('/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// 處理未匹配的路由
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 注意去.env 設定
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
