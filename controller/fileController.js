const utilStol = require('../util/utilStol')
const fileModel = require('../model/fileModel')

async function createFile(data, res) {
    res.setHeader('Content-Type', 'aplication/json');
    const userInfo = data.user;
    var fileInfo;
    try {

        fileInfo = JSON.parse(data.buffer);
    } catch (e) {
        utilStol.jsonAndSend(res, 400, 'Invalid JSON format!');
        return;
    }

    if (!fileInfo.hasOwnProperty('filename')) {
        utilStol.jsonAndSend(res, 400, 'JSON body reqires a filename field!');
        return;
    }

    let responseObject = await fileModel.insertFile(userInfo, fileInfo);
    return utilStol.jsonResponse(res, responseObject);
}

async function uploadFile(data, res) {
    res.setHeader('Content-Type', 'aplication/json');
    const userInfo = data.user;
    const fileId = data.fileId;
    let responseObject = await fileModel.uploadFile(userInfo, fileId, data);
    utilStol.jsonResponse(res, responseObject);
}

async function getFile(data, res) {
    res.setHeader('Content-Type', 'application/octet-stream');
    const userInfo = data.user;
    const fileId = data.fileId;
    fileModel.downloadFile(userInfo, fileId, res);
}

async function deleteFile(data, res) {
    res.setHeader('Content-Type', 'aplication/json');
    const userInfo = data.user;
    const fileId = data.fileId;
    let responseObject = await fileModel.deleteFile(userInfo, fileId, data);
    utilStol.jsonResponse(res, responseObject);
}

module.exports = { createFile, uploadFile, getFile, deleteFile }