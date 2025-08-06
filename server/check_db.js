const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function checkDatabase() {
  try {
    const db = await open({
      filename: './data/devhub.db',
      driver: sqlite3.Database,
    });

    console.log('Connected to SQLite database');

    // Get all tables
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables:', tables.map(t => t.name));

    // Check users table
    const userCount = await db.get("SELECT COUNT(*) as count FROM users");
    console.log('Users count:', userCount.count);

    // Check posts table if exists
    try {
      const postCount = await db.get("SELECT COUNT(*) as count FROM posts");
      console.log('Posts count:', postCount.count);
    } catch (err) {
      console.log('Posts table does not exist');
    }

    // Check other tables
    for (const table of tables) {
      if (table.name !== 'users' && table.name !== 'posts') {
        try {
          const count = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`);
          console.log(`${table.name} count:`, count.count);
        } catch (err) {
          console.log(`Error checking ${table.name}:`, err.message);
        }
      }
    }

    await db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase();
