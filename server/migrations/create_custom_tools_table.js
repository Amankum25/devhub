const database = require('../config/database');

async function createCustomToolsTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS custom_ai_tools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        config TEXT DEFAULT '{}',
        status TEXT DEFAULT 'active',
        last_checked DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    await database.query(createTableQuery);
    console.log('✅ Custom AI tools table created successfully');

    // Create indexes for better performance
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_custom_tools_user_id ON custom_ai_tools(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_custom_tools_type ON custom_ai_tools(type)',
      'CREATE INDEX IF NOT EXISTS idx_custom_tools_status ON custom_ai_tools(status)'
    ];

    for (const indexQuery of indexQueries) {
      await database.query(indexQuery);
    }

    console.log('✅ Custom AI tools indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating custom tools table:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  createCustomToolsTable()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createCustomToolsTable };
