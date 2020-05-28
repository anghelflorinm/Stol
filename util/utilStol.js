function jsonAndSend(res, code, errorString) {
    res.writeHead(code);
    let responseJson = { message: errorString };
    res.write(JSON.stringify(responseJson));
    res.end();
}

function getResponseObject(code, messageString) {
    return { code: code, message: messageString };
}

function jsonResponse(res, responseObject) {
    res.writeHead(responseObject.code);
    responseObject.code = undefined;
    res.write(JSON.stringify(responseObject));
    res.end();
}

module.exports = { jsonResponse, getResponseObject, jsonAndSend }