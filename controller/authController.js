const loginModel = require('../model/loginModel')
const utilStol = require('../util/utilStol')
const fs = require('fs');
const http = require('https');
const authModel = require('../model/authModel');


const accountPage = 'https://localhost:3000/account'

async function requestToken(data, res) {
    const code = data.queryString.code;
    const userInfo = data.user;
    var redirectUri = 'https://localhost:3000/auth/' + data.tokenType;;
    let clientSecret = '';
    let clientId = '';

    var options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': 'x-ms-gateway-slice=prod; stsservicecookie=ests; fpc=AqLc_0SKjnRDj_AZjLorfX4WNXUuAQAAAANdZdYOAAAA' }
    };

    switch (data.tokenType) {
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
        case 'drop_box':
            clientSecret = 'q2pwy99um4v2nlo';
            clientId = 'qybmd5ubhol6mai';
            options.host = 'api.dropboxapi.com';
            options.path = '/oauth2/token';
            break;
    }

    const formString = 'code=' + encodeURIComponent(code) + '&client_id=' + encodeURIComponent(clientId) + '&client_secret=' + encodeURIComponent(clientSecret) + '&redirect_uri=' +
        encodeURIComponent(redirectUri) + '&grant_type=authorization_code';

    options.headers['Content-Length'] = Buffer.byteLength(formString);
    var req = http.request(options, (response) => {
        let jsonString = '';
        response.on('data', (chunk) => {
            jsonString += chunk;
        });

        response.on('end', () => {
            console.log(jsonString);
            if (response.statusCode == 200) {
                authModel.setToken(userInfo, JSON.parse(jsonString), data.tokenType);
            }

            res.setHeader('Location', accountPage);
            res.writeHead(302);
            res.end();

        });
    });

    req.write(formString);
    req.end();
}


module.exports = { requestToken }