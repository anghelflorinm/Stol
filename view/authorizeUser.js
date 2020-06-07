function authorizeUser() {
    var loginData = { token: window.localStorage.getItem('stol_token') }
    if (loginData.token === null) {
        redirectToLogin();
    }
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/get-user-info');
    xhr.setRequestHeader('Authorization', 'Bearer ' + loginData.token);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {} else {
                redirectToLogin();
            }
        }
    }
    xhr.send();
}

function redirectToLogin() {
    var f = document.createElement("form");
    f.setAttribute('method', "get");
    f.setAttribute('action', '/login');
    f.setAttribute('type', 'hidden');
    document.body.appendChild(f);
    f.submit();
}

function logout() {
    window.localStorage.setItem('stol_token', null);
}

authorizeUser();