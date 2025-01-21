const appError = require("../utils/appError");

module.exports = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            const error = appError.create('FORBIDDEN: Not allowed for this account', 403, 'fail');
            return next(error);
        }
        next();
    }
}