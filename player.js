let gameId, teamId, maxPlayers
let errorDiv = document.getElementById('errorDiv')

window.onload = function () {
  let params = getParameters()
  if (params.gameId && params.teamId && location.hash) {
    gameId = params.gameId
    teamId = params.teamId
    let data = new FormData()
    data.append('game_id', gameId)
    ajaxPost('gameStarted', data, function (response) {
      if (response.gameStarted || response.gameStarted === 0) {
        // let <-- uuri mis let see olema oleks pidanud
        if (response.gameStarted === 2 || response.gameStarted === 3) {
          loadHTML('content', 'views/joinScreen.html', function () {
            history.replaceState({}, document.title, '.')
            gameJoin()
          })
        } else if (response.gameStarted === 1) {
          ajaxPost('gameStats', data, function (response) {
            if (response.maxPlayers) {
              loadHTML('content', 'views/joinedScreen.html', function () {
                switch (location.hash) {
                  case '#joined':

                    break
                  case '#fish':
                    // code block
                    break
                  case '#wait':
                    // code block
                    break
                  default:
                    alert('vigane view')
                }
              })
            }
          })
        } else {
          loadHTML('content', 'views/joinedScreen.html', function () {
            location.hash = 'joined'
            // gameStart(gameId)
          })
        }
      } else {
        loadHTML('content', 'views/joinScreen.html', function () {
          history.replaceState({}, document.title, '.')
          gameJoin()
        })
      }
    })
  } else {
    loadHTML('content', 'views/joinScreen.html', function () {
      history.replaceState({}, document.title, '.')
      gameJoin()
    })
  }
}

function gameJoin () {
  let button = document.getElementById('joinButton')
  button.addEventListener('click', function (event) {
    let gameCode = document.getElementById('gameCode').value
    let teamName = document.getElementById('teamName').value
    // check inputs
    if (gameCode.length !== 4 && teamName.length < 60) {
      let data = new FormData()
      data.append('gameCode', gameCode)
      data.append('teamName', teamName)
      ajaxPost('joinGame', data, function (response) {
        if (response.gameId) {
          errorDiv.innerHTML = ''
          gameId = response.gameId
          teamId = response.teamId
          UpdateQueryString('gameId', response.gameId)
          UpdateQueryString('teamId', response.teamId)
          loadHTML('content', 'views/joinedScreen.html', function () {
            location.hash = 'joined'
            // gameStart(gameId)
          })
        } else {
          errorDiv.innerHTML = 'Vigane mängukood!'
        }
      })
    } else {
      errorDiv.innerHTML = 'Vigane tiimi nimi või mängukood!'
    }
  })
}

function gameStart () {
  let gameStartInterval = setInterval(function () {
    let data = new FormData()
    data.append('game_id', gameId)
    ajaxPost('gameStarted', data, function (response) {
      if (response.gameStarted === 1) {
        switchView('joined-view', 'fish-view')
        clearInterval(gameStartInterval)
        gameStarted()
      } else {
        alert('viga!')
      }
    })
  })
}

function gameStarted () {

}

function submitFish () {

}
