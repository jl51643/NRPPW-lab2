//require('dotenv').config()

window.onload = () => {

    document.getElementById('btnGetData').addEventListener("click", getdata);
    document.getElementById('btnLogin').addEventListener("click", login);
    document.getElementById('btnLogout').addEventListener("click", logout);
    document.getElementById('btnRegister').addEventListener("click", register)
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

function seyHello(show) {
    if (show) {
        console.log('a?')
        document.getElementById('content').innerHTML = document.getElementById('username').value
    }
}

showLoginForm(getToken() === undefined || getToken() === null);

const serverUri = /*process.env.APP_URL ||*/ "http://localhost:4080"

function logout() {
    document.getElementById('content').innerHTML = '';
    removeToken();
    showLoginForm(true);
}

function register() {

    document.getElementById('content').innerHTML = ''
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    axios.post(`${serverUri}/register`, {username, password}) 
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
    axios.post(`${serverUri}/login`, {username, password}) 
          .then(res => {
              const jwt = res.data
              storeToken(jwt);
              showLoginForm(false);
              seyHello(true)

          })
          .catch(function (error) {                          
              document.getElementById('content').innerHTML = error;           
          });  
}

function getdata() {
    document.getElementById('content').innerHTML = '';
    axios.get(`${serverUri}/protected`, { 
                headers : {
                    Authorization : `Bearer ${getToken()}`
                }
          })
         .then(function (response) {
            document.getElementById('content').innerHTML = JSON.stringify(response.data);        
        })
        .catch(function (error) {            
            document.getElementById('content').innerHTML = error;           
        });        
}

