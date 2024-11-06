// models/User.js
const db = require('../config/db');

class User {
    
    static async create({ name, email, password, phone }) {
        try{
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
            [name, email, password, phone]
        );
        return result.insertId;
        }catch(error){
            console.log(error)
        }
    }

    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }
    
}

module.exports = User;
