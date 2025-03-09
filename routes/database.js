const express = require('express');
const mysql = require('mysql2');

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
  const { id, name, email, phone_number } = req.body;
  
  if (!id) {
    return res.status(400).send('Participant ID is required.');
  }

  const query = `
    UPDATE draw.participants
    SET name = ?, phone_number = ?, email = ?
    WHERE id = ?
  `;
  db.query(query, [name, phone_number, email, id], (err, result) => {
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
  const query = 'SELECT * FROM prize';
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
  const { name, description, level } = req.body;

  if (!name || !description || !level) {
    return res.status(400).send('所有欄位都是必填的');
  }

  const query = 'INSERT INTO draw.prize (prize_name, prize_description, prize_level) VALUES (?, ?, ?)';

  db.query(query, [name, description, level], (err, result) => {
    if (err) {
      console.error('Error adding prize:', err);
      return res.status(500).send('新增失敗');
    }
    res.json({ insertId: result.insertId });
  });
});

// 更新獎項
router.put('/updateprizes', (req, res) => {
  const { id, name, description, level } = req.body;

  if (!id || !name || !description || !level) {
    return res.status(400).send('所有欄位都是必填的');
  }

  const query = `
    UPDATE draw.prize 
    SET prize_name = ?, prize_description = ?, prize_level = ?
    WHERE prize_id = ?
  `;

  db.query(query, [name, description, level, id], (err, result) => {
    if (err) {
      console.error('Error updating prize:', err);
      return res.status(500).send('更新失敗');
    }
    res.send('獎項更新成功');
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


//簡易抽獎
router.get('/random-winner', (req, res) => {
  const quantity = parseInt(req.query.quantity, 10) || 1;
  const query = `SELECT * FROM draw.participants ORDER BY RAND() LIMIT ${quantity};`;
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

module.exports = router;
