const mongoSingelton = require('./mongoSingleton')
const crypto = require('crypto');
const utilStol = require('../util/utilStol');
const fs = require('fs');
const jwt = require('jsonwebtoken')

/*MODEL-EXPORTS-BEGIN*/
async function insertUser(userInfo) {
    let responseObject = { code: 201, message: 'Successfully Inserted' };

    let newUserCheck = await containsUser(userInfo);

    if (!(newUserCheck)) {
        return utilStol.getResponseObject(409, 'There already exists a user with this username or this email!');
    }
    let passwordHash = crypto.createHash('sha256').update(userInfo.password).digest('hex');

    await mongoSingelton.usersDB.insertOne({ "email": userInfo.email, "username": userInfo.username, "password": passwordHash });

    let loginInfo = await loginUser(userInfo);
    var token = loginInfo.token;
    responseObject.token = token;

    return responseObject;
}


async function loginUser(userInfo) {

    let responseObject = { code: 200, message: 'Authentication Successful!!!' };
    let passwordHash = crypto.createHash('sha256').update(userInfo.password).digest('hex');
    let result = await mongoSingelton.usersDB.findOne({ $or: [{ "username": userInfo.username }, { "email": userInfo.email }], "password": passwordHash });
    if (result == null) {
        return utilStol.getResponseObject(401, 'Wrong username/email or password');
    }

    let userData = { _id: result._id.toHexString(), username: result.username, email: result.email };

    let privateKey = fs.readFileSync('./key.pem', 'utf8');

    let token = jwt.sign(userData, privateKey, { algorithm: 'HS256', expiresIn: '2h' });

    responseObject.token = token;
    return responseObject;

}

module.exports = { insertUser, loginUser };
/*MODEL-EXPORTS-END*/


async function containsUser(userInfo) {
    return new Promise(function(resolve, reject) {
        mongoSingelton.usersDB.findOne({ $or: [{ "username": userInfo.username }, { "email": userInfo.email }] }, (err, result) => {
            if (err) throw err;

            if (result != null) {
                resolve(false);
            }
            resolve(true);
        })
    });
}