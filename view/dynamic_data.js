const xhr = new XMLHttpRequest();
xhr.onload = function() {
    if (this.status == 200) {
        try {
            const response = JSON.parse(this.responseText);
            dynamic_data(response);
            console.log(response);

        } catch (e) {
            console.warn('Error while parsing the JSON file!');
        }

    } else {
        console.warn('Did not recieve 200 OK status!');
    }


}
xhr.open('GET', '/api/get-user-info');
xhr.setRequestHeader('Authorization', 'Bearer ' + loginData.token);
xhr.send();


function dynamic_data(response) {
    var files = response.files;

    var ul = document.getElementById("dynamic_files");
    if (ul != undefined) {
        for (var i = 0; i < files.length; i++) {
            var file_ = files[i].filename;

            var listItem = document.createElement("li");

            listItem.setAttribute("id", files[i]._id);

            var downbtn = document.createElement("button");
            var delbtn = document.createElement("button");

            downbtn.className = "download-btn";
            downbtn.textContent = "DOWNLOAD";

            delbtn.className = "delete-btn";
            delbtn.textContent = "DELETE";

            downbtn.onclick = function() {
                console.log(this.parentElement);

                const createRequest = new XMLHttpRequest();
                createRequest.open('GET', '/api/download-file/' + files[i]._id);
                createRequest.setRequestHeader('Authorization', 'Bearer ' + loginData.token);

            };

            delbtn.onclick = function() {
                console.log(this.parentElement);
                this.parentElement.remove();

            };

            listItem.innerHTML = "<button class=\"dynamic-btn\">" + file_ + "</button>";
            ul.appendChild(listItem);
            listItem.appendChild(downbtn);
            listItem.appendChild(delbtn);


        }
    }
    var dynamic_username = response.username;
    var put_dynamic_username = document.getElementById("dynamic_username");
    var usernameData = document.createElement("a");
    usernameData.textContent = dynamic_username;
    put_dynamic_username.appendChild(usernameData);


}