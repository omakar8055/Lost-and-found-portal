// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.checkAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Attach user data to req
            res.locals.user = req.user; // Attach user data to res.locals for EJS templates
            console.log(req.user)
            res.locals.isAuthenticated = true; // For checking if user is logged in
        } catch (err) {
            res.locals.isAuthenticated = false;
            res.locals.user = null;
        }
    } else {
        res.locals.isAuthenticated = false;
        res.locals.user = null;
    }
    next();
};

exports.requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/auth/login'); // Redirect to login if not authenticated
    }
    next(); // Proceed if authenticated
};
