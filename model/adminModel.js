const utilStol = require('../util/utilStol');
const mongoSingelton = require('./mongoSingleton');
const userInfoModel = require('../model/userInfoModel');
const fileModel = require('./fileModel');
const { ObjectID } = require('mongodb')

async function getUsers(adminInfo) {
    var fullData = await mongoSingelton.usersDB.findOne({ "_id": ObjectID(adminInfo._id) });

    if (fullData == null) {
        return utilStol.getResponseObject(404, 'This user is no longer found here!');
    }
    if (!fullData.hasOwnProperty('admin') || fullData.admin == false) {
        return utilStol.getResponseObject(403, 'You do not have enough privileages. Please talk to Maceta F or Big John for admin permissions!');
    }

    var response = { users: [], code: 200 };

    response.users = await mongoSingelton.usersDB.find({}).toArray();

    for (var i = 0; i < response.users.length; i++) {
        response.users[i].availableSpace = await userInfoModel.getSize(response.users[i]);
        response.users[i].availableSpace.code = undefined;
        response.users[i].nrOfFiles = await mongoSingelton.filesDB.countDocuments({ user_id: response.users[i]._id });

        response.users[i].google_drive_access_token = undefined;
        response.users[i].one_drive_access_token = undefined;
        response.users[i].drop_box_access_token = undefined;
        response.users[i].google_drive_refresh_token = undefined;
        response.users[i].one_drive_refresh_token = undefined;
        response.users[i].drop_box_refresh_token = undefined;
        response.users[i].password = undefined;
        response.users[i]._id = response.users[i]._id.toHexString();
    }
    return response;
}

async function setAdmin(adminInfo, userId, value) {
    var fullData = await mongoSingelton.usersDB.findOne({ "_id": ObjectID(adminInfo._id) });

    if (fullData == null) {
        return utilStol.getResponseObject(404, 'This admin user is no longer found here!');
    }
    if (!fullData.hasOwnProperty('admin') || fullData.admin == false) {
        return utilStol.getResponseObject(403, 'You do not have enough privileages. Please talk to Maceta F or Big John for admin permissions!');
    }

    var exists = await mongoSingelton.usersDB.findOne({ "_id": ObjectID(userId) });

    if (exists == null) {
        return utilStol.getResponseObject(404, 'The user you are trying to grant permissions to no longer exists!');
    }

    await mongoSingelton.usersDB.updateOne({ _id: ObjectID(userId) }, { $set: { admin: value } });

    var response = { code: 200, message: 'Succesfully updated permissions' };

    return response;
}

async function deleteUser(adminInfo, userId, value) {
    var fullData = await mongoSingelton.usersDB.findOne({ "_id": ObjectID(adminInfo._id) });

    if (fullData == null) {
        return utilStol.getResponseObject(404, 'This admin user is no longer found here!');
    }
    if (!fullData.hasOwnProperty('admin') || fullData.admin == false) {
        return utilStol.getResponseObject(403, 'You do not have enough privileages. Please talk to Maceta F or Big John for admin permissions!');
    }

    var selectedUser = await mongoSingelton.usersDB.findOne({ "_id": ObjectID(userId) });

    if (selectedUser == null) {
        return utilStol.getResponseObject(404, 'The user you are trying to grant permissions to no longer exists!');
    }

    var files = await mongoSingelton.filesDB.find({ user_id: selectedUser._id }).toArray();

    for (var i = 0; i < files.length; i++) {
        fileModel.deleteFile(selectedUser, files[i]._id.toHexString());
    }
    mongoSingelton.usersDB.deleteOne({ "_id": ObjectID(userId) });
    return { code: 200, message: "Successfully deleted" };
}

module.exports = { getUsers, setAdmin, deleteUser };