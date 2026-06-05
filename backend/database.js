const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./football_points.db");

function addColumnIfMissing(table, column, definition) {
  db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {
    if (err) return console.log(err.message);

    const exists = rows.some((r) => r.name === column);

    if (!exists) {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (err) => {
        if (err) console.log(err.message);
      });
    }
  });
}

db.serialize(() => {
  db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,

    full_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    country TEXT NOT NULL,
    yugo_email TEXT NOT NULL,
    phone_number TEXT NOT NULL,

    device_id TEXT,
    points INTEGER DEFAULT 5000,
    is_active INTEGER DEFAULT 1,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stage TEXT DEFAULT 'Group Stage',
      group_name TEXT DEFAULT '',
      team_a TEXT NOT NULL,
      team_b TEXT NOT NULL,
      venue TEXT DEFAULT '',
      match_time TEXT NOT NULL,
      prediction_open TEXT NOT NULL,
      prediction_close TEXT NOT NULL,
      result TEXT DEFAULT NULL,
      status TEXT DEFAULT 'open'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      match_id INTEGER,
      selected_team TEXT NOT NULL,
      points_used INTEGER NOT NULL,
      settled INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, match_id)
    )
  `);

  addColumnIfMissing("matches", "stage", "TEXT DEFAULT 'Group Stage'");
  addColumnIfMissing("matches", "group_name", "TEXT DEFAULT ''");
  addColumnIfMissing("matches", "venue", "TEXT DEFAULT ''");

addColumnIfMissing("users", "full_name", "TEXT");
addColumnIfMissing("users", "room_number", "TEXT");
addColumnIfMissing("users", "country", "TEXT");
addColumnIfMissing("users", "yugo_email", "TEXT");
addColumnIfMissing("users", "phone_number", "TEXT");

addColumnIfMissing("matches", "settled_at", "TEXT");
addColumnIfMissing("matches", "settlement_message", "TEXT");

});

module.exports = db;

