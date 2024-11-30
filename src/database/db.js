const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Create/connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'users.db'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        createTables();
    }
});

// Create tables and test user
function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )
    `, (err) => {
        if (err) {
            console.error('Error creating tables:', err);
        } else {
            console.log('Tables created successfully');
            // Create test user if it doesn't exist
            createTestUser();
        }
    });
}

// Create test user with encrypted password
async function createTestUser() {
    const testUser = {
        username: 'testuser',
        password: 'Test@123' // This will be encrypted
    };

    try {
        const hashedPassword = await bcrypt.hash(testUser.password, 10);
        const sql = 'INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)';
        
        db.run(sql, [testUser.username, hashedPassword], (err) => {
            if (err) {
                console.error('Error creating test user:', err);
            } else {
                console.log('Test user created or already exists');
            }
        });
    } catch (err) {
        console.error('Error hashing password:', err);
    }
}

module.exports = db;