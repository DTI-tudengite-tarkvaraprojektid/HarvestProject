
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
        if (response.success) {
          loggedIn()
        } else {
          let errorDiv = document.getElementById('errorDiv')
          errorDiv.innerHTML = 'Vale kasutaja nimi või parool!'
        }
      })
    })
  })
}

function loggedIn () {
  loadHTML('content', 'views/joinedScreen.html', function () {

  })
}
