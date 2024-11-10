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

exports.loginadmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findByEmail(email);
        console.log(user)
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true });
            // Check if user is admin
            if (user.is_admin === 1) {
                // Redirect to admin-home if admin
                res.redirect('/admin-home');
            } else {
                // Redirect to regular homepage if not admin
                res.redirect('/');
            }
        } else {
            // Render login page with error message if credentials are invalid
            res.render('login', { errorMessage: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Server error during login');
    }
};
            
            

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
};
