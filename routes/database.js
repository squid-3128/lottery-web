const express = require('express');
const ExcelJS = require('exceljs'); // 引入 exceljs
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('./db');

router.post('/create-room', (req, res) => {
  const { roomCode, administrator_name, password } = req.body;

  if (!roomCode || !password) {
    return res.status(400).json({ message: '房間代碼和密碼為必填項' });
  }

  const createTime = new Date().toISOString().split('T')[0]; // 格式化日期為 YYYY-MM-DD

  const query = `
    INSERT INTO room (room_code, administrator_name, password, create_time)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [roomCode, administrator_name || null, password, createTime], (err, result) => {
    if (err) {
      console.error('Error creating room:', err);
      return res.status(500).json({ message: '建立房間失敗' });
    }
    res.json({ roomCode });
  });
});

//檢視所有參與者
router.get('/allparticipants', (req, res) => {
  const roomCode = req.query.room;
  const query = 'SELECT * FROM participants WHERE room_code = ?';
  db.query(query, [roomCode], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const numberedResults = results.map((item, index) => ({
        ...item,
        order: index + 1
      }));
      res.json(numberedResults);
    }
  });
});

//檢視特定參與者
router.post('/searchparticipants', (req, res) => {
  const { name, email, phone_number, room_code } = req.body;
  const conditions = [];
  const values = [];

  if (name) {
    conditions.push('name LIKE ?');
    values.push(`%${name}%`);
  }
  if (email) {
    conditions.push('email LIKE ?');
    values.push(`%${email}%`);
  }
  if (phone_number) {
    conditions.push('phone_number LIKE ?');
    values.push(`%${phone_number}%`);
  }

  if (conditions.length === 0) {
    return res.status(400).send('至少需要提供一個搜尋條件 (姓名、Email、電話)');
  }

  const query = `SELECT * FROM participants WHERE ${conditions.join(' AND ')} AND room_code = "${room_code}"`;
  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send(err);
    }
    const numberedResults = results.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    res.json(numberedResults);
  });
});

//新增參與者
router.post('/addparticipants', (req, res) => {
  const { name, email, phone_number, room_code } = req.body;
  const query = 'INSERT INTO participants (name, email, phone_number, room_code) VALUES (?, ?, ?, ?)';
  db.query(query, [name, email, phone_number, room_code], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ message: 'Participant added successfully', result });
    }
  });
});

// 刪除參與者
router.delete('/delparticipants', (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send('ID is required for deletion.');
  }

  // 禁用安全模式
  db.query('SET SQL_SAFE_UPDATES = 0;', (err) => {
    if (err) return res.status(500).send('Error disabling safe updates');

    // 執行刪除操作
    const deleteQuery = 'DELETE FROM draw.participants WHERE id = ?';
    db.query(deleteQuery, [id], (err, result) => {
      if (err) return res.status(500).send('Error deleting participant');

      if (result.affectedRows === 0) {
        return res.status(404).send('Participant not found.');
      }

      // 開啟安全模式
      db.query('SET SQL_SAFE_UPDATES = 1;', (safeModeErr) => {
        if (safeModeErr) return res.status(500).send('Error enabling safe updates');
        res.send(`Participant with ID ${id} deleted successfully.`);
      });
    });
  });
});


//  修改參與者
router.put('/updateparticipant', (req, res) => {
  const { id, name, email, phone_number, status} = req.body;
  
  if (!id) {
    return res.status(400).send('Participant ID is required.');
  }

  const query = `
    UPDATE draw.participants
    SET name = ?, phone_number = ?, email = ?, status = ?
    WHERE id = ?
  `;
  db.query(query, [name, phone_number, email, status, id], (err, result) => {
    if (err) {
      console.error('Error updating participant:', err);
      return res.status(500).send('Error updating participant.');
    }
    res.json({ message: 'Participant updated successfully', result });
  });
});

//檢視所有獎項
router.get('/allprizes', (req, res) => {
  const roomCode = req.query.room;
  const query = 'SELECT * FROM draw.prize WHERE room_code = ?';
  db.query(query, [roomCode], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const numberedResults = results.map((item, index) => ({
        ...item,
        order: index + 1
      }));
      res.json(numberedResults);
    }
  });
});

// 新增獎項
router.post('/addprizes', (req, res) => {
  const { name, description, level, quantity, image, room_code } = req.body; // 新增 image

  if (!name || !description || !level || !quantity) {
    return res.status(400).send('所有欄位都是必填的');
  }

  if (!image){
    image = 'http://localhost:3000/uploads/default.jpg'; // 預設圖片路徑
  }

  const query = `
    INSERT INTO draw.prize (prize_name, prize_description, prize_level, quantity, prize_img, room_code)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, description, level, quantity, image, room_code], (err, result) => {
    if (err) {
      console.error('Error adding prize:', err);
      return res.status(500).send('新增失敗');
    }
    res.json({ insertId: result.insertId });
  });
});

// 更新獎項
router.put('/updateprizes', (req, res) => {
  const { id, name, description, level, quantity } = req.body;

  if (!id || !name || !description || !level || !quantity) {
    return res.status(400).send('所有欄位都是必填的');
  }

  const query = `
    UPDATE draw.prize 
    SET prize_name = ?, prize_description = ?, prize_level = ?, quantity = ?
    WHERE prize_id = ?
  `;

  db.query(query, [name, description, level, quantity, id], (err, result) => {
    if (err) {
      console.error('Error updating prize:', err);
      return res.status(500).send('更新失敗');
    }
    res.send('獎項更新成功');
  });
});

// 更新獎品數量
router.put('/update-prize-quantity', (req, res) => {
  const { prize_id, quantity } = req.body;

  if (!prize_id || quantity === undefined) {
    return res.status(400).send('缺少獎品');
  }

  const query = `
    UPDATE draw.prize
    SET quantity = quantity - ?
    WHERE prize_id = ? ${quantity > 0 ? 'AND quantity >= ?' : ''};
  `;

  const params = quantity > 0
    ? [quantity, prize_id, quantity]
    : [quantity, prize_id];

  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating prize quantity:', err);
      return res.status(500).send('更新獎品數量失敗');
    }

    if (result.affectedRows === 0) {
      return res.status(400).send('獎品數量不足或獎品不存在');
    }

    res.send('獎品數量更新成功');
  });
});

// 刪除獎項
router.delete('/delprizes', (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send('ID is required for deletion.');
  }

  // 禁用安全模式
  db.query('SET SQL_SAFE_UPDATES = 0;', (err) => {
    if (err) return res.status(500).send('Error disabling safe updates');

    // 執行刪除操作
    const deleteQuery = 'DELETE FROM draw.prize WHERE prize_id = ?';
    db.query(deleteQuery, [id], (err, result) => {
      if (err) return res.status(500).send('Error deleting prize');

      if (result.affectedRows === 0) {
        return res.status(404).send('Prize not found.');
      }

      // 開啟安全模式
      db.query('SET SQL_SAFE_UPDATES = 1;', (safeModeErr) => {
        if (safeModeErr) return res.status(500).send('Error enabling safe updates');
        res.send(`Prize with ID ${id} deleted successfully.`);
      });
    });
  });
});

// 設定 multer 儲存位置和檔名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // 圖片存放路徑
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // 確保檔名唯一
  },
});

const upload = multer({ storage });

// 圖片上傳 API
router.post('/upload-prize-image', upload.single('prize_img'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('未上傳圖片');
  }

  const imagePath = `/uploads/${req.file.filename}`; // 儲存相對路徑
  res.json({ imagePath });
});

//檢視活動
router.get('/allactivity', (req, res) => {
  const roomCode = req.query.room;
  const query = 'SELECT * FROM draw.activity WHERE room_code = ?';
  db.query(query, [roomCode], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const numberedResults = results.map((item, index) => ({
        ...item,
        order: index + 1
      }));
      res.json(numberedResults);
    }
  });
});

// 新增活動
router.post('/addactivitie', (req, res) => {
  const { name, performer, start_time, end_time, description, room_code } = req.body;

  if (!name || !performer || !start_time || !end_time || !description) {
    return res.status(400).send('所有欄位都是必填的');
  }

  const query = `
    INSERT INTO draw.activity (activity_name, performer, start_time, end_time, description, room_code)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, performer, start_time, end_time, description, room_code], (err, result) => {
    if (err) {
      console.error('Error adding activity:', err);
      return res.status(500).send('新增失敗');
    }
    res.json({ insertId: result.insertId });
  });
});

// 更新活動
router.put('/updateactivitie', (req, res) => {
  const { id, name, performer, start_time, end_time, description } = req.body;

  if (!id || !name || !performer || !start_time || !end_time || !description) {
    return res.status(400).send('所有欄位都是必填的');
  }

  const query = `
    UPDATE draw.activity
    SET activity_name = ?, performer = ?, start_time = ?, end_time = ?, description = ?
    WHERE id = ?
  `;

  db.query(query, [name, performer, start_time, end_time, description, id], (err, result) => {
    if (err) {
      console.error('Error updating activity:', err);
      return res.status(500).send('更新失敗');
    }
    res.send('活動更新成功');
  });
});


// 刪除活動
router.delete('/delactivitie', (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send('ID 是必須的');
  }

  const query = 'DELETE FROM draw.activity WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting activity:', err);
      return res.status(500).send('刪除失敗');
    }
    res.send('活動刪除成功');
  });
});

// 簡易抽獎
router.get('/random-winner', (req, res) => {
  const quantity = parseInt(req.query.quantity, 10) || 1;
  const allowRepeatWin = req.query.allowRepeatWin === 'true';
  const roomCode = req.query.room;

  if (!allowRepeatWin) {
    // 先檢查 status = 'valid' 的人數是否 >= quantity
    const countQuery = `SELECT COUNT(*) AS count FROM draw.participants WHERE status = 'valid' AND room_code = ?;`;
    db.query(countQuery, [roomCode], (countErr, countResults) => {
      if (countErr) {
        res.status(500).send(countErr);
        return;
      }

      const validCount = countResults[0].count;
      if (validCount < quantity) {
        res.status(400).json({ error: `抽獎人數不足，僅有 ${validCount} 位有效參加者。` });
        return;
      }

      // 抽獎邏輯（不可重複中獎）
      const query = `SELECT * FROM draw.participants WHERE status = 'valid' AND room_code = ? ORDER BY RAND() LIMIT ?;`;
      db.query(query, [roomCode, quantity], (err, results) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json(results);
        }
      });
    });
  } else {
    // 抽獎邏輯（可重複中獎）
    const query = `SELECT * FROM draw.participants WHERE status IN ('valid', 'won') AND room_code = ? ORDER BY RAND() LIMIT ?;`;
    db.query(query, [roomCode, quantity], (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(results);
      }
    });
  }
});


// 記錄抽獎資訊
router.post('/record-draw', (req, res) => {
  const { draw_time, participants_id, prize_id, room_code } = req.body;

  if (!draw_time || !participants_id || !prize_id) {
    return res.status(400).send('所有欄位都是必填的');
  }

  const query = `
    INSERT INTO draw.draw (draw_time, participants_id, prize_id, room_code)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [draw_time, participants_id, prize_id, room_code], (err, result) => {
    if (err) {
      console.error('Error recording draw:', err);
      return res.status(500).send('記錄失敗');
    }
    res.json({ insertId: result.insertId });
  });
});

//檢視中獎資訊
router.get('/draw', (req, res) => {
  const roomCode = req.query.room;
  const query = 'SELECT * FROM draw.draw WHERE room_code = ?';
  db.query(query, [roomCode], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const numberedResults = results.map((item, index) => ({
        ...item,
        order: index + 1
      }));
      res.json(numberedResults);
    }
  });
});

// 匯出中獎資訊為 Excel
router.get('/export-draw', async (req, res) => {
  const roomCode = req.query.room;
  try {
    const query = `
      SELECT 
        d.draw_time,
        d.result,
        p.name AS participant_name,
        p.email,
        p.phone_number,
        z.prize_name,
        z.prize_level
      FROM draw.draw d
      JOIN draw.participants p ON d.participants_id = p.id
      JOIN draw.prize z ON d.prize_id = z.prize_id
      WHERE d.room_code = ?
      ORDER BY d.id DESC
    `;

    db.query(query, [roomCode], async (err, results) => {
      if (err) {
        console.error('Error fetching draw data:', err);
        return res.status(500).send('Error fetching draw data');
      }

      // 創建 Excel 工作簿和工作表
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Draw Results');

      // 添加表頭
      worksheet.columns = [
        { header: 'No.', key: 'no', width: 8 },
        { header: 'Draw Time', key: 'draw_time', width: 50 },
        { header: 'Name', key: 'participant_name', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone Number', key: 'phone_number', width: 20 },
        { header: 'Prize Name', key: 'prize_name', width: 25 },
        { header: 'Prize Level', key: 'prize_level', width: 15 },
        { header: 'Result', key: 'result', width: 10 },
      ];

      // 添加資料列
      results.forEach((row, index) => {
        worksheet.addRow({
          no: index + 1,
          draw_time: row.draw_time.toString(),
          participants_id: row.participants_id,
          participant_name: row.participant_name,
          email: row.email,
          phone_number: row.phone_number,
          prize_id: row.prize_id,
          prize_name: row.prize_name,
          prize_level: row.prize_level,
          result: row.result,
        });
      });

      // 設置下載標頭
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=draw_results.xlsx'
      );

      // 寫入 Excel
      await workbook.xlsx.write(res);
      res.end();
    });
  } catch (error) {
    console.error('Error exporting draw data:', error);
    res.status(500).send('Error exporting draw data');
  }
});

// 更新參與者的 status
router.put('/update-participant-status', (req, res) => {
  const { id, status } = req.body;

  if (!id || !status) {
    return res.status(400).send('參與者 ID 和狀態是必填的');
  }

  const query = `
    UPDATE draw.participants
    SET status = ?
    WHERE id = ?
  `;

  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating participant status:', err);
      return res.status(500).send('更新參與者狀態失敗');
    }
    res.send('參與者狀態更新成功');
  });
});

// 更新 draw 表格的 status
router.put('/update-draw-result', (req, res) => {
  const { participants_id, prize_id, result } = req.body;

  if (!participants_id || !prize_id || !result) {
    return res.status(400).send('參與者 ID、獎品 ID 和狀態是必填的');
  }

  const query = `
    UPDATE draw.draw
    SET result = ?
    WHERE participants_id = ? AND prize_id = ?
  `;

  db.query(query, [result, participants_id, prize_id], (err, result) => {
    if (err) {
      console.error('Error updating draw result:', err);
      return res.status(500).send('更新抽獎狀態失敗');
    }
    res.send('抽獎狀態更新成功');
  });
});

// 產生隨機 6 位代碼（大寫英數）
function generateRoomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// 檢查代碼是否存在（callback）
function isCodeExists(code, callback) {
  db.query(
    'SELECT COUNT(*) AS count FROM room WHERE room_code = ?',
    [code],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].count > 0);
    }
  );
}

// 產生唯一代碼（遞迴）
function generateUniqueCode(callback, attempts = 0) {
  const code = generateRoomCode();
  isCodeExists(code, (err, exists) => {
    if (err) return callback(err);
    if (exists) {
      if (attempts >= 10) return callback(new Error('無法產生唯一房間代碼'));
      return generateUniqueCode(callback, attempts + 1);
    } else {
      return callback(null, code);
    }
  });
}

router.get('/room-code', (req, res) => {
  generateUniqueCode((err, roomCode) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: '產生房間代碼失敗' });
    }
    return res.json({ roomCode });
  });
})

// API：建立房間
router.post('/create-room', (req, res) => {
  const { roomCode, password, administrator_name } = req.body;
  if (!password) return res.status(400).json({ message: '密碼不可為空' });
  const createTime = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  db.query(
    `INSERT INTO room (room_code, administrator_name, password, create_time)
      VALUES (?, ?, ?, ?)`,
    [roomCode, administrator_name || null, password, createTime],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: '建立房間失敗' });
      }
      return res.json({ roomCode });
    }
  );
});

// 檢查房間是否已存在
router.get('/check-room', (req, res) => {
  const roomCode = req.query.room;

  if (!roomCode) {
    return res.status(400).json({ exists: false, message: '缺少 room_code' });
  }

  const query = 'SELECT COUNT(*) AS count FROM draw.room WHERE room_code = ?';
  db.query(query, [roomCode], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }

    const exists = results[0].count > 0;
    res.json({ exists });
  });
});

module.exports = router;
