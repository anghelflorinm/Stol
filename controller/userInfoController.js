const loginModel = require('../model/loginModel')
const utilStol = require('../util/utilStol')
const fs = require('fs');
const jwt = require('jsonwebtoken')
const userInfoModel = require('../model/userInfoModel');

async function getUserInfo(data, res) {
    res.setHeader('Content-Type', 'aplication/json');
    const userInfo = data.user;
    var responseObject = await userInfoModel.getUserInfo(userInfo);
    utilStol.jsonResponse(res, responseObject);

}

async function getSize(data, res) {
    res.setHeader('Content-Type', 'aplication/json');
    const userInfo = data.user;
    var responseObject = await userInfoModel.getSize(userInfo);
    utilStol.jsonResponse(res, responseObject);
    return;
}

module.exports = { getUserInfo, getSize };