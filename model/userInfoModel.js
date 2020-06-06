const mongoSingelton = require('./mongoSingleton');
const utilStol = require('../util/utilStol');
const { ObjectID } = require('mongodb')


async function getUserInfo(userInfo) {
    var fullData = await mongoSingelton.usersDB.findOne({ _id: ObjectID(userInfo._id) });

    if (fullData == null) {
        return utilStol.getResponseObject(404, 'This user is no longer found here!');
    }

}

module.exports = {};