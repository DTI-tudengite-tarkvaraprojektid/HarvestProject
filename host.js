let gameId
window.onload = function () {
  isLoggedIn()
}

function isLoggedIn () {
  ajaxGet('isLoggedIn', function (response) {
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
          let loginError = document.getElementById('errorDiv')
          loginError.innerHTML = 'Vale kasutajanimi või parool!'
        }
      })
    })
  })
}

function loggedIn () {
  loadHTML('content', 'views/panel.html', function () {
    let createGameButton = document.getElementById('createGame')
    createGameButton.addEventListener('click', function (event) {
      ajaxGet('createGame', function (response) {
        if (response.id && response.gameCode) {
          gameId = response.id
          let gameCode = response.gameCode
          switchView('create-view', 'start-view')
          document.getElementById('gameCode').innetHTML = gameCode
        } else {
          alert('Viga mängu loomisel')
        }
      })
    })
  })
}

function switchView (view, toView) {
  let currentView = document.getElementById(view)
  let newView = document.getElementById(toView)
  currentView.style.display = 'none'
  newView.style.display = 'block'
}
