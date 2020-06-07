const mongoSingelton = require('./mongoSingleton');
const utilStol = require('../util/utilStol');
const fileModel = require('./fileModel')
const authModel = require('./authModel')
const { ObjectID } = require('mongodb')


async function getUserInfo(userInfo) {
    var fullData = await mongoSingelton.usersDB.findOne({ "_id": ObjectID(userInfo._id) });

    if (fullData == null) {
        return utilStol.getResponseObject(404, 'This user is no longer found here!');
    }

    var connected_google_drive, connected_one_drive, connected_drop_box;


    if (fullData.hasOwnProperty('google_drive_access_token')) connected_google_drive = true;
    else connected_google_drive = false;

    if (fullData.hasOwnProperty('one_drive_access_token')) connected_one_drive = true;
    else connected_one_drive = false;

    if (fullData.hasOwnProperty('drop_box_access_token')) connected_drop_box = true;
    else connected_drop_box = false;


    var filesData = await mongoSingelton.filesDB.find({ "user_id": ObjectID(userInfo._id), "created": true }).toArray();
    var dataSize = await mongoSingelton.filesDB.stats({ indexDetails: true });


    var responseObject = {};
    var files = [];



    for (var i in filesData) {
        var item = filesData[i];

        files.push({
            "filename": filesData[i].filename,
            "_id": filesData[i]._id.toHexString()

        });
    }

    responseObject.code = 200;
    responseObject.username = fullData.username;
    responseObject.email = fullData.email;
    responseObject.connected_google_drive = connected_google_drive;
    responseObject.connected_one_drive = connected_one_drive;
    responseObject.connected_drop_box = connected_drop_box;
    responseObject.files = files;
    responseObject.size = dataSize.size

    return responseObject;
}

async function getSize(userInfo) {
    var userData = await mongoSingelton.usersDB.findOne({ "_id": ObjectID(userInfo._id) });

    if (userData == null) {
        return utilStol.getResponseObject(404, 'This user is no longer found here!');
    }
    let remainingSizes = {};
    let accessTokens = {};

    if (userData.hasOwnProperty('drop_box_access_token')) {
        accessTokens.drop_box = userData.drop_box_access_token;
        remainingSizes.drop_box = await fileModel.getRemainingSize(accessTokens.drop_box, 'drop_box');
    }

    if (userData.hasOwnProperty('google_drive_access_token')) {
        accessTokens.google_drive = await authModel.getNewAccessToken(userInfo._id, userData.google_drive_refresh_token, 'google_drive');
        remainingSizes.google_drive = await fileModel.getRemainingSize(accessTokens.google_drive, 'google_drive');
    }

    if (userData.hasOwnProperty('one_drive_access_token')) {
        accessTokens.one_drive = await authModel.getNewAccessToken(userInfo._id, userData.one_drive_refresh_token, 'one_drive');
        remainingSizes.one_drive = await fileModel.getRemainingSize(accessTokens.one_drive, 'one_drive');
    }
    remainingSizes.code = 200;
    return remainingSizes;
}

module.exports = { getUserInfo, getSize };