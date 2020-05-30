function loginGD() {

    const clientId = '1078202946949-6vjgaicg03i1cbpj9keebrsfg2mp2er7.apps.googleusercontent.com';
    const scope = 'https://www.googleapis.com/auth/drive.appdata'
    const redirectUri = 'https://localhost:3000/auth/google-drive';

    const requestUri = 'https://accounts.google.com/o/oauth2/v2/auth?' + 'response_type=code&client_id=' + encodeURI(clientId) + '&redirect_uri=' + encodeURI(redirectUri) +
        '&scope=' + encodeURI(scope) + '&access_type=offline&state=' + encodeURI(window.localStorage.getItem('stol_token'));
    window.location = requestUri;

}