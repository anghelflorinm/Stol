const mongoSingelton = require('./mongoSingleton')
const { ObjectID } = require('mongodb');
const utilStol = require('../util/utilStol');
const authModel = require('./authModel');
const https = require('https');
const MAX_PART_SIZE = 10 * 1024 * 1024;

/*EXPORTS*/
async function insertFile(userInfo, fileInfo) {
    let responseObject = { code: 201, message: 'Successfully created!' };
    let existingFile = await mongoSingelton.filesDB.findOne({ "filename": fileInfo.filename, "user_id": ObjectID(userInfo._id) });

    if (existingFile != null) {
        if (!existingFile.created) {
            responseObject = utilStol.getResponseObject(201, 'You have created this file, but you have not uploaded it!');
            responseObject.file_id = existingFile._id.toHexString();
            return responseObject;
        }
        return utilStol.getResponseObject(409, 'You already have a file with this name already!');
    }

    let result = await mongoSingelton.filesDB.insertOne({ "filename": fileInfo.filename, "created": false, "user_id": ObjectID(userInfo._id) });
    if (result == null) {
        return utilStol.getResponseObject(500, 'Failed creating file!');
    }
    responseObject.file_id = result.insertedId.toHexString();
    return responseObject;
}


async function uploadFile(userInfo, fileId, data) {
    let userData = await mongoSingelton.usersDB.findOne({ "_id": ObjectID(userInfo._id) });
    if (userData === null) {
        return utilStol.getResponseObject(400, "Invalid user!");
    }

    var accessTokens = {};
    var remainingSizes = {};

    var remainingTotalSize = 0;

    if (userData.hasOwnProperty('drop_box_access_token')) {
        accessTokens.drop_box = userData.drop_box_access_token;
        remainingSizes.drop_box = await getRemainingSize(accessTokens.drop_box, 'drop_box');
        remainingTotalSize += remainingSizes.drop_box;
    }

    if (userData.hasOwnProperty('google_drive_access_token')) {
        accessTokens.google_drive = await authModel.getNewAccessToken(userInfo._id, userData.google_drive_refresh_token, 'google_drive');
        remainingSizes.google_drive = await getRemainingSize(accessTokens.google_drive, 'google_drive');
        remainingTotalSize += remainingSizes.google_drive;
    }

    if (userData.hasOwnProperty('one_drive_access_token')) {
        accessTokens.one_drive = await authModel.getNewAccessToken(userInfo._id, userData.one_drive_refresh_token, 'one_drive');
        remainingSizes.one_drive = await getRemainingSize(accessTokens.one_drive, 'one_drive');
        remainingTotalSize += remainingSizes.one_drive;
    }

    if (remainingTotalSize < data.headers['content-length']) {
        return utilStol.getResponseObject(507, "Not enough space to store this file!");
    }

    var partNumber = 1;
    var currentStorageIndex = 0;

    while (!accessTokens.hasOwnProperty(storageApiNames[currentStorageIndex])) {
        currentStorageIndex = currentStorageIndex + 1;
    }


    var nextSize = Math.min(MAX_PART_SIZE, remainingSizes[storageApiNames[currentStorageIndex]]);

    var currentBuffer = Buffer.from('');
    data.request.on('data', chunk => {
        if (currentBuffer.length + chunk.length > nextSize) {
            var remainSize = nextSize - currentBuffer.length;
            currentBuffer = Buffer.concat([currentBuffer, chunk.slice(0, remainSize)]);

            /*
                de facut ceva cu fisierul aici
            */
            remainingSizes[storageApiNames[currentStorageIndex]] = remainingSizes[storageApiNames[currentStorageIndex]] - nextSize;

            partNumber = partNumber + 1;

            currentStorageIndex = (currentStorageIndex + 1) % 3;

            while (!accessTokens.hasOwnProperty(storageApiNames[currentStorageIndex])) {
                currentStorageIndex = currentStorageIndex + 1;
            }

            nextSize = Math.min(MAX_PART_SIZE, remainingSizes[storageApiNames[currentStorageIndex]]);

            currentBuffer = Buffer.from('');
            currentBuffer = Buffer.concat(currentBuffer, chunk.slice(remainSize));

        } else {
            currentBuffer = Buffer.concat([currentBuffer, chunk]);
        }

    });

    data.request.on('end', () => {
        return;
    });

    let responseObject = { code: 201, message: 'Successfully created!' };
    return responseObject;

}

var storageApiNames = ['google_drive', 'one_drive', 'drop_box'];

/*EXPORTS*/

async function getRemainingSize(accessToken, tokenType) {
    return new Promise(function(resolve, reject) {
        const bearer = 'Bearer ' + accessToken;
        var options = {
            method: 'GET',
            headers: { 'Authorization': bearer }
        };

        switch (tokenType) {
            case 'google_drive':
                options.host = 'www.googleapis.com';
                options.path = '/drive/v2/about?';
                break;
            case 'one_drive':
                options.host = 'graph.microsoft.com';
                options.path = '/v1.0/me/drive';
                break;
            case 'drop_box':
                options.method = 'POST';
                options.host = 'api.dropboxapi.com';
                options.path = '/2/users/get_space_usage';
                break;
        }

        var req = https.request(options, (response) => {
            let jsonString = '';
            response.on('data', (chunk) => {
                jsonString += chunk;
            });

            response.on('end', () => {
                console.log(jsonString);
                if (response.statusCode == 200) {
                    quotaInfo = JSON.parse(jsonString);
                    let result;
                    switch (tokenType) {
                        case 'google_drive':
                            result = quotaInfo.quotaBytesTotal - quotaInfo.quotaBytesUsed;
                            break;
                        case 'one_drive':
                            result = quotaInfo.quota.remaining;
                            break;
                        case 'drop_box':
                            result = quotaInfo.allocation.allocated - quotaInfo.used;
                            break;
                    }
                    resolve(result);
                }
            });
        });

        req.end();
    });
}

module.exports = { insertFile, uploadFile };