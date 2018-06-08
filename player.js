let errorDiv, gameId, teamId, maxPlayers, currentFishLabel, lastRoundFishLabel, fishSubmitButton

window.onload = function () {
  errorDiv = document.getElementById('errorDiv')
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
                    gameStart(gameId)
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
    if (gameCode.length === 4 && teamName.length < 60) {
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
            gameStart(gameId)
          })
        } else {
          errorDiv.innerHTML = 'Vigane mängukood!'
          document.getElementById('gameCode').style.borderColor = 'red'
        }
      })
    } else {
      errorDiv.innerHTML = 'Vigane tiimi nimi või mängukood!'
      document.getElementById('gameCode').style.borderColor = 'red'
      document.getElementById('teamName').style.borderColor = 'red'
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
        fishSubmitButton = document.getElementById('fishButton')
        fishSubmitButton.addEventListener('click', function (event) {
          submitFish()
        })
      } else {
        // alert('viga!')
      }
    })
  }, 1000)
}

function waitPlayers () {
  let waitSpan = document.getElementById('waitSpan')
  let waitPlayersInterval = setInterval(function () {
    let data = new FormData()
    data.append('game_id', gameId)
    ajaxPost('playersReady', data, function (response) {
      if (response.playersReady) {
        if (response.playersReady === maxPlayers) {
          switchView('wait-view', 'fish-view')
          clearInterval(waitPlayersInterval)
          round()
        } else {
          waitSpan.innerHTML = '(' + response.playersReady + '/' + maxPlayers + ')'
        }
      } else {
        // error div or redirect
      }
    })
  }, 1000)
}

function round () {
  currentFishLabel = document.getElementById('currentFish')
  lastRoundFishLabel = document.getElementById('lastFish')
  let data = new FormData()
  data.append('team_id', teamId)
  ajaxPost('playerFish', data, function (response) {
    if (response.totalFish) {
      currentFishLabel.innerHTML = response.totalFish
      lastRoundFishLabel.innerHTML = response.lastFish
    }
  })
}

function submitFish () {
  console.log('click')
  let fishInput = document.getElementById('fishInput').value
  let data = new FormData()
  data.append('game_id', gameId)
  ajaxPost('gameStats', data, function (response) {
    if (response.maxPlayers) {
      maxPlayers = response.maxPlayers
      if (fishInput && fishInput <= response.fishInSea && fishInput > 0) {
        let data2 = new FormData()
        data2.append('game_id', gameId)
        data2.append('playerFish', fishInput)
        data2.append('team_id', teamId)
        ajaxPost('submitFish', data2, function (response) {
          if (response.success !== false) {
            switchView('fish-view', 'wait-view')
            waitPlayers()
          } else {
            // error div
          }
        })
      } else {
        // error div
      }
    } else {
      // error div
    }
  })
}
