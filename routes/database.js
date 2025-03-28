const express = require('express');
const mysql = require('mysql2');
const ExcelJS = require('exceljs'); // 引入 exceljs
const multer = require('multer');
const path = require('path');
const router = express.Router();

//之後需要移除
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0000',
  database: 'draw',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');
});

//檢視所有參與者
router.get('/allparticipants', (req, res) => {
  const query = 'SELECT * FROM participants';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

//檢視特定參與者
router.post('/searchparticipants', (req, res) => {
  const { name, email, phone_number } = req.body;
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

  const query = `SELECT * FROM participants WHERE ${conditions.join(' AND ')}`;
  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

//新增參與者
router.post('/addparticipants', (req, res) => {
  const { name, email, phone_number } = req.body;
  const query = 'INSERT INTO participants (name, email, phone_number) VALUES (?, ?, ?)';
  db.query(query, [name, email, phone_number], (err, result) => {
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

// // 修改參與者的名字
// router.put('/updateparticipant/name', (req, res) => {
//   const { id, name } = req.body;

//   if (!id) {
//     return res.status(400).send('Participant ID is required.');
//   }
//   if (!name) {
//     return res.status(400).send('Name is required.');
//   }

//   const query = `
//     UPDATE draw.participants
//     SET name = ?
//     WHERE id = ?
//   `;
//   db.query(query, [name, id], (err, result) => {
//     if (err) {
//       console.error('Error updating name:', err);
//       return res.status(500).send('Error updating name.');
//     }
//     res.json({ message: 'Name updated successfully', result });
//   });
// });

// // 修改參與者的email
// router.put('/updateparticipant/email', (req, res) => {
//   const { id, email } = req.body;

//   if (!id) {
//     return res.status(400).send('Participant ID is required.');
//   }
//   if (!email) {
//     return res.status(400).send('Email is required.');
//   }

//   const query = `
//     UPDATE draw.participants
//     SET email = ?
//     WHERE id = ?
//   `;
//   db.query(query, [email, id], (err, result) => {
//     if (err) {
//       console.error('Error updating email:', err);
//       return res.status(500).send('Error updating email.');
//     }
//     res.json({ message: 'Email updated successfully', result });
//   });
// });

// // 修改參與者的電話號碼
// router.put('/updateparticipant/phone', (req, res) => {
//   const { id, phone_number } = req.body;

//   if (!id) {
//     return res.status(400).send('Participant ID is required.');
//   }
//   if (!phone_number) {
//     return res.status(400).send('Phone number is required.');
//   }

//   const query = `
//     UPDATE draw.participants
//     SET phone_number = ?
//     WHERE id = ?
//   `;
//   db.query(query, [phone_number, id], (err, result) => {
//     if (err) {
//       console.error('Error updating phone number:', err);
//       return res.status(500).send('Error updating phone number.');
//     }
//     res.json({ message: 'Phone number updated successfully', result });
//   });
// });

// //搜尋參與者
// router.get("/search", (req, res) => {
//   const { query } = req.query;
//   if (!query) {
//     return res.status(400).json({ error: "Query parameter is required" });
//   }
//   const sql = "SELECT * FROM draw.participants WHERE name LIKE ?";
//   const values = [`%${query}%`];

//   db.query(sql, values, (error, results) => {
//     if (error) {
//       console.error("Database query error:", error);
//       return res.status(500).json({ error: "Database query failed" });
//     }
//     res.json(results);
//   });
// });

//檢視所有獎項
router.get('/allprizes', (req, res) => {
  const query = 'SELECT * FROM draw.prize';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// 新增獎項
router.post('/addprizes', (req, res) => {
  const { name, description, level, quantity, image } = req.body; // 新增 image

  if (!name || !description || !level || !quantity || !image) {
    return res.status(400).send('所有欄位都是必填的');
  }

  const query = `
    INSERT INTO draw.prize (prize_name, prize_description, prize_level, quantity, prize_img)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [name, description, level, quantity, image], (err, result) => {
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
    return res.status(400).send('Prize ID 和數量是必填的');
  }

  const query = `
    UPDATE draw.prize
    SET quantity = quantity - ?
    WHERE prize_id = ? AND quantity >= ?;
  `;

  db.query(query, [quantity, prize_id, quantity], (err, result) => {
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

//檢視中獎資訊
router.get('/draw', (req, res) => {
  const query = 'SELECT * FROM draw';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
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

// 記錄抽獎資訊
router.post('/record-draw', (req, res) => {
  const { draw_time, participants_id, prize_id } = req.body;

  if (!draw_time || !participants_id || !prize_id) {
    return res.status(400).send('所有欄位都是必填的');
  }

  const query = `
    INSERT INTO draw.draw (draw_time, participants_id, prize_id)
    VALUES (?, ?, ?)
  `;

  db.query(query, [draw_time, participants_id, prize_id], (err, result) => {
    if (err) {
      console.error('Error recording draw:', err);
      return res.status(500).send('記錄失敗');
    }
    res.json({ insertId: result.insertId });
  });
});

// 匯出中獎資訊為 Excel
router.get('/export-draw', async (req, res) => {
  try {
    const query = 'SELECT * FROM draw';
    db.query(query, async (err, results) => {
      if (err) {
        console.error('Error fetching draw data:', err);
        return res.status(500).send('Error fetching draw data');
      }

      // 創建 Excel 工作簿和工作表
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Draw Results');

      // 添加表頭
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Draw Time', key: 'draw_time', width: 20 },
        { header: 'Participant ID', key: 'participants_id', width: 15 },
        { header: 'Prize ID', key: 'prize_id', width: 15 },
      ];

      // 添加數據
      results.forEach((row) => {
        worksheet.addRow(row);
      });

      // 設置回應頭，讓瀏覽器下載檔案
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=draw_results.xlsx'
      );

      // 將 Excel 檔案寫入回應
      await workbook.xlsx.write(res);
      res.end();
    });
  } catch (error) {
    console.error('Error exporting draw data:', error);
    res.status(500).send('Error exporting draw data');
  }
});

//檢視活動
router.get('/allactivity', (req, res) => {
  const query = 'SELECT * FROM activity.activity';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// 新增活動
router.post('/addactivitie', (req, res) => {
  const { name, performer, start_time, end_time, description } = req.body;

  if (!name || !performer || !start_time || !end_time || !description) {
    return res.status(400).send('所有欄位都是必填的');
  }

  const query = `
    INSERT INTO activity.activity (activity_name, performer, start_time, end_time, description)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [name, performer, start_time, end_time, description], (err, result) => {
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
    UPDATE activity.activity
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

  const query = 'DELETE FROM activity.activity WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting activity:', err);
      return res.status(500).send('刪除失敗');
    }
    res.send('活動刪除成功');
  });
});

// router.delete('/delactivitie', (req, res) => {
//   const { id } = req.body;

//   if (!id) {
//     return res.status(400).send('ID is required for deletion.');
//   }

//   // 禁用安全模式
//   db.query('SET SQL_SAFE_UPDATES = 0;', (err) => {
//     if (err) return res.status(500).send('Error disabling safe updates');

//     // 執行刪除操作
//     const deleteQuery = 'DELETE FROM activity.activity WHERE activity_id = ?';
//     db.query(deleteQuery, [id], (err, result) => {
//       if (err) return res.status(500).send('Error deleting activity');

//       if (result.affectedRows === 0) {
//         return res.status(404).send('Activity not found.');
//       }

//       // 開啟安全模式
//       db.query('SET SQL_SAFE_UPDATES = 1;', (safeModeErr) => {
//         if (safeModeErr) return res.status(500).send('Error enabling safe updates');
//         res.send(`Activity with ID ${id} deleted successfully.`);
//       });
//     });
//   });
// });


// 簡易抽獎
router.get('/random-winner', (req, res) => {
  const quantity = parseInt(req.query.quantity, 10) || 1;
  const allowRepeatWin = req.query.allowRepeatWin == 'true'; // 接收前端的參數

  // 根據 allowRepeatWin 決定查詢條件
  const statusCondition = allowRepeatWin ? "WHERE status IN ('valid', 'won')" : "WHERE status = 'valid'";
  const query = `SELECT * FROM draw.participants ${statusCondition} ORDER BY RAND() LIMIT ${quantity};`;

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
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

module.exports = router;
