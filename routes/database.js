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
router.post('/someparticipants', (req, res) => {
  const { name, email, phone_number } = req.body;
  const conditions = [];
  const values = [];

  if (name) {
    conditions.push('name = ?');
    values.push(name);
  }
  if (email) {
    conditions.push('email = ?');
    values.push(email);
  }
  if (phone_number) {
    conditions.push('phone_number = ?');
    values.push(phone_number);
  }
  if (conditions.length === 0) {
    return res.status(400).send('At least one search parameter (name, email, phone_number) must be provided.');
  }

  const query = `SELECT * FROM participants WHERE ${conditions.join(' AND ')}`;
  db.query(query, values, (err, results) => {
    if (err) {
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
  const { name } = req.body;

  // 禁用安全模式
  db.query('SET SQL_SAFE_UPDATES = 0;', (err) => {
    if (err) return res.status(500).send('Error disabling safe updates');

    // 執行刪除操作
    const deleteQuery = 'DELETE FROM draw.participants WHERE name = ?';
    db.query(deleteQuery, [name], (err, result) => {
      if (err) return res.status(500).send('Error deleting participant');

      // 開啟安全模式
      db.query('SET SQL_SAFE_UPDATES = 1;', (safeModeErr) => {
        if (safeModeErr) return res.status(500).send('Error enabling safe updates');
        res.send(`Participant ${name} deleted successfully.`);
      });
    });
  });
});

//  修改參與者(待檢測)
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

// 修改參與者的名字
router.put('/updateparticipant/name', (req, res) => {
  const { id, name } = req.body;

  if (!id) {
    return res.status(400).send('Participant ID is required.');
  }
  if (!name) {
    return res.status(400).send('Name is required.');
  }

  const query = `
    UPDATE draw.participants
    SET name = ?
    WHERE id = ?
  `;
  db.query(query, [name, id], (err, result) => {
    if (err) {
      console.error('Error updating name:', err);
      return res.status(500).send('Error updating name.');
    }
    res.json({ message: 'Name updated successfully', result });
  });
});

// 修改參與者的email
router.put('/updateparticipant/email', (req, res) => {
  const { id, email } = req.body;

  if (!id) {
    return res.status(400).send('Participant ID is required.');
  }
  if (!email) {
    return res.status(400).send('Email is required.');
  }

  const query = `
    UPDATE draw.participants
    SET email = ?
    WHERE id = ?
  `;
  db.query(query, [email, id], (err, result) => {
    if (err) {
      console.error('Error updating email:', err);
      return res.status(500).send('Error updating email.');
    }
    res.json({ message: 'Email updated successfully', result });
  });
});

// 修改參與者的電話號碼
router.put('/updateparticipant/phone', (req, res) => {
  const { id, phone_number } = req.body;

  if (!id) {
    return res.status(400).send('Participant ID is required.');
  }
  if (!phone_number) {
    return res.status(400).send('Phone number is required.');
  }

  const query = `
    UPDATE draw.participants
    SET phone_number = ?
    WHERE id = ?
  `;
  db.query(query, [phone_number, id], (err, result) => {
    if (err) {
      console.error('Error updating phone number:', err);
      return res.status(500).send('Error updating phone number.');
    }
    res.json({ message: 'Phone number updated successfully', result });
  });
});


//搜尋參與者
router.get("/search", (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }
  const sql = "SELECT * FROM draw.participants WHERE name LIKE ?";
  const values = [`%${query}%`];

  db.query(sql, values, (error, results) => {
    if (error) {
      console.error("Database query error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

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

//簡易抽獎
router.get('/random-winner', (req, res) => {
  const query = 'SELECT * FROM draw.participants ORDER BY RAND() LIMIT 1;';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

module.exports = router;
