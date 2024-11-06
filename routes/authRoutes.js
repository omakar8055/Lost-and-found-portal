// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
// Logout Route

// routes/authRoutes.js


module.exports = router;
