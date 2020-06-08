const mongoSingelton = require('./mongoSingleton');
const { ObjectID } = require('mongodb')
const https = require('https');

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

async function getNewAccessToken(userId, refreshToken, tokenType) {
    return new Promise(function(resolve, reject) {

        var redirectUri = 'https://localhost:3000/auth/' + tokenType;
        let clientSecret = '';
        let clientId = '';
        var options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        };

        switch (tokenType) {
            case 'google_drive':
                clientSecret = 'H-10foGOt4wCPIO4YrrcTPbq';
                clientId = '548858930550-ln302roit3f05309k1r8ef653kgb3i8v.apps.googleusercontent.com';
                options.host = 'oauth2.googleapis.com';
                options.path = '/token';
                break;
            case 'one_drive':
                clientSecret = 'DCzFbpd_wmJ.J1.I5B64Lz4tFDe3__Nff1';
                clientId = 'c3b5e5ee-a351-4e62-bd79-349c94392eb9';
                options.host = 'login.microsoftonline.com'
                options.path = '/common/oauth2/v2.0/token';
                break;
        }
        const formString = 'client_id=' + encodeURIComponent(clientId) + '&client_secret=' + encodeURIComponent(clientSecret) + '&redirect_uri=' +
            encodeURIComponent(redirectUri) + '&refresh_token=' + encodeURIComponent(refreshToken) + '&grant_type=refresh_token';

        options.headers['Content-Length'] = Buffer.byteLength(formString);

        var req = https.request(options, (response) => {
            let jsonString = '';
            response.on('data', (chunk) => {
                jsonString += chunk;
            });

            response.on('end', () => {
                console.log(jsonString);
                if (response.statusCode == 200) {
                    var tokenJson = JSON.parse(jsonString);
                    const accessString = tokenType + '_access_token';
                    const refreshString = tokenType + '_refresh_token';
                    mongoSingelton.usersDB.updateOne({ _id: ObjectID(userId) }, {
                        $set: {
                            [accessString]: tokenJson.access_token,

                        }
                    });

                    if (tokenType === 'one_drive') {
                        mongoSingelton.usersDB.updateOne({ _id: ObjectID(userId) }, {
                            $set: {
                                [refreshString]: tokenJson.refresh_token,

                            }
                        });
                    }
                    return resolve(tokenJson.access_token);
                }

            });
        });

        req.write(formString);
        req.end();
    });
}


module.exports = { setToken, getNewAccessToken }