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
    }).then(function(res) {
        if (res.status === 201) { return res.json(); }
    }).then(function(data) {

        var size_ = data.size;
        console.log(size_);

        update_progressBar(size_);
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
            update_progressBar(-size_);
            this.parentElement.remove();

        };

        listItem.innerHTML = "<button class=\"dynamic-btn\">" + fileObject.name + "</button>";
        ul.appendChild(listItem);
        listItem.appendChild(downbtn);
        listItem.appendChild(delbtn);

    });



}

function update_progressBar(response) {
    response = response / 1024 / 1024 / 1024;
    total_remaining_size = (parseFloat(total_remaining_size) - parseFloat(response));
    total_used_size = (parseFloat(total_used_size) + parseFloat(response));


    var progressBar = document.getElementById("progress_files2");
    var curText = document.getElementById("progress-text");
    var progressStats = document.getElementById("progress_stats");

    var curAvailable = total_remaining_size;

    curText.innerText = "Available Size : " + parseFloat(curAvailable).toFixed(2) + " GB";
    progressBar.setAttribute("value", parseFloat(total_used_size).toFixed(2));
    progressStats.innerText = parseFloat(total_used_size).toFixed(2) + " / " + parseFloat(total_available_size).toFixed(2) + " GB";

}