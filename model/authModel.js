const mongoSingelton = require('./mongoSingleton');
const { ObjectID } = require('mongodb')

async function setToken(userInfo, tokenJson, token_type) {
    const accessString = token_type + '_access_token';
    const refreshString = token_type + '_refresh_token';
    if (tokenJson.refresh_token === undefined) {
        tokenJson.refresh_token = '';
    }
    mongoSingelton.usersDB.updateOne({
        [accessString]: null,
        [refreshString]: null,
        _id: ObjectID(userInfo._id)
    }, {
        $set: {
            [accessString]: tokenJson.access_token,
            [refreshString]: tokenJson.refresh_token
        }
    });
}


module.exports = { setToken }