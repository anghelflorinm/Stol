var x = document.getElementById("login");
var y = document.getElementById("register");
var z = document.getElementById("btn");

function register() {
    x.style.left = "-400px";
    y.style.left = "50px";
    z.style.left = "110px";
}

function login() {
    x.style.left = "50px";
    y.style.left = "450px";
    z.style.left = "0";
}

function submitLogin() {
    const xhr = new XMLHttpRequest();
    var userInfo = { username: document.getElementById("loginUsername").value, password: document.getElementById("loginPassword").value };
    const url = '/api/login';
    xhr.open('POST', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                window.localStorage.setItem('stol_token', response.token);
                var f = document.createElement("form");
                f.setAttribute('method', "get");
                f.setAttribute('action', '/home');
                f.setAttribute('type', 'hidden');
                document.body.appendChild(f);
                f.submit();
            } else {

                document.getElementById("demo").innerHTML = "wrong username or password";
            }

        } else {

        }
    }
    xhr.send(JSON.stringify(userInfo));
}