let gameId, teamId, maxPlayers
let errorDiv = document.getElementById('errorDiv')

window.onload = function () {
  let params = getParameters()
  if (params.game && params.team && location.hash) {
    gameId = params.game
    teamId = params.team
    let data = new FormData()
    data.append('game_id', gameId)
    ajaxPost('gameStarted', data, function (response) {
      if (response.gameStarted) {
        if (response.gameStarted === 2 || response.gameStarted === 3) {
          loadHTML('content', 'views/joinScreen.html', function () {
            gameJoin()
          })
        } else {
          ajaxPost('gameStats', data, function (response) {
            if (response.maxPlayers) {
              loadHTML('content', 'views/joinedScreen.html', function () {
                switch (location.hash) {
                  case '#joined':
                    // code block
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
        }
      }
    })
  } else {
    loadHTML('content', 'views/joinScreen.html', function () {
      gameJoin()
    })
  }
}

function gameJoin () {
  let button = document.getElementById('joinButton')
  let gameCode = document.getElementById('gameCode').value
  let teamName = document.getElementById('teamName').value
  button.addEventListener('click', function (event) {
    // check inputs
    let data = new FormData()
    data.append('gameCode', gameCode)
    data.append('teamName', teamName)
    ajaxPost('joinGame', data, function (response) {
      if (response.gameId) {
        gameId = response.gameId
        teamId = response.teamId
        insertParam(gameId, response.gameId)
        insertParam(teamId, response.teamId)
        loadHTML('content', 'views/joinedScreen.html', function () {
          location.hash = 'joined'
          gameStart(gameId)
        })
      }
    })
  })
}

function gameStart (gameId) {
  let gameStartInterval = setInterval(function () {
    let request = new XMLHttpRequest()
    let url = '/controller.php?action=gameStarted'
    let data = new FormData()
    data.append('game_id', gameId)
    request.open('GET', url, true)
    // request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          let response = JSON.parse(request.response)
          if (response.result === 1) {
            console.log('gameStarted')
            clearInterval(gameStartInterval)
          } else {
            console.log('gameStartedError')
          }
        }
      }
    }
    request.send(data)
  }, 1000)
}
