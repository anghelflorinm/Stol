const loginModel = require('../model/loginModel')
const utilStol = require('../util/utilStol')


async function createUser(data, res) {
    res.setHeader('Content-Type', 'aplication/json');
    const userInfo = JSON.parse(data.buffer);

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
    const userInfo = JSON.parse(data.buffer);

    if ((!userInfo.hasOwnProperty('username') && !userInfo.hasOwnProperty('email')) || !userInfo.hasOwnProperty('password')) {
        utilStol.jsonAndSend(res, 400, 'This request is missing one of the username, email or login fields');
    }
    let responseObject = await loginModel.loginUser(userInfo);

    utilStol.jsonResponse(res, responseObject);
}


module.exports = { createUser, login };