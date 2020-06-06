const mongoSingelton = require('./mongoSingleton');
const utilStol = require('../util/utilStol');
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

    var responseObject = {};
    var files = [];



    for (var i in filesData) {
        var item = filesData[i];
        files.push({
            "filename": filesData[i].filename,
            "size": filesData[i].size
        });
    }

    responseObject.code = 200;
    responseObject.username = fullData.username;
    responseObject.email = fullData.email;
    responseObject.connected_google_drive = connected_google_drive;
    responseObject.connected_one_drive = connected_one_drive;
    responseObject.connected_drop_box = connected_drop_box;
    responseObject.files = files;

    return responseObject;
}

module.exports = { getUserInfo };