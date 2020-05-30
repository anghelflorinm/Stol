const loginModel = require('../model/loginModel')
const utilStol = require('../util/utilStol')
const fs = require('fs');
const jwt = require('jsonwebtoken')

async function createUser(data, res) {
    res.setHeader('Content-Type', 'aplication/json');
    var userInfo;

    try {
        userInfo = JSON.parse(data.buffer);
    } catch (e) {
        utilStol.jsonAndSend(res, 400, 'Invalid JSON format!');
        return;
    }

    if (!userInfo.hasOwnProperty('username') || !userInfo.hasOwnProperty('password') || !userInfo.hasOwnProperty('email')) {
        utilStol.jsonAndSend(res, 400, 'This request is missing one of the username, email or password fields');
        return;
    }

    let responseObject = await loginModel.insertUser(userInfo);

    res.writeHead(responseObject.code);
    res.write(JSON.stringify(responseObject));
    res.end();
}

async function login(data, res) {
    res.setHeader('Content-Type', 'aplication/json');
    var userInfo;

    try {
        userInfo = JSON.parse(data.buffer);
    } catch (e) {
        utilStol.jsonAndSend(res, 400, 'Invalid JSON format!');
        return;
    }

    if ((!userInfo.hasOwnProperty('username') && !userInfo.hasOwnProperty('email')) || !userInfo.hasOwnProperty('password')) {
        utilStol.jsonAndSend(res, 400, 'This request is missing one of the username, email or login fields');
    }
    let responseObject = await loginModel.loginUser(userInfo);

    utilStol.jsonResponse(res, responseObject);
}

async function isAuthorized(data, res, next) {
    const authHeader = data.headers.authorization;
    let token = authHeader && authHeader.split(' ')[1];

    if (token === undefined) {
        if (data.queryString.state === null) {
            utilStol.jsonAndSend(res, 401, 'Token is reqired to access this api.');
            return;
        }
        token = data.queryString.state;
    }

    const privateKey = fs.readFileSync('./key.pem', 'utf8');


    jwt.verify(token, privateKey, { algorithm: "HS256" }, (err, user) => {
        if (err) {
            utilStol.jsonAndSend(res, 401, 'Invalid token');
            return;
        }
        data.user = user;
        next(data, res);
    });
}


module.exports = { createUser, login, isAuthorized };