const utilStol = require('../util/utilStol')
const adminModel = require('../model/adminModel')

async function getUsers(data, res) {
    const userInfo = data.user;
    var responseObject = await adminModel.getUsers(userInfo);
    utilStol.jsonResponse(res, responseObject);
}

async function grantAdmin(data, res) {
    const userID = data.userId;
    const userInfo = data.user;
    var responseObject = await adminModel.setAdmin(userInfo, userID, true);
    utilStol.jsonResponse(res, responseObject);
}

async function revokeAdmin(data, res) {
    const userID = data.userId;
    const userInfo = data.user;
    var responseObject = await adminModel.setAdmin(userInfo, userID, false);
    utilStol.jsonResponse(res, responseObject);
}


async function deleteUser(data, res) {
    const userID = data.userId;
    const userInfo = data.user;
    var responseObject = await adminModel.deleteUser(userInfo, userID);
    utilStol.jsonResponse(res, responseObject);
}
module.exports = { getUsers, grantAdmin, revokeAdmin, deleteUser }