let gameId, playersList, updatePlayersInterval, fishTotalDiv, playersReadyDiv, currentRoundDiv, maxPlayers, endGameButton, waitPlayersInterval

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
    playersReadyDiv = document.getElementById('playersReady')
    fishTotalDiv = document.getElementById('fishTotal')
    currentRoundDiv = document.getElementById('currentRound')
    playersList = document.getElementById('playersList')
    endGameButton = document.getElementById('stopGame')
    createGameButton.addEventListener('click', function (event) {
      createGame()
    })
    startGameButton.addEventListener('click', function (event) {
      startGame()
    })
    endGameButton.addEventListener('click', function (event) {
      endGame()
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
      maxPlayers = response.maxPlayers
      clearInterval(updatePlayersInterval)
      switchView('start-view', 'game-view')
      round()
    } else {
      alert('Viga mängu alustamisel')
    }
  })
}

function round () {
  playersReadyDiv.innerHTML = '(0/' + maxPlayers + ')'
  let data = new FormData()
  data.append('game_id', gameId)
  ajaxPost('gameStats', data, function (response) {
    if (response.maxPlayers) {
      currentRoundDiv.innerHTML = response.currentRound
      fishTotalDiv.innerHTML = response.fishInSea
      waitPlayers()
    }
  })
}

function waitPlayers () {
  waitPlayersInterval = setInterval(function () {
    let data = new FormData()
    data.append('game_id', gameId)
    ajaxPost('playersReady', data, function (response) {
      if (response.playersReady) {
        if (response.playersReady === maxPlayers) {
          clearInterval(waitPlayersInterval)
          switchView('game-view', 'wait-view')
          roundOver()
        } else {
          playersReadyDiv.innerHTML = '(' + response.playersReady + '/' + maxPlayers + ')'
        }
      } else {
        // error div or redirect
      }
    })
  }, 1000)
}

function roundOver () {
  let data = new FormData()
  data.append('game_id', gameId)
  ajaxPost('roundOver', data, function (response) {
    if (response.success) {
      // waitscreen animation time wait
      switchView('wait-view', 'game-view')
      round()
    }
  })
}

function endGame () {
  clearInterval(waitPlayersInterval)
  alert('game over pressed') // debug
}


}
