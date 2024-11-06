// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

exports.register = async (req, res) => {
    const { name, email, password, phone } = req.body;
    console.log(req.body)
    const userexists = await User.findByEmail(email);
    if(!userexists){
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await User.create({ name, email, password: hashedPassword, phone });
        res.redirect('/auth/login');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
}else{
    res.status(401).send("email already exists plz go back and try it with different email")
}
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    const user = await User.findByEmail(email);
    console.log(user,"email found")
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/');
    } else {
        res.status(401).send('Invalid email or password');
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
};
