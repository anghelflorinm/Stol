var loginData = { token: window.localStorage.getItem('stol_token') };

function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

var i = 0;

function move() {
    if (i == 0) {
        i = 1;
        var elem = document.getElementById("myBar");
        var width = 1;
        var id = setInterval(frame, 10);

        function frame() {
            if (width >= 100) {
                clearInterval(id);
                i = 0;
            } else {
                width++;
                elem.style.width = width + "%";
            }
        }
    }
}

document.getElementById('getFile').addEventListener('change', function createFile() {
    console.log(this.files);
    if (this.files.length === 0) {
        alert('No file selected!');
        return;
    }


    var fileId;

    var fileObject = this.files[0];


    const createRequest = new XMLHttpRequest();
    createRequest.open('POST', '/api/create-file');
    createRequest.setRequestHeader('Authorization', 'Bearer ' + loginData.token);

    createRequest.onreadystatechange = function () {
        if (createRequest.readyState === 4) {
            if (createRequest.status === 201) {
                var response = JSON.parse(createRequest.responseText);
                fileId = response.file_id;
                uploadFile(fileObject, fileId);
            }
        }
    }

    var fileData = { filename: this.files[0].name };
    createRequest.send(JSON.stringify(fileData));
});

function uploadFile(fileObject, file_id) {

    const endpoint = '/api/upload-file/' + file_id;
    const bearer = 'Bearer ' + loginData.token;
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': bearer
        },
        body: fileObject
    });


    alert('finished!');
}
