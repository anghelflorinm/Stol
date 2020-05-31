function loginGD() {

    const clientId = '1078202946949-6vjgaicg03i1cbpj9keebrsfg2mp2er7.apps.googleusercontent.com';
    const scope = 'https://www.googleapis.com/auth/drive.appdata'
    const redirectUri = 'https://localhost:3000/auth/google_drive';

    const requestUri = 'https://accounts.google.com/o/oauth2/v2/auth?' + 'response_type=code&client_id=' + encodeURI(clientId) + '&redirect_uri=' + encodeURI(redirectUri) +
        '&scope=' + encodeURI(scope) + '&access_type=offline&state=' + encodeURI(window.localStorage.getItem('stol_token'));
    window.location = requestUri;

}

function loginOD() {
    const clientId = 'c3b5e5ee-a351-4e62-bd79-349c94392eb9';
    const scope = 'profile openid offline_access onedrive.appfolder'
    const redirectUri = 'https://localhost:3000/auth/one_drive';

    const requestUri = 'https://login.live.com/oauth20_authorize.srf?' + 'response_type=code&client_id=' + encodeURI(clientId) + '&redirect_uri=' + encodeURI(redirectUri) +
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