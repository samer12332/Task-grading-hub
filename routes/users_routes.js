const express = require('express');
const router = express.Router();
const {register, login, logout, refreshAccessToken, getAllUsers, deleteUser} = require('../controllers/users_controllers');
const {asyncHandler} = require('../middlewares/asyncHandler');
const {body} = require('express-validator');
const validator = require('../middlewares/validation');
const authenticateToken = require('../middlewares/authenticateToken');
const isTokenRevoked = require('../middlewares/revokedToken');
const allowedTo = require('../middlewares/allowedTo');

router.route('/').get(authenticateToken, isTokenRevoked, allowedTo('ADMIN'), asyncHandler(getAllUsers));

router.route('/:id').delete(authenticateToken, isTokenRevoked, allowedTo('ADMIN'), asyncHandler(deleteUser));

router.route('/register').post([
    body('firstName').notEmpty().withMessage('first name is required')
    .isLength({min: 3}).withMessage('first name must be at least 3 characters long')
    .matches(/^[A-Za-z0-9]+$/).withMessage('first name can only contain letters and numbers'),

    body('lastName').notEmpty().withMessage('last name is required')
    .isLength({min: 3}).withMessage('last name must be at least 3 characters long')
    .matches(/^[A-Za-z0-9]+$/).withMessage('last name can only contain letters and numbers'),

    body('email').notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email'),

    body('password').notEmpty().withMessage('password is required')
    .isLength({min: 8}).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase character')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase character')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[\w]/).withMessage('Password must contain at least one special character'),

    body('confirmPassword').notEmpty().withMessage('Confirm password is required')
    .custom((value, {req}) => {
        if(value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    })
], validator, asyncHandler(register));

router.route('/login').post([
    body('email').notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email'),
    
    body('password').notEmpty().withMessage('password is required')
], validator,  asyncHandler(login));

router.route('/logout').delete(authenticateToken, isTokenRevoked, asyncHandler(logout));

router.route('/token').post(asyncHandler(refreshAccessToken));

module.exports = router;