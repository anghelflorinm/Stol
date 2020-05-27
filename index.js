const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');
const fs = require('fs');
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };

const hostname = 'localhost';
const port = 3000;

const server = https.createServer(options,function(req, res) {
    
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
        buffer: {}
    }

    if (requestPath.startsWith('api')) {

    } else {
        //servim aici un template pt web
        serveFrontend(data, res);
    }
    
});


server.listen(port, hostname, () => {
    console.log("Server listening at port " + port.toString());
});

function serveFrontend(data, res) {
    if (data.method != 'GET') {
        responseErrorCodeAndSend(res, 405);
        return;
    }

    if (data.requestPath === '') {
        data.requestPath = 'index.html'
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

const fileContentTypes = {

    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".txt": "text/plain",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".ico": "image/vnd.microsoft.icon"

}