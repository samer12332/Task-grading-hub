const {blacklist} = require('../utils/generateJWT');
const appError = require('../utils/appError');

const isTokenRevoked = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if(blacklist.has(token)) {
        next(appError.create('Token has been revoked', 401, 'fail'));
        return;
    }
    next();
}

module.exports = isTokenRevoked;