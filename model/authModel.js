const mongoSingelton = require('./mongoSingleton');
const { ObjectID } = require('mongodb')

async function setToken(userInfo, tokenJson, token_type) {
    const accessString = token_type + '_access_token';
    const refreshString = token_type + '_refresh_token';
    await mongoSingelton.usersDB.updateOne({
        [accessString]: null,
        [refreshString]: null,
        _id: ObjectID(userInfo._id)
    }, {
        $set: {
            [accessString]: tokenJson.access_token,
            [refreshString]: tokenJson.refresh_token
        }
    }, { upsert: true });
    return;
}


module.exports = { setToken }