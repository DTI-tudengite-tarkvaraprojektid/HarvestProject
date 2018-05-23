
window.onload = function () {
  isLoggedIn()
}

function isLoggedIn () {
  ajaxGet('isLoggedIn', function (response) {
    if (response.loggedIn) {
      loggedIn(){
    } else {
      login() 
    }
  })
}

function login(){
  loadHTML('content', 'views/login.html', function(){
    let button = document.getElementById('loginButton') 
    button.addEventListener('click', function(event){
      let userName = document.getElementsByName('username').value
      let passWord = document.getElementsByName('password').value
      let data = new FormData()
      data.append('username', userName)
      data.append('password', passWord)
      ajaxPost('login', data, function(response){
        if(response.succsess){
          loggedIn()
        } else {
          let loginError = document.getElementById('errorDiv')
          loginError.innerHTML = 'Vale kasutajanimi või parool!'
        }
      })
    })
  })
}

function loggedIn(){
  loadHTML('content', 'views/joinedScreen.html', function () {

  })
}