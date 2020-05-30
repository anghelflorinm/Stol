const loginModel = require('../model/loginModel')
const utilStol = require('../util/utilStol')
const fs = require('fs');
const jwt = require('jsonwebtoken')


async function getUserInfo(data, res) {
    res.setHeader('Content-Type', 'aplication/json');
    utilStol.jsonAndSend(res, 200, "Valid User!");
}

module.exports = { getUserInfo };