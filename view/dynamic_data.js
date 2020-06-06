const xhr = new XMLHttpRequest();
xhr.onload = function () {
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
            var listbtn = document.createElement("button");
            listbtn.textContent = file_;

            ul.appendChild(listItem);
            ul.appendChild(listbtn);
        }
    }
    var dynamic_username = response.username;
    var put_dynamic_username = document.getElementById("dynamic_username");
    var usernameData = document.createElement("a");
    usernameData.textContent = dynamic_username;
    put_dynamic_username.appendChild(usernameData);


}