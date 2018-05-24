
window.onload = function () {
  isLoggedIn()
}

function isLoggedIn () {
  ajaxGet('isLoggedIn', function (response) {
    console.log(response)
    if (response.loggedIn) {
      loggedIn()
    } else {
      login()
    }
  })
}

function login () {
  loadHTML('content', 'views/login.html', function () {
    let button = document.getElementById('loginButton')
    button.addEventListener('click', function (event) {
      let userName = document.getElementById('username').value
      let passWord = document.getElementById('password').value
      let data = new FormData()
      data.append('username', userName)
      data.append('password', passWord)
      ajaxPost('login', data, function (response) {
        if (response.succsess) {
          loggedIn()
        } else {
          let loginError = document.getElementById('errorDiv')
          loginError.innerHTML = 'Vale kasutajanimi või parool!'
        }
      })
    })
  })
}

function loggedIn () {
  loadHTML('content', 'views/joinedScreen.html', function () {

  })
  loadHTML('content', 'views/panel.html', function () {

  })
}

function showView (view, toView) {
  let X = document.getElementById(view)
  let Y = document.getElementById(toView)
  X.style.display = 'none'
  Y.style.display = 'block'
}
