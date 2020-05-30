const loginModel = require('../model/loginModel')
const utilStol = require('../util/utilStol')
const fs = require('fs');
const http = require('https');
const authModel = require('../model/authModel');

const clientSecret = 'AA1Fgh73r1Zshw8Yp-KBsdaC';
const clientId = '1078202946949-6vjgaicg03i1cbpj9keebrsfg2mp2er7.apps.googleusercontent.com';
const accountPage = 'https://localhost:3000/account'

async function googleDriveRequestToken(data, res) {
    const code = data.queryString.code;
    const userInfo = data.user;
    const redirectUri = 'https://localhost:3000/auth/google-drive';

    var options = {
        host: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }

    const formString = 'code=' + encodeURI(code) + '&client_id=' + encodeURI(clientId) + '&client_secret=' + encodeURI(clientSecret) + '&redirect_uri=' + encodeURI(redirectUri) + '&grant_type=authorization_code';
    var req = http.request(options, (response) => {
        let jsonString = '';
        response.on('data', (chunk) => {
            jsonString += chunk;
        });

        response.on('end', () => {
            console.log(jsonString);
            if (response.statusCode == 200) {
                authModel.setToken(userInfo, JSON.parse(jsonString), 'googledrive')
            }
            res.setHeader('Location', accountPage);
            res.writeHead(302);
            res.end();

        });
    });
    req.write(formString);
    req.end();
}


module.exports = { googleDriveRequestToken }