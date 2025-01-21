const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

let blacklist = new Set();

const revokeAccessToken = async (token) => {
    blacklist.add(token);
}

const generateAccessToken = async(payload) => {
    const token = await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
    return token
}

const generateRefreshToken = async(payload) => {
    const token = await jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
    return token
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    revokeAccessToken,
    blacklist
}