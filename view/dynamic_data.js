const xhr = new XMLHttpRequest();
xhr.onload = function() {
    if (this.status == 200) {
        try {
            const response = JSON.parse(this.responseText);
            dynamic_data(response);
            loginInformation(response);
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

function loginInformation(response) {

    var GDaccount = response.connected_google_drive;
    var DBaccount = response.connected_drop_box;
    var ODaccount = response.connected_one_drive;

    var div1 = document.getElementById("GDA");
    var btn1 = document.createElement("button");
    if (GDaccount === true) {
        btn1.textContent = "LOGGED IN";
        btn1.setAttribute("id", "bb1");
    } else {
        btn1.textContent = "UNLOGGED";
        btn1.setAttribute("id", "bb2");
    }
    div1.appendChild(btn1);

    var div2 = document.getElementById("ODA");
    var btn2 = document.createElement("button");
    if (ODaccount === true) {
        btn2.textContent = "LOGGED IN";
        btn2.setAttribute("id", "bb1");
    } else {
        btn2.textContent = "UNLOGGED";
        btn2.setAttribute("id", "bb2");
    }
    div2.appendChild(btn2);

    var div3 = document.getElementById("DBA");
    var btn3 = document.createElement("button");
    if (DBaccount === true) {
        btn3.textContent = "LOGGED IN";
        btn3.setAttribute("id", "bb1");
    } else {
        btn3.textContent = "UNLOGGED";
        btn3.setAttribute("id", "bb2");
    }
    div3.appendChild(btn3);

}