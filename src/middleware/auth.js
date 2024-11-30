const bcrypt = require('bcrypt');
const db = require('../database/db');

const auth = {
    authenticateUser: (username, password) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE username = ?';
            
            db.get(sql, [username], async (err, user) => {
                if (err) {
                    reject(err);
                } else if (!user) {
                    reject('User not found');
                } else {
                    try {
                        const match = await bcrypt.compare(password, user.password);
                        if (match) {
                            // Update last login time
                            db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
                            resolve(user);
                        } else {
                            reject('Invalid password');
                        }
                    } catch (err) {
                        reject(err);
                    }
                }
            });
        });
    },

    requireLogin: (req, res, next) => {
        if (req.session && req.session.userId) {
            next();
        } else {
            res.redirect('/');
        }
    }
};

module.exports = auth;