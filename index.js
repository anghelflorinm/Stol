const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mongoSingleton = require('./model/mongoSingleton')

const loginController = require('./controller/loginController')
const fileController = require('./controller/fileController');
const userInfoController = require('./controller/userInfoController');
const authController = require('./controller/authController');

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const hostname = 'localhost';
const apiPath = 'api';
const authPath = 'auth'
const port = 3000;



const server = https.createServer(options, async function(req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    let parsedURL = url.parse(req.url, true);

    let requestPath = parsedURL.pathname;

    requestPath = requestPath.replace(/^\/+|\/+$/g, "");

    let queryString = parsedURL.query;
    let headers = req.headers;
    let method = req.method;



    let data = {
        requestPath: requestPath,
        queryString: queryString,
        headers: headers,
        method: method,
        buffer: '',
        request: req
    }

    if (requestPath.startsWith(apiPath)) {
        requestPath = requestPath.substr(apiPath.length + 1);
        var splitPath = requestPath.split('/');
        if (data.method === 'POST') {
            if (requestPath === 'create-user') {
                data.buffer = await getBodyData(req);
                loginController.createUser(data, res);
                return;
            }
            if (requestPath === 'login') {
                data.buffer = await getBodyData(req);
                loginController.login(data, res);
                return;
            }
            if (requestPath === 'create-file') {
                data.buffer = await getBodyData(req);
                loginController.isAuthorized(data, res, fileController.createFile);
                return;
            }
            if (requestPath.startsWith('upload-file') && splitPath.length === 2) {
                //data.buffer = await getBodyData(req);
                data.fileId = splitPath[1];
                loginController.isAuthorized(data, res, fileController.uploadFile);
                return;
            }
        }
        if (data.method === 'GET') {
            if (requestPath === 'get-user-info') {
                data.buffer = await getBodyData(req);
                loginController.isAuthorized(data, res, userInfoController.getUserInfo);
                return;
            }
            if (requestPath.startsWith('download-file') && splitPath.length === 2) {
                data.fileId = splitPath[1];
                loginController.isAuthorized(data, res, fileController.getFile);
                return;
            }
            if (requestPath === 'get-size') {
                loginController.isAuthorized(data, res, userInfoController.getSize);
                return;
            }
        }
        if (data.method === 'DELETE') {
            if (requestPath.startsWith('delete-file') && splitPath.length === 2) {
                data.fileId = splitPath[1];
                loginController.isAuthorized(data, res, fileController.deleteFile);
                return;
            }
        }
    }

    if (requestPath.startsWith(authPath)) {
        requestPath = requestPath.substr(authPath.length + 1);


        if (data.method === 'GET') {
            if (requestPath === 'google_drive') {
                data.tokenType = requestPath;
                loginController.isAuthorized(data, res, authController.requestToken);
                return;
            }
            if (requestPath === 'one_drive') {
                data.tokenType = requestPath;
                loginController.isAuthorized(data, res, authController.requestToken);
                return;
            }
            if (requestPath === 'drop_box') {
                data.tokenType = requestPath;
                loginController.isAuthorized(data, res, authController.requestToken);
                return;
            }
        }
    }



    //servim aici un template pt web
    serveFrontend(data, res);

});


server.listen(port, hostname, () => {
    mongoSingleton.init();
    console.log("Server listening at port " + port.toString());
});

function serveFrontend(data, res) {
    if (data.method != 'GET') {
        responseErrorCodeAndSend(res, 405);
        return;
    }

    if (data.requestPath === '') {
        data.requestPath = 'home.html'
    }

    var filePath = './view/' + data.requestPath;

    var extension = path.extname(filePath);

    if (extension === '') {
        filePath += '.html';
        extension = '.html';
    }



    fs.exists(filePath, function(exists) {
        if (!exists) {
            notFound(res);
            return;
        }

        if (extension in fileContentTypes) {
            res.setHeader("Content-Type", fileContentTypes[extension]);
        } else {
            res.setHeader("Content-Type", fileContentTypes[".txt"]);
        }

        fs.createReadStream(filePath).pipe(res);
    });
}


function responseErrorCodeAndSend(res, code) {
    res.writeHead(code);
    res.end();
}

function notFound(res) {
    res.setHeader('Content-Type', 'text/html');
    fs.createReadStream('./view/not_found.html').pipe(res);
    res.writeHead(404);
}

function getBodyData(req) {
    return new Promise(function(resolve, reject) {
        let buffer = '';
        req.on('data', chunk => {
            buffer += chunk.toString(); // convert Buffer to string
            console.log(chunk.toString())
        });
        req.on('end', () => {
            resolve(buffer);
        });
    })
}

const fileContentTypes = {

    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".txt": "text/plain",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".ico": "image/vnd.microsoft.icon"

}