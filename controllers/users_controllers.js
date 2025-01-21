const User = require('../models/users_models');
const appError = require('../utils/appError');
const bcrypt = require('bcrypt');
const {generateAccessToken, generateRefreshToken, revokeAccessToken} = require('../utils/generateJWT')
const jwt = require('jsonwebtoken');


const register = async (req, res, next) => {
    const {firstName, lastName, email, password} = req.body;
    const existingUser = await User.findOne({email});
    if(existingUser) {
        next(appError.create("user already exists", 409, 'fail'));
        return;
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPass
    });
    const accessToken = await generateAccessToken({id: newUser._id, email: newUser.email, role: newUser.role});
    const refreshToken = await generateRefreshToken({id: newUser._id, email: newUser.email, role: newUser.role});
    newUser.refreshToken = refreshToken;
    await newUser.save();
    res.status(201).json({
        status: 'success',
        message: 'User registerd successfully',
        data: {
            newUser,
            accessToken,
            refreshToken
        }
    });
}

const login = async (req, res, next) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
        next(appError.create('Email not found', 404, 'fail'));
        return;
    }
    const samePass = await bcrypt.compare(password, user.password);
    if(!samePass) {
        next(appError.create('Incorrect password', 401, 'fail'));
        return;
    }
    const accessToken = await generateAccessToken({id: user._id, email: user.email, role: user.role});
    const refreshToken = await generateRefreshToken({id: user._id, email: user.email, role: user.role});
    user.refreshToken = refreshToken;
    await user.save();
    res.status(200).json({
        status: 'success',
        message: 'Login Successful: You have successfully logged in.',
        data: {
            accessToken,
            refreshToken
        }
    })
}

const logout = async (req, res, next) => {
    console.log(req.user);
    const user = await User.findOne({_id: req.user.id});
    if(!user) {
        next(appError.create('User not found', 404, 'fail'));
        return;
    }
    user.refreshToken = '';
    await user.save();
    const token = req.headers.authorization.split(' ')[1];
    await revokeAccessToken(token);
    req.user = null;
    res.status(200).json({
        status: 'success',
        message: 'Logged out Successfully',
        data: null
    });
}

const refreshAccessToken = async (req, res, next) => {
    const {token} = req.body;
    if (!token) {
        next(appError.create('Unauthorized: Token is missing', 401, 'fail'));
        return;
    }
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if (err) {
            next(appError.create('Forbidden: Invalid token', 403, 'fail'));
            return;
        }
        const accessToken = await generateAccessToken({id: user._id, email: user.email, role: user.role});
        res.status(200).json({
            status: 'success',
            message: "Token Refresh Successful: Your access token has been successfully refreshed.",
            data: {
                accessToken
            }
        });
    });
}

const getAllUsers = async (req, res, next) => {
    const users = await User.find({});
    res.status(200).json({
        status: 'success',
        message: 'All users retrieved successfully',
        data: {
            users
        }
    });
}

const deleteUser = async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
        return next(appError.create('User not found', 404, 'fail'));
    }
    res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
        data: null
    });
}


module.exports = {
    register,
    refreshAccessToken,
    login,
    logout,
    getAllUsers,
    deleteUser
}