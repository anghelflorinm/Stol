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

module.exports = { createFile }