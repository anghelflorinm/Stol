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


function loginGD() {

    const clientId = '548858930550-ln302roit3f05309k1r8ef653kgb3i8v.apps.googleusercontent.com';
    const scope = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file'
    const redirectUri = 'https://localhost:3000/auth/google_drive';

    const requestUri = 'https://accounts.google.com/o/oauth2/v2/auth?' + 'response_type=code&client_id=' + encodeURI(clientId) + '&redirect_uri=' + encodeURI(redirectUri) +
        '&scope=' + encodeURI(scope) + '&access_type=offline&state=' + encodeURI(window.localStorage.getItem('stol_token'));
    window.location = requestUri;

}

function loginOD() {
    const clientId = 'c3b5e5ee-a351-4e62-bd79-349c94392eb9';
    const scope = 'profile openid offline_access files.readwrite.all'
    const redirectUri = 'https://localhost:3000/auth/one_drive';

    const requestUri = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?' + 'response_type=code&client_id=' + encodeURI(clientId) + '&redirect_uri=' + encodeURI(redirectUri) +
        '&scope=' + encodeURI(scope) + '&access_type=offline&state=' + encodeURI(window.localStorage.getItem('stol_token'));
    window.location = requestUri;

}

function loginDB() {
    const clientId = 'qybmd5ubhol6mai';
    const redirectUri = 'https://localhost:3000/auth/drop_box';

    const requestUri = 'https://www.dropbox.com/oauth2/authorize?' + 'response_type=code&client_id=' + encodeURI(clientId) + '&redirect_uri=' + encodeURI(redirectUri) +
        '&state=' + encodeURI(window.localStorage.getItem('stol_token'));
    window.location = requestUri;
}