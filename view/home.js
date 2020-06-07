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

    createRequest.onreadystatechange = function() {
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
    }).then(res => {
        if (res.status === 201) {
            var ul = document.getElementById('dynamic_files');

            var listItem = document.createElement("li");

            listItem.setAttribute("id", file_id);

            var downbtn = document.createElement("button");
            var delbtn = document.createElement("button");

            downbtn.className = "download-btn";
            downbtn.textContent = "DOWNLOAD";

            delbtn.className = "delete-btn";
            delbtn.textContent = "DELETE";

            downbtn.onclick = function() {
                console.log(this.parentElement);

                /*const createRequest = new XMLHttpRequest();
                createRequest.open('GET', '/api/download-file/' + files[i]._id);
                createRequest.setRequestHeader('Authorization', 'Bearer ' + loginData.token);*/
                //console.log(this.parentElement.getElementsByClassName('dynamic-btn'));
                //console.log(this.parentElement.getElementsByClassName('dynamic-btn')[0].innerText);
                const url = '/api/download-file/' + this.parentElement.id;
                const authHeader = 'Bearer ' + loginData.token;
                const options = {
                    headers: {
                        Authorization: authHeader
                    }
                };

                fetch(url, options).then(res => res.blob()).then(blob => {
                    var file = window.URL.createObjectURL(blob);
                    var filename = this.parentElement.getElementsByClassName('dynamic-btn')[0].innerText;
                    var a = document.createElement("a");
                    a.style = "display: none";
                    document.body.appendChild(a);
                    a.href = file;
                    a.download = filename;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                    //window.location.assign(filename);
                })
            };

            delbtn.onclick = function() {
                console.log(this.parentElement);
                const url = '/api/delete-file/' + this.parentElement.id;
                const authHeader = 'Bearer ' + loginData.token;
                const options = {
                    method: 'DELETE',
                    headers: {
                        Authorization: authHeader
                    }
                };
                fetch(url, options);
                this.parentElement.remove();

            };

            listItem.innerHTML = "<button class=\"dynamic-btn\">" + fileObject.name + "</button>";
            ul.appendChild(listItem);
            listItem.appendChild(downbtn);
            listItem.appendChild(delbtn);
            //alert('finished!');
        }
    });



}