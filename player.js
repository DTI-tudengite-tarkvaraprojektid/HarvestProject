
let errorDiv = document.getElementById('errorDiv')

window.onload = function () {
  let button = document.getElementById('joinButton')
  let gameCode = document.getElementById('gameCode').value
  let teamName = document.getElementById('teamName').value
  let gameId
  button.addEventListener('click', function (event) {
    let request = new XMLHttpRequest()
    let url = '/controller.php?action=joinGame'
    let data = new FormData()
    data.append('gameCode', gameCode)
    data.append('teamName', teamName)
    request.open('GET', url, true)
    // request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          let response = JSON.parse(request.response)
          if (response.result) {
            gameId = response.result
          } else {
            errorDiv.innerHTML = 'Vigane mängu kood või tiimi nimi!'
            console.log('gameStartedError')
          }
        }
      }
    }
    request.send(data)
    loadHTML('content', 'views/joinedScreen.html', function () {
      gameStart(gameId)
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
