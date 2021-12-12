window.onload = () => {

    document.getElementById('btnGetData').addEventListener("click", getdata);
    document.getElementById('btnLogin').addEventListener("click", login);
    document.getElementById('btnLogout').addEventListener("click", logout);
    document.getElementById('btnRegister').addEventListener("click", register)
    document.getElementById('switch-btn').addEventListener("click", switchSecurity)
    document.getElementById('upload-picture').addEventListener("click", uploadPicture)
};

const JWT_TOKEN = 'jwt'

function getToken() {
    return localStorage.getItem(JWT_TOKEN)
}

function storeToken(jwt) {
    localStorage.setItem(JWT_TOKEN, jwt)
}

function removeToken() {
    localStorage.removeItem(JWT_TOKEN);
}

function showLoginForm(show) {
    if (show) {
        document.getElementsByClassName('login-form')[0].style.display = "block";
        document.getElementById('btnLogout').style.display = "none";
    }
    else {
        document.getElementsByClassName('login-form')[0].style.display = "none";
        document.getElementById('btnLogout').style.display = "block";
    }
}

function showUploadPictureForm(show) {
    if (show) {
        document.getElementsByClassName('upload-picture-form')[0].style.display = "block"
    } else {
        document.getElementsByClassName('upload-picture-form')[0].style.display = "none"
    }
}

function showPicturesList(show) {
    if (show) {
        document.getElementsByClassName('pictures-list-content')[0].style.display = "block"
    } else {
        document.getElementsByClassName('pictures-list-content')[0].style.display = "none"
    }
}

showLoginForm(getToken() === undefined || getToken() === null);
renderPictures(getToken() === undefined || getToken() === null)


const serverUri = /*process.env.APP_URL ||*/ "http://localhost:4080"

function logout() {
    document.getElementById('content').innerHTML = '';
    removeToken();
    showLoginForm(true);
    showUploadPictureForm(false)
    showPicturesList(false)
}

function register() {

    document.getElementById('content').innerHTML = ''
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    axios.post(`${serverUri}/register`, { username, password })
        .then(res => {
            login()
        })
        .catch(function (error) {
            document.getElementById('content').innerHTML = error;
        });
}

function login() {

    document.getElementById('content').innerHTML = '';
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    axios.post(`${serverUri}/login`, { username, password })
        .then(res => {
            const jwt = res.data
            storeToken(jwt);
            showLoginForm(false);
            showUploadPictureForm(true)
            renderPictures()
            showPicturesList(true)
        })
        .catch(function (error) {
            document.getElementById('content').innerHTML = error;
        });


}

function getdata() {
    document.getElementById('content').innerHTML = '';
    axios.get(`${serverUri}/protected`, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    })
        .then(function (response) {
            document.getElementById('content').innerHTML = JSON.stringify(response.data);
        })
        .catch(function (error) {
            document.getElementById('content').innerHTML = error;
        });
}

function switchSecurity() {
    const doSwitch = confirm("If you switch security setting all users and pictures will be deleted")
    if (doSwitch) {
        axios.post(`${serverUri}/secure`, {})
            .then((res) => {
                document.getElementById('security-value').innerHTML = `app is secured: ${res.data}`
                logout()
            })
            .catch((err) => {
                document.getElementById('content').innerHTML = err;
            })
    }

}

function uploadPicture() {
    const src = document.getElementById('picture-url').value
    const name = document.getElementById('picture-name').value
    axios.post(`${serverUri}/pictures`,
        { picture: { src: src, name: name } },
        { headers: { Authorization: `Bearer ${getToken()}` } })
        .then(() => {
            location.reload()
        })
        .catch((err) => {
            document.getElementById('content').innerHTML = err;
        })

    renderPictures()
}

function renderPictures() {
    let pictures = []
    axios.get('/pictures', { headers: { Authorization: `Bearer ${getToken()}` } })
        .then((res) => {
            pictures = res.data
            let pictureItem = ''
            for (let picture of pictures) {

                console.log(picture)
                pictureItem = `
                    ${pictureItem}
                    <li>
                    <img src="${picture.src}" alt="${picture.name}">
                    </li>
                    `
            }

            const a = document.getElementsByClassName("pictures-list")[0].innerHTML = pictureItem

        })
        .catch((err) => {
            document.getElementById('content').innerHTML = err;
        })

}