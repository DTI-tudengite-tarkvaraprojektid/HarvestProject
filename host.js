let gameId, playersList, updatePlayersInterval, fishTotalDiv, playersReadyDiv, currentRoundDiv, maxPlayers, endGameButton, waitPlayersInterval, newGameButton, seaDiv

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
          errorDivMoveDown()
          let loginError = document.getElementById('errorDiv')
          loginError.innerHTML = 'Vale kasutajanimi või parool!'
          document.getElementById('username').style.borderColor = 'red'
          document.getElementById('password').style.borderColor = 'red'
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
    newGameButton = document.getElementById('newGame')
    seaDiv = document.getElementById('sea')
    createGameButton.addEventListener('click', function (event) {
      createGameButton.disabled = true
      createGame()
      createGameButton.disabled = false
    })
    startGameButton.addEventListener('click', function (event) {
      startGameButton.disabled = true
      startGame()
      startGameButton.disabled = false
    })
    endGameButton.addEventListener('click', function (event) {
      endGameButton.disabled = true
      endGame()
      endGameButton.disabled = false
    })
    newGameButton.addEventListener('click', function (event) {
      location.reload()
    })
  })
}

function createGame () {
  ajaxGet('createGame', function (response) {
    if (response.id && response.gameCode) {
      gameId = response.id
      let gameCode = response.gameCode
      switchView('create-view', 'start-view')
      gameCode = gameCode.toUpperCase()
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
        listNode.classList.add('listElement')
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
      updateFish(response.fishInSea)
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
          hypnofishMoveDown()

          setTimeout(roundOver, 2000)
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
      round()
    }
  })
}

function endGame () {
  clearInterval(waitPlayersInterval)
  let data = new FormData()
  data.append('game_id', gameId)
  ajaxPost('endGame', data, function (response) {
    console.log(response)
    if (response.overallStats) {
      switchView('game-view', 'statistics-view')
      clearInterval(waitPlayersInterval)
      console.log(response.overallStats)
      let statsTable = document.getElementById('OverallStatsTabel')
      let row = statsTable.insertRow(1)
      let cell = row.insertCell(0)
      cell.innerHTML = response.overallStats.roundsPlayed
      cell = row.insertCell(1)
      cell.innerHTML = response.overallStats.fishSum
      cell = row.insertCell(2)
      cell.innerHTML = response.overallStats.fishAvg
      cell = row.insertCell(3)
      cell.innerHTML = response.overallStats.fishMin
      cell = row.insertCell(4)
      cell.innerHTML = response.overallStats.fishRobbery
      cell = row.insertCell(5)
      cell.innerHTML = response.overallStats.fishMax

      let scoreTabel = document.getElementById('scoreTabel')
      let header = scoreTabel.createTHead()
      row = header.insertRow(0)
      cell = row.insertCell(0)
      cell.innerHTML = '<b>Tiim</b>'
      for (let i = 1; i <= response.overallStats.roundsPlayed; i++) {
        cell = row.insertCell(i)
        cell.innerHTML = '<b>' + i + '</b>'
      }
      for (let i = 0; i < response.teams.length; i++) {
        row = scoreTabel.insertRow(i + 1)
        cell = row.insertCell(0)
        cell.innerHTML = response.teams[i]['name']
        for (let j = 0; j < response.overallStats.roundsPlayed; j++) {
          cell = row.insertCell(j + 1)
          cell.innerHTML = response.teams[i]['rounds'][j]
        }
      }
    }
  })
}

function hypnofishMoveDown () {
  let h = parseInt(window.innerHeight)
  let fish = document.getElementById('fishtank')
  let fishie = document.getElementById('fishie')
  let temp = parseInt(window.getComputedStyle(fish).getPropertyValue('top'))
  let prc = Math.round(((temp / h) * 100))

  // console.log(h)
  // console.log(temp)
  // console.log(prc)
  if (prc !== -100) {

  } else {
    fishie.classList.add('animation')
    let pos = -100
    let intervalDown = setInterval(function () {
      if (pos === 0) {
        clearInterval(intervalDown)
        window.setTimeout(function () {
          let intervalUp = setInterval(function () {
            if (pos === -100) {
              clearInterval(intervalUp)
              fishie.classList.remove('animation')
              fish.style.top = pos + '%'
            } else {
              pos -= 2
              fish.style.top = pos + '%'
            }
          }, 20)
        }, 1000)
      } else {
        pos += 2
        fish.style.top = pos + '%'
      }
    }, 20)
  }
}

function updateFish (currentFish) {
  let fishPosList
  if ((currentFish / (maxPlayers * 10)) <= 0.33) {
    fishPosList = [
      [1, 2],
      [3, 4],
      [5, 6]
    ]
    for (let $i = 0; $i < fishPosList.length; $i++) {
      let newFish = '<svg class="fish">' +
      '<pathd="m ' + fishPosList[$i][0] + ',' + fishPosList[$i][1] + ' ' +
      'c 0.0489,-0.444179 -0.2178,-0.896934 -1.01784,-1.415715 -0.72801,-0.475049 -1.4826,-0.932948 -2.2149,-1.401138 -1.6035,-1.028129 -3.29018,-1.969653 -4.89798,-3.079244 -4.67074,-3.24131 -10.22127,-4.404923 -15.76322,-5.1509392 -2.27235,-0.286401 -4.81223,-0.168925 -6.72186,-1.574351 -1.48174,-1.081294 -4.04993,-4.828523 -6.86506,-6.456038 -0.4862,-0.290688 -2.77227,-1.44486897 -2.77227,-1.44486897 -0,0 1.30939,3.55000597 1.60951,4.26429497 0.69542,1.644664 -0.38158,3.063809 -0.83262,4.642447 -0.29069,1.0418502 2.13772,0.8129002 2.26463,1.7827212 0.18179,1.432007 -4.15197,1.936211 -6.59152,2.417263 -3.65634,0.715146 -7.91635,2.082841 -11.56925,0.884071 -4.3046,-1.38313 -7.37269,-4.129669 -10.46566,-7.2354952 1.43801,6.7252892 5.4382,10.6028562 5.6157,11.4226162 0.18607,0.905509 -0.45961,1.091584 -1.04099,1.682394 -1.28967,1.265655 -6.91566,7.731125 -6.93366,9.781383 1.61379,-0.247815 3.56115,-1.660957 4.9803,-2.485862 1.58035,-0.905509 7.60593,-5.373029 9.29347,-6.065023 0.38587,-0.160351 5.0549,-1.531476 5.09434,-0.932949 0.0695,0.932949 -0.30784,1.137031 -0.18436,1.527189 0.22638,0.746016 1.44144,1.465449 2.02282,1.985088 1.50918,1.292237 3.21044,2.42841 4.27373,4.156252 1.49203,2.401827 1.55805,4.999163 1.98251,7.677102 0.99469,-0.111473 2.0091,-2.17545 2.55961,-2.992638 0.51278,-0.772598 2.38639,-4.07136 3.09725,-4.275442 0.67227,-0.204082 2.75511,0.958673 3.50284,1.180763 2.85973,0.848057 5.644,1.353976 8.56032,1.353976 3.50799,0.0094 12.726,0.258104 19.55505,-4.800226 0.75545,-0.567658 2.55703,-2.731104 2.55703,-2.731104 -0,0 -0.37644,-0.577091 -1.04785,-0.790605 0.89779,-0.584808 1.8659,-1.211633 1.94993,-1.925922 z" ' +
      'style="fill:#528484;fill-opacity:1" ' +
      'inkscape:connector-curvature="0" ' +
      'sodipodi:nodetypes="cccccccccccccccccccccccccccccccc"/> ' +
      '</svg>'
      seaDiv.insertAdjacentHTML('beforeend', newFish)
    }
  } else if ((currentFish / (maxPlayers * 10)) < 0.66) {
    fishPosList = [
      [1, 2],
      [3, 4],
      [5, 6]
    ]
    for (let $i = 0; $i < fishPosList.length; $i++) {
      let newFish = '<svg class="fish">' +
      '<pathd="m ' + fishPosList[$i][0] + ',' + fishPosList[$i][1] + ' ' +
      'c 0.0489,-0.444179 -0.2178,-0.896934 -1.01784,-1.415715 -0.72801,-0.475049 -1.4826,-0.932948 -2.2149,-1.401138 -1.6035,-1.028129 -3.29018,-1.969653 -4.89798,-3.079244 -4.67074,-3.24131 -10.22127,-4.404923 -15.76322,-5.1509392 -2.27235,-0.286401 -4.81223,-0.168925 -6.72186,-1.574351 -1.48174,-1.081294 -4.04993,-4.828523 -6.86506,-6.456038 -0.4862,-0.290688 -2.77227,-1.44486897 -2.77227,-1.44486897 -0,0 1.30939,3.55000597 1.60951,4.26429497 0.69542,1.644664 -0.38158,3.063809 -0.83262,4.642447 -0.29069,1.0418502 2.13772,0.8129002 2.26463,1.7827212 0.18179,1.432007 -4.15197,1.936211 -6.59152,2.417263 -3.65634,0.715146 -7.91635,2.082841 -11.56925,0.884071 -4.3046,-1.38313 -7.37269,-4.129669 -10.46566,-7.2354952 1.43801,6.7252892 5.4382,10.6028562 5.6157,11.4226162 0.18607,0.905509 -0.45961,1.091584 -1.04099,1.682394 -1.28967,1.265655 -6.91566,7.731125 -6.93366,9.781383 1.61379,-0.247815 3.56115,-1.660957 4.9803,-2.485862 1.58035,-0.905509 7.60593,-5.373029 9.29347,-6.065023 0.38587,-0.160351 5.0549,-1.531476 5.09434,-0.932949 0.0695,0.932949 -0.30784,1.137031 -0.18436,1.527189 0.22638,0.746016 1.44144,1.465449 2.02282,1.985088 1.50918,1.292237 3.21044,2.42841 4.27373,4.156252 1.49203,2.401827 1.55805,4.999163 1.98251,7.677102 0.99469,-0.111473 2.0091,-2.17545 2.55961,-2.992638 0.51278,-0.772598 2.38639,-4.07136 3.09725,-4.275442 0.67227,-0.204082 2.75511,0.958673 3.50284,1.180763 2.85973,0.848057 5.644,1.353976 8.56032,1.353976 3.50799,0.0094 12.726,0.258104 19.55505,-4.800226 0.75545,-0.567658 2.55703,-2.731104 2.55703,-2.731104 -0,0 -0.37644,-0.577091 -1.04785,-0.790605 0.89779,-0.584808 1.8659,-1.211633 1.94993,-1.925922 z" ' +
      'style="fill:#528484;fill-opacity:1" ' +
      'inkscape:connector-curvature="0" ' +
      'sodipodi:nodetypes="cccccccccccccccccccccccccccccccc"/> ' +
      '</svg>'
      seaDiv.insertAdjacentHTML('beforeend', newFish)
    }
  } else {
    fishPosList = [
      [1, 2],
      [3, 4],
      [5, 6]
    ]
    for (let $i = 0; $i < fishPosList.length; $i++) {
      let newFish = '<svg class="fish">' +
      '<pathd="m ' + fishPosList[$i][0] + ',' + fishPosList[$i][1] + ' ' +
      'c 0.0489,-0.444179 -0.2178,-0.896934 -1.01784,-1.415715 -0.72801,-0.475049 -1.4826,-0.932948 -2.2149,-1.401138 -1.6035,-1.028129 -3.29018,-1.969653 -4.89798,-3.079244 -4.67074,-3.24131 -10.22127,-4.404923 -15.76322,-5.1509392 -2.27235,-0.286401 -4.81223,-0.168925 -6.72186,-1.574351 -1.48174,-1.081294 -4.04993,-4.828523 -6.86506,-6.456038 -0.4862,-0.290688 -2.77227,-1.44486897 -2.77227,-1.44486897 -0,0 1.30939,3.55000597 1.60951,4.26429497 0.69542,1.644664 -0.38158,3.063809 -0.83262,4.642447 -0.29069,1.0418502 2.13772,0.8129002 2.26463,1.7827212 0.18179,1.432007 -4.15197,1.936211 -6.59152,2.417263 -3.65634,0.715146 -7.91635,2.082841 -11.56925,0.884071 -4.3046,-1.38313 -7.37269,-4.129669 -10.46566,-7.2354952 1.43801,6.7252892 5.4382,10.6028562 5.6157,11.4226162 0.18607,0.905509 -0.45961,1.091584 -1.04099,1.682394 -1.28967,1.265655 -6.91566,7.731125 -6.93366,9.781383 1.61379,-0.247815 3.56115,-1.660957 4.9803,-2.485862 1.58035,-0.905509 7.60593,-5.373029 9.29347,-6.065023 0.38587,-0.160351 5.0549,-1.531476 5.09434,-0.932949 0.0695,0.932949 -0.30784,1.137031 -0.18436,1.527189 0.22638,0.746016 1.44144,1.465449 2.02282,1.985088 1.50918,1.292237 3.21044,2.42841 4.27373,4.156252 1.49203,2.401827 1.55805,4.999163 1.98251,7.677102 0.99469,-0.111473 2.0091,-2.17545 2.55961,-2.992638 0.51278,-0.772598 2.38639,-4.07136 3.09725,-4.275442 0.67227,-0.204082 2.75511,0.958673 3.50284,1.180763 2.85973,0.848057 5.644,1.353976 8.56032,1.353976 3.50799,0.0094 12.726,0.258104 19.55505,-4.800226 0.75545,-0.567658 2.55703,-2.731104 2.55703,-2.731104 -0,0 -0.37644,-0.577091 -1.04785,-0.790605 0.89779,-0.584808 1.8659,-1.211633 1.94993,-1.925922 z" ' +
      'style="fill:#528484;fill-opacity:1" ' +
      'inkscape:connector-curvature="0" ' +
      'sodipodi:nodetypes="cccccccccccccccccccccccccccccccc"/> ' +
      '</svg>'
      seaDiv.insertAdjacentHTML('beforeend', newFish)
    }
  }
}

// m 172.04828,20.913839 c -0.0489, 0.444179 -0.2178, 0.896934 -1.01784, 1.415715 -0.72801,0.475049 -1.4826,0.932948 -2.2149,1.401138 -1.6035,1.028129 -3.29018,1.969653 -4.89798,3.079244 -4.67074,3.24131 -10.22127,4.404923 -15.76322,5.1509392 -2.27235,0.286401 -4.81223,0.168925 -6.72186,1.574351 -1.48174,1.081294 -4.04993,4.828523 -6.86506,6.456038 -0.4862,0.290688 -2.77227,1.44486897 -2.77227,1.44486897 0,0 1.30939,-3.55000597 1.60951,-4.26429497 0.69542,-1.644664 -0.38158,-3.063809 -0.83262,-4.642447 -0.29069,-1.0418502 2.13772,-0.8129002 2.26463,-1.7827212 0.18179,-1.432007 -4.15197,-1.936211 -6.59152,-2.417263 -3.65634,-0.715146 -7.91635,-2.082841 -11.56925,-0.884071 -4.3046,1.38313 -7.37269,4.129669 -10.46566,7.2354952 1.43801,-6.7252892 5.4382,-10.6028562 5.6157,-11.4226162 0.18607,-0.905509 -0.45961,-1.091584 -1.04099,-1.682394 -1.28967,-1.265655 -6.91566,-7.731125 -6.93366,-9.781383 1.61379,0.247815 3.56115,1.660957 4.9803,2.485862 1.58035,0.905509 7.60593,5.373029 9.29347,6.065023 0.38587,0.160351 5.0549,1.531476 5.09434,0.932949 0.0695,-0.932949 -0.30784,-1.137031 -0.18436,-1.527189 0.22638,-0.746016 1.44144,-1.465449 2.02282,-1.985088 1.50918,-1.292237 3.21044,-2.42841 4.27373,-4.156252 1.49203,-2.401827 1.55805,-4.999163 1.98251,-7.677102 0.99469,0.111473 2.0091,2.17545 2.55961,2.992638 0.51278,0.772598 2.38639,4.07136 3.09725,4.275442 0.67227,0.204082 2.75511,-0.958673 3.50284,-1.180763 2.85973,-0.848057 5.644,-1.353976 8.56032,-1.353976 3.50799,-0.0094 12.726,-0.258104 19.55505,4.800226 0.75545,0.567658 2.55703,2.731104 2.55703,2.731104 0,0 -0.37644,0.577091 -1.04785,0.790605 0.89779,0.584808 1.8659,1.211633 1.94993,1.925922 z"

// m 172.04828,20.913839 c -0.0489, -0.444179 -0.2178, -0.896934 -1.01784, -1.415715 -0.72801,-0.475049 -1.4826,-0.932948 -2.2149,-1.401138 -1.6035,-1.028129 -3.29018,-1.969653 -4.89798,-3.079244 -4.67074,-3.24131 -10.22127,-4.404923 -15.76322,-5.1509392 -2.27235,-0.286401 -4.81223,-0.168925 -6.72186,-1.574351 -1.48174,-1.081294 -4.04993,-4.828523 -6.86506,-6.456038 -0.4862,-0.290688 -2.77227,-1.44486897 -2.77227,-1.44486897 0,0 1.30939,3.55000597 1.60951,4.26429497 0.69542,1.644664 -0.38158,3.063809 -0.83262,4.642447 -0.29069,1.0418502 2.13772,0.8129002 2.26463,1.7827212 0.18179,1.432007 -4.15197,1.936211 -6.59152,2.417263 -3.65634,0.715146 -7.91635,2.082841 -11.56925,0.884071 -4.3046,-1.38313 -7.37269,-4.129669 -10.46566,-7.2354952 1.43801,6.7252892 5.4382,10.6028562 5.6157,11.4226162 0.18607,0.905509 -0.45961,1.091584 -1.04099,1.682394 -1.28967,1.265655 -6.91566,7.731125 -6.93366,9.781383 1.61379,-0.247815 3.56115,-1.660957 4.9803,-2.485862 1.58035,-0.905509 7.60593,-5.373029 9.29347,-6.065023 0.38587,-0.160351 5.0549,-1.531476 5.09434,-0.932949 0.0695,0.932949 -0.30784,1.137031 -0.18436,1.527189 0.22638,0.746016 1.44144,1.465449 2.02282,1.985088 1.50918,1.292237 3.21044,2.42841 4.27373,4.156252 1.49203,2.401827 1.55805,4.999163 1.98251,7.677102 0.99469,-0.111473 2.0091,-2.17545 2.55961,-2.992638 0.51278,-0.772598 2.38639,-4.07136 3.09725,-4.275442 0.67227,-0.204082 2.75511,0.958673 3.50284,1.180763 2.85973,0.848057 5.644,1.353976 8.56032,1.353976 3.50799,0.0094 12.726,0.258104 19.55505,-4.800226 0.75545,-0.567658 2.55703,-2.731104 2.55703,-2.731104 0,0 -0.37644,-0.577091 -1.04785,-0.790605 0.89779,-0.584808 1.8659,-1.211633 1.94993,-1.925922 z"

// m 172.04828,20.913839 c 0.0489,0.444179 -0.2178,0.896934 -1.01784,1.415715 -0.72801,0.475049 -1.4826,0.932948 -2.2149,1.401138 -1.6035,1.028129 -3.29018,1.969653 -4.89798,3.079244 -4.67074,3.24131 -10.22127,4.404923 -15.76322,5.1509392 -2.27235,0.286401 -4.81223,0.168925 -6.72186,1.574351 -1.48174,1.081294 -4.04993,4.828523 -6.86506,6.456038 -0.4862,0.290688 -2.77227,1.44486897 -2.77227,1.44486897 0,0 1.30939,-3.55000597 1.60951,-4.26429497 0.69542,-1.644664 -0.38158,-3.063809 -0.83262,-4.642447 -0.29069,-1.0418502 2.13772,-0.8129002 2.26463,-1.7827212 0.18179,-1.432007 -4.15197,-1.936211 -6.59152,-2.417263 -3.65634,-0.715146 -7.91635,-2.082841 -11.56925,-0.884071 -4.3046,1.38313 -7.37269,4.129669 -10.46566,7.2354952 1.43801,-6.7252892 5.4382,-10.6028562 5.6157,-11.4226162 0.18607,-0.905509 -0.45961,-1.091584 -1.04099,-1.682394 -1.28967,-1.265655 -6.91566,-7.731125 -6.93366,-9.781383 1.61379,0.247815 3.56115,1.660957 4.9803,2.485862 1.58035,0.905509 7.60593,5.373029 9.29347,6.065023 0.38587,0.160351 5.0549,1.531476 5.09434,0.932949 0.0695,-0.932949 -0.30784,-1.137031 -0.18436,-1.527189 0.22638,-0.746016 1.44144,-1.465449 2.02282,-1.985088 1.50918,-1.292237 3.21044,-2.42841 4.27373,-4.156252 1.49203,-2.401827 1.55805,-4.999163 1.98251,-7.677102 0.99469,0.111473 2.0091,2.17545 2.55961,2.992638 0.51278,0.772598 2.38639,4.07136 3.09725,4.275442 0.67227,0.204082 2.75511,-0.958673 3.50284,-1.180763 2.85973,-0.848057 5.644,-1.353976 8.56032,-1.353976 3.50799,-0.0094 12.726,-0.258104 19.55505,4.800226 0.75545,0.567658 2.55703,2.731104 2.55703,2.731104 0,0 -0.37644,0.577091 -1.04785,0.790605 0.89779,0.584808 1.8659,1.211633 1.94993,1.925922 z"

// - m 172.04828,20.913839 c 0.0489,-0.444179 0.2178,-0.896934 1.01784,-1.415715 0.72801,-0.475049 1.4826,-0.932948 2.2149,-1.401138 1.6035,-1.028129 3.29018,-1.969653 4.89798,-3.079244 4.67074,-3.24131 10.22127,-4.404923 15.76322,-5.1509392 2.27235,-0.286401 4.81223,-0.168925 6.72186,-1.574351 1.48174,-1.081294 4.04993,-4.828523 6.86506,-6.456038 0.4862,-0.290688 2.77227,-1.44486897 2.77227,-1.44486897 0,0 -1.30939,3.55000597 -1.60951,4.26429497 -0.69542,1.644664 0.38158,3.063809 0.83262,4.642447 0.29069,1.0418502 -2.13772,0.8129002 -2.26463,1.7827212 -0.18179,1.432007 4.15197,1.936211 6.59152,2.417263 3.65634,0.715146 7.91635,2.082841 11.56925,0.884071 4.3046,-1.38313 7.37269,-4.129669 10.46566,-7.2354952 -1.43801,6.7252892 -5.4382,10.6028562 -5.6157,11.4226162 -0.18607,0.905509 0.45961,1.091584 1.04099,1.682394 1.28967,1.265655 6.91566,7.731125 6.93366,9.781383 -1.61379,-0.247815 -3.56115,-1.660957 -4.9803,-2.485862 -1.58035,-0.905509 -7.60593,-5.373029 -9.29347,-6.065023 -0.38587,-0.160351 -5.0549,-1.531476 -5.09434,-0.932949 -0.0695,0.932949 0.30784,1.137031 0.18436,1.527189 -0.22638,0.746016 -1.44144,1.465449 -2.02282,1.985088 -1.50918,1.292237 -3.21044,2.42841 -4.27373,4.156252 -1.49203,2.401827 -1.55805,4.999163 -1.98251,7.677102 -0.99469,-0.111473 -2.0091,-2.17545 -2.55961,-2.992638 -0.51278,-0.772598 -2.38639,-4.07136 -3.09725,-4.275442 -0.67227,-0.204082 -2.75511,0.958673 -3.50284,1.180763 -2.85973,0.848057 -5.644,1.353976 -8.56032,1.353976 -3.50799,0.0094 -12.726,0.258104 -19.55505,-4.800226 -0.75545,-0.567658 -2.55703,-2.731104 -2.55703,-2.731104 0,0 0.37644,-0.577091 1.04785,-0.790605 -0.89779,-0.584808 -1.8659,-1.211633 -1.94993,-1.925922 z"
