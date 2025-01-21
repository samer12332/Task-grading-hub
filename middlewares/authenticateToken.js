const appError = require("../utils/appError");
const jwt = require('jsonwebtoken');


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        next(appError.create('Unauthorized: Token is missing', 401, 'fail'));
        return;
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            next(appError.create('Forbidden: Invalid token', 403, 'fail'));
            return;
        }
        req.user = user;
    });
    next();
}

module.exports = authenticateToken;