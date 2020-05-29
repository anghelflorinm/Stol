const mongoSingelton = require('./mongoSingleton')
const { ObjectID } = require('mongodb');
const utilStol = require('../util/utilStol');

async function insertFile(userInfo, fileInfo) {
    let responseObject = { code: 201, message: 'Successfully created!' };
    let existingFile = await mongoSingelton.filesDB.findOne({ "filename": fileInfo.filename, "user_id": ObjectID(userInfo._id) });

    if (existingFile != null) {
        if (!existingFile.created) {
            responseObject = utilStol.getResponseObject(400, 'You have created this file, but you have not uploaded it!');
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

module.exports = { insertFile };