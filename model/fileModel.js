const mongoSingelton = require('./mongoSingleton')
const { ObjectID } = require('mongodb');
const utilStol = require('../util/utilStol');
const authModel = require('./authModel');
const https = require('https');
const EventEmitter = require('events');
const crypto = require('crypto');
const url = require('url');

const MAX_PART_SIZE = 1024 * 1024;



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
    return new Promise(function(resolve, reject) {
        var partNumber = 1;
        var currentStorageIndex = 0;

        var accessTokens = {};
        var remainingSizes = {};

        var remainingTotalSize = 0;

        var maxChunkIndex = 0;

        var currentBuffer = Buffer.from('');
        var nextSize;
        var currentPosition = 0;

        const eventEmitter = new EventEmitter();

        var finished = false;

        data.request.on('data', async function(chunk) {
            var currentChunkIndex = maxChunkIndex;
            maxChunkIndex = maxChunkIndex + 1;
            if (currentChunkIndex === 0) {

                let userData = await mongoSingelton.usersDB.findOne({ "_id": ObjectID(userInfo._id) });
                if (userData === null) {
                    resolve(utilStol.getResponseObject(400, "Invalid user!"));
                    return;
                }

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



                while (!accessTokens.hasOwnProperty(storageApiNames[currentStorageIndex])) {
                    currentStorageIndex = currentStorageIndex + 1;
                }
                nextSize = Math.min(MAX_PART_SIZE, remainingSizes[storageApiNames[currentStorageIndex]]);
                currentBuffer = Buffer.alloc(nextSize);
            }

            eventEmitter.on(('chunk' + currentChunkIndex.toString()), function handleChunk() {
                setTimeout(function() {
                    if (currentPosition + chunk.length > nextSize) {

                        var remainSize = nextSize - currentPosition;
                        currentBuffer.fill(chunk, currentPosition, currentPosition + remainSize);
                        currentPosition += remainSize;
                        /*
                            de facut ceva cu fisierul aici
                        */
                        switch (storageApiNames[currentStorageIndex]) {
                            case 'drop_box':
                                uploadPartDropbox(fileId, partNumber, currentBuffer, accessTokens.drop_box, currentPosition);
                                break;
                            case 'google_drive':
                                uploadPartGoogleDrive(fileId, partNumber, currentBuffer, accessTokens.google_drive, currentPosition);
                                break;
                            case 'one_drive':
                                uploadPartOneDrive(fileId, partNumber, currentBuffer, accessTokens.one_drive, currentPosition);
                                break;
                        }

                        remainingSizes[storageApiNames[currentStorageIndex]] = remainingSizes[storageApiNames[currentStorageIndex]] - nextSize;

                        partNumber = partNumber + 1;

                        currentStorageIndex = (currentStorageIndex + 1) % 3;

                        while (!accessTokens.hasOwnProperty(storageApiNames[currentStorageIndex])) {
                            currentStorageIndex = currentStorageIndex + 1;
                        }

                        nextSize = Math.min(MAX_PART_SIZE, remainingSizes[storageApiNames[currentStorageIndex]]);

                        currentBuffer = Buffer.alloc(nextSize);
                        currentPosition = 0;

                        bytesWritten = chunk.copy(currentBuffer, 0, remainSize, );

                        currentPosition += bytesWritten;

                    } else {
                        currentBuffer.fill(chunk, currentPosition, currentPosition + chunk.length);
                        currentPosition += chunk.length;
                    }
                    console.log('chunk' + (currentChunkIndex + 1).toString());
                    eventEmitter.removeListener(('chunk' + currentChunkIndex), handleChunk);
                    eventEmitter.emit('chunk' + (currentChunkIndex + 1).toString());

                    if (finished && (maxChunkIndex - 1) == currentChunkIndex) {
                        switch (storageApiNames[currentStorageIndex]) {
                            case 'drop_box':
                                uploadPartDropbox(fileId, partNumber, currentBuffer, accessTokens.drop_box, currentPosition);
                                break;
                            case 'google_drive':
                                uploadPartGoogleDrive(fileId, partNumber, currentBuffer, accessTokens.google_drive, currentPosition);
                                break;
                            case 'one_drive':
                                uploadPartOneDrive(fileId, partNumber, currentBuffer, accessTokens.one_drive, currentPosition);
                                break;
                        }
                        let responseObject = { code: 201, message: 'Successfully created!' };
                        mongoSingelton.filesDB.updateOne({ _id: ObjectID(fileId) }, { $set: { created: true, 'nr_parts': partNumber } });
                        resolve(responseObject);
                        return;
                    }
                });

            });

            if (currentChunkIndex === 0) {
                eventEmitter.emit('chunk0');
            }

        });
        data.request.on('end', () => {
            finished = true;
        });


    });

}

var storageApiNames = ['one_drive', 'drop_box', 'google_drive'];

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

async function uploadPartDropbox(fileId, filePart, contentBuffer, accessToken, bufferSize) {
    const bearer = 'Bearer ' + accessToken;
    const md5Hash = crypto.createHash('md5').update(contentBuffer).digest('hex');
    var dropboxPath = '/Apps/Stol_Maceta_F_Big_John/' + md5Hash + '.stol';
    var fileMetadata = {
        path: dropboxPath,
        mode: 'add',
        autorename: true,
        mute: true,
        strict_conflict: false
    }
    var options = {
        method: 'POST',
        host: 'content.dropboxapi.com',
        path: '/2/files/upload',
        headers: { 'Content-Type': 'application/octet-stream', 'Authorization': bearer, 'Dropbox-API-Arg': JSON.stringify(fileMetadata) }
    }

    var req = https.request(options, (res) => {
        let jsonString = '';
        res.on('data', (chunk) => {
            jsonString += chunk;
        })

        res.on('end', () => {
            if (res.statusCode == 200) {
                console.log(jsonString);
                var fileInfo = JSON.parse(jsonString);
                mongoSingelton.filePartsDB.insertOne({ 'file_id': ObjectID(fileId), 'file_part': filePart, 'type': 'drop_box', 'cloud_id': fileInfo.id, 'file_hash': md5Hash });
                return;
            }
        });

    });

    req.on('error', function(err) {
        // Handle error
        console.log(err);

    });
    req.write(contentBuffer.slice(0, bufferSize), 'binary');
    req.end();
}

async function uploadPartGoogleDrive(fileId, filePart, contentBuffer, accessToken, bufferSize) {
    const bearer = 'Bearer ' + accessToken;
    const md5Hash = crypto.createHash('md5').update(contentBuffer).digest('hex');
    const fileName = md5Hash + '.stol';
    var fileMetadata = {
        'name': fileName,
        'partents': ['appDataFolder']
    }

    var options = {
        method: 'POST',
        host: 'www.googleapis.com',
        path: '/upload/drive/v3/files?uploadType=multipart',
        headers: { 'Content-Type': 'multipart/related; boundary="MACETAF"', 'Authorization': bearer }
    }
    var req = https.request(options, (res) => {
        let jsonString = '';
        res.on('data', (chunk) => {
            jsonString += chunk;
        });

        res.on('end', () => {
            console.log(jsonString);
            if (res.statusCode == 200) {
                var fileInfo = JSON.parse(jsonString);
                mongoSingelton.filePartsDB.insertOne({ 'file_id': ObjectID(fileId), 'file_part': filePart, 'type': 'google_drive', 'cloud_id': fileInfo.id, 'file_hash': md5Hash });
                return;
            }
        })
    });

    req.write('--MACETAF\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n', 'binary');
    req.write(JSON.stringify(fileMetadata, 'binary'));
    req.write('\r\n--MACETAF\r\nContent-Type: application/octet-stream\r\n\r\n', 'binary');
    req.write(contentBuffer.slice(0, bufferSize), 'binary');
    req.write('\r\n--MACETAF--');
    req.end();
}

async function uploadPartOneDrive(fileId, filePart, contentBuffer, accessToken, bufferSize) {
    const bearer = 'Bearer ' + accessToken;
    const md5Hash = crypto.createHash('md5').update(contentBuffer).digest('hex');
    const fileName = md5Hash + '.stol';
    const requestPath = '/v1.0/me/drive/special/approot:/' + fileName + ':/createUploadSession';
    var options = {
        method: 'POST',
        host: 'graph.microsoft.com',
        path: requestPath,
        headers: { 'Content-Type': 'application/json', 'Authorization': bearer }
    };
    var req = https.request(options, (res) => {
        let jsonString = '';
        res.on('data', (chunk) => {
            jsonString += chunk;
        });
        res.on('end', () => {
            console.log(jsonString);
            if (res.statusCode == 200) {
                var uploadInfo = JSON.parse(jsonString);
                uploadPartOneDriveResumable(fileId, filePart, contentBuffer, bufferSize, uploadInfo.uploadUrl, md5Hash);
            }
        })
    })
    req.end();
}

async function uploadPartOneDriveResumable(fileId, filePart, contentBuffer, bufferSize, uploadUrl, md5Hash) {
    const parsedURL = url.parse(uploadUrl, true);
    const requestPath = parsedURL.pathname;
    const requestHost = parsedURL.hostname;
    const rangeString = 'bytes 0-' + (bufferSize - 1).toString() + '/' + bufferSize.toString();
    var options = {
        method: 'PUT',
        host: requestHost,
        path: requestPath,
        headers: { 'Content-Length': bufferSize, 'Content-Range': rangeString }
    }

    var req = https.request(options, (res) => {
        let jsonString = '';
        res.on('data', (chunk) => {
            jsonString += chunk;
        });
        res.on('end', () => {
            console.log(jsonString);
            if (res.statusCode == 200 || res.statusCode == 201) {
                var fileInfo = JSON.parse(jsonString);
                mongoSingelton.filePartsDB.insertOne({ 'file_id': ObjectID(fileId), 'file_part': filePart, 'type': 'one_drive', 'cloud_id': fileInfo.id, 'file_hash': md5Hash });
            }
        })
    });

    req.on('error', function(err) {
        // Handle error
        console.log(err);

    });

    var status = req.write(contentBuffer.slice(0, bufferSize), 'binary', (error) => {
        if (error) {
            console.log(error);
        }
        //req.end();
    });
    req.end();
}

async function downloadFile(userInfo, fileId, res) {
    var userData = await mongoSingelton.usersDB.findOne({ _id: ObjectID(userInfo._id) });



    var fileInfo = await mongoSingelton.filesDB.findOne({ _id: ObjectID(fileId), 'user_id': ObjectID(userInfo._id) });

    if (fileInfo == null) {
        utilStol.jsonAndSend(res, 404, 'File not found!');
        return;
    }
    if (fileInfo.created == false) {
        utilStol.jsonAndSend(res, 404, 'File not created!');
        return;
    }

    var accessTokens = {};

    if (userData.hasOwnProperty('drop_box_access_token')) {
        accessTokens.drop_box = userData.drop_box_access_token;
    }

    if (userData.hasOwnProperty('google_drive_access_token')) {
        accessTokens.google_drive = await authModel.getNewAccessToken(userInfo._id, userData.google_drive_refresh_token, 'google_drive');
    }

    if (userData.hasOwnProperty('one_drive_access_token')) {
        accessTokens.one_drive = await authModel.getNewAccessToken(userInfo._id, userData.one_drive_refresh_token, 'one_drive');
    }



    var fileParts = await mongoSingelton.filePartsDB.find({ 'file_id': ObjectID(fileId) }).sort({ 'file_part': 1 }).toArray();
    var result = true;
    for (var i = 0; i < fileParts.length; i++) {
        switch (fileParts[i].type) {
            case "google_drive":
                result = await downloadFilePartGoogleDrive(fileParts[i].cloud_id, res, accessTokens.google_drive, fileParts[i].file_hash);
                break;
            case "one_drive":
                result = await downloadFilePartOneDrive(fileParts[i].cloud_id, res, accessTokens.one_drive, fileParts[i].file_hash);
                break;
            case "drop_box":
                result = await donwloadFilePartDropbox(fileParts[i].cloud_id, res, accessTokens.drop_box, fileParts[i].file_hash);
                break;
        }
    }
    res.end();
}

function downloadFilePartOneDrive(id, res, accessToken, requiredMd5Hash) {
    return new Promise(function(resolve, reject) {
        const bearer = 'Bearer ' + accessToken;
        const filePath = '/v1.0/me/drive/items/' + id + '/content';
        var options = {
            method: 'GET',
            host: 'graph.microsoft.com',
            path: filePath,
            headers: {
                'Authorization': bearer
            }
        }
        let ok = true;
        var req = https.request(options, (response) => {
            response.on('data', (chunk) => {

            });
            response.on('end', () => {
                if (response.statusCode == 302) {
                    /*const md5Hash = crypto.createHash('md5').update(buffer).digest('hex');
                    if (md5Hash != requiredMd5Hash) {
                        ok = false;
                    }
                    res.write(buffer, 'binary');*/
                    var redirectURL = response.headers.location;
                    const parsedURL = url.parse(redirectURL, true);
                    const requestPath = parsedURL.pathname;
                    const requestHost = parsedURL.hostname;
                    var fileRequest = https.request({ method: 'GET', host: requestHost, path: requestPath }, (fileResponse) => {
                        let buffer = Buffer.from('');
                        fileResponse.on('data', (chunk) => {
                            buffer = Buffer.concat([buffer, chunk]);
                        });
                        fileResponse.on('end', () => {
                            if (fileResponse.statusCode === 200) {
                                const md5Hash = crypto.createHash('md5').update(buffer).digest('hex');
                                if (md5Hash != requiredMd5Hash) {
                                    ok = false;
                                }
                                res.write(buffer, 'binary');
                            } else {
                                ok = false;
                            }
                            resolve(ok);
                        });

                    });
                    fileRequest.end();
                } else {
                    ok = false;
                    resolve(ok);
                }
            });
        });
        req.end();
    });
}

function donwloadFilePartDropbox(id, res, accessToken, requiredMd5Hash) {
    return new Promise(function(resolve, reject) {
        const bearer = 'Bearer ' + accessToken;
        var fileMetadata = {
            "path": id
        }

        var options = {
            method: 'POST',
            host: 'content.dropboxapi.com',
            path: '/2/files/download',
            headers: { 'Authorization': bearer, 'Dropbox-API-Arg': JSON.stringify(fileMetadata) }
        }
        var ok = true;
        var req = https.request(options, response => {
            let buffer = Buffer.from('');
            response.on('data', chunk => {
                buffer = Buffer.concat([buffer, chunk])
            });
            response.on('end', () => {
                //console.log(buffer.toString());
                if (response.statusCode === 200) {
                    const md5Hash = crypto.createHash('md5').update(buffer).digest('hex');
                    if (md5Hash != requiredMd5Hash) {
                        ok = false;
                    }
                    res.write(buffer, 'binary');
                } else {
                    ok = false;
                }
                resolve(ok);
            });
        });
        req.end();
    });
}

function downloadFilePartGoogleDrive(id, res, accessToken, requiredMd5Hash) {
    return new Promise(function(resolve, reject) {
        const bearer = 'Bearer ' + accessToken;
        const filePath = '/drive/v2/files/' + id;
        var options = {
            method: 'GET',
            host: 'www.googleapis.com',
            path: filePath,
            headers: {
                'Authorization': bearer
            }
        }
        let ok = true;
        var req = https.request(options, (response) => {
            var jsonString = '';
            response.on('data', (chunk) => {
                jsonString += chunk;
            });
            response.on('end', () => {
                console.log(jsonString);
                if (response.statusCode == 200) {
                    var responseObject = JSON.parse(jsonString);
                    var redirectURL = responseObject.downloadUrl;
                    const parsedURL = url.parse(redirectURL, true);
                    const requestPath = parsedURL.pathname + parsedURL.search;
                    const requestHost = parsedURL.hostname;
                    var fileRequest = https.request({ method: 'GET', host: requestHost, path: requestPath, headers: { 'Authorization': bearer } }, (fileResponse) => {
                        let buffer = Buffer.from('');
                        fileResponse.on('data', (chunk) => {
                            buffer = Buffer.concat([buffer, chunk]);
                        });
                        fileResponse.on('end', () => {
                            //console.log(buffer.toString());
                            if (fileResponse.statusCode === 200) {
                                const md5Hash = crypto.createHash('md5').update(buffer).digest('hex');
                                if (md5Hash != requiredMd5Hash) {
                                    ok = false;
                                }
                                res.write(buffer, 'binary');
                            } else {
                                ok = false;
                            }
                            resolve(ok);
                        });

                    });
                    fileRequest.end();
                } else {
                    ok = false;
                    resolve(ok);
                }
            });
        });
        req.end();
    });
}

module.exports = { insertFile, uploadFile, downloadFile };