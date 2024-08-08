const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

// CORSを有効にする
app.use(cors());

// データベース接続
const db = new sqlite3.Database('./schedule.db');

// ボディのパースを有効にする
app.use(express.json());

// データベースの初期化
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT
  )`);
});

// 予定の追加
app.post('/api/schedules', (req, res) => {
    const { title, description, date, time } = req.body;
  
    if (!title || !date) {
        return res.status(400).json({ error: 'Title and date are required' });
    }
  
    db.run(`INSERT INTO schedules (title, description, date, time) VALUES (?, ?, ?, ?)`,
        [title, description, date, time],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to add   schedule' });
            }
            res.status(201).json({ id: this.lastID });
        }
    );
});

// 予定の取得
app.get('/api/schedules', (req, res) => {
  db.all(`SELECT * FROM schedules`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// 予定の更新
app.put('/api/schedules/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, date, time } = req.body;
  
    if (!title || !date) {
        return res.status(400).json({ error: 'Title and date are required' });
    }
  
    db.run(`UPDATE schedules SET title = ?, description = ?, date = ?, time = ? WHERE id = ?`,
        [title, description, date, time, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update schedule' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Schedule not found' });
            }
            res.json({ changes: this.changes });
        }
    );
});

// 予定の削除
app.delete('/api/schedules/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM schedules WHERE id = ?`, id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ changes: this.changes });
  });
});

// サーバーの起動
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
