const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();

function verifyToken(req, res, next) {


    req.user = { isAuthenticated: false };
    let token = req.headers.authorization?.replace(/^Bearer /, '');
    if (token) {
        try {
            token = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user.isAuthenticated = true;
            req.user.username = token.username;
        }
        catch (err) {
            const message = err instanceof jwt.TokenExpiredError ? "Expired token" : "Invalid token";
            return res.status(401).send(message);
        }
    }
    return next();
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "2m" })
}

function authenticationNeeded(req, res, next) {


    if (!req.user.isAuthenticated) {
        res.writeHead(401, { 'WWW-Authenticate': 'Bearer' });
        res.end('Authentication is needed');
    }
    else {
        next()
    }
}

module.exports = { generateAccessToken, verifyToken, authenticationNeeded }