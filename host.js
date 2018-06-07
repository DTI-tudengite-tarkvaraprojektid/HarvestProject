let gameId
let playersList
let updatePlayersInterval

window.onload = function () {
  isLoggedIn()
}

function isLoggedIn () {
  ajaxGet('isLoggedIn', function (response) {
    if (response.loggedIn) {
      panel()
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
          panel()
        } else {
          let loginError = document.getElementById('errorDiv')
          loginError.innerHTML = 'Vale kasutajanimi või parool!'
        }
      })
    })
  })
}

function panel () {
  loadHTML('content', 'views/panel.html', function () {
    let createGameButton = document.getElementById('createGame')
    let startGameButton = document.getElementById('startGame')
    playersList = document.getElementById('playersList')
    createGameButton.addEventListener('click', function (event) {
      createGame()
    })
    startGameButton.addEventListener('click', function (event) {
      startGame()
    })
  })
}

function createGame () {
  ajaxGet('createGame', function (response) {
    if (response.id && response.gameCode) {
      gameId = response.id
      let gameCode = response.gameCode
      switchView('create-view', 'start-view')
      document.getElementById('gameCode').innerHTML = gameCode
      updatePlayersInterval = setInterval(updatePlayerList, 1000)
    } else {
      alert('Viga mängu loomisel')
    }
  })
}

function updatePlayerList () {
  let listNode, textNode
  let data = new FormData()
  data.append('game_id', gameId)
  ajaxPost('getPlayers', data, function (response) {
    if (response.none) {
    } else if (response.names) {
      while (playersList.firstChild) {
        playersList.firstChild.remove()
      }
      console.log(response.names)
      for (let i = 0; i < response.names.length; i++) {
        listNode = document.createElement('li')
        textNode = document.createTextNode(response.names[i])
        listNode.appendChild(textNode)
        playersList.appendChild(listNode)
      }
    }
  })
}

function startGame () {
  let data = new FormData()
  data.append('game_id', gameId)
  ajaxPost('startGame', data, function (response) {
    if (response.success) {
      clearInterval(updatePlayersInterval)
      switchView('start-view', 'game-view')
    } else {
      alert('Viga mängu alustamisel')
    }
  })
}
