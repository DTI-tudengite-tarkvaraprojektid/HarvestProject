let errorDiv, maxPlayers, currentFishLabel, lastRoundFishLabel, fishSubmitButton, fishInput, currentRound, endInterval, waitPlayersInterval
let locked = false

window.onload = function () {
  errorDiv = document.getElementById('errorDiv')
  ajaxGet('gameStarted', function (response) {
    if (response.gameStarted === 0) {
      loadHTML('content', 'views/joinScreen.html', function () {
        gameStart()
      })
    } else if (response.gameStarted === 1) {
      ajaxGet('gameStats', function (response) {
        if (response.maxPlayers) {
          if (response.currentRound === response.playerFishTimes) {
            gameStart()
            switchView('fish-view', 'wait-view')
            waitPlayers()
          } else {
            gameStart()
          }
        }
      })
    } else if (response.gameStarted === 2) {
      loadHTML('content', 'views/joinScreen.html', function () {
        gameJoin()
      })
    } else {
      loadHTML('content', 'views/joinScreen.html', function () {
        gameJoin()
      })
    }
  })
}

function gameJoin () { // lets player join game and checks inputs(is alphanumeric? is right length?), if joined directs to other view, starts interval for function gameStart
  ajaxGet('logOut', function (response) {
    if (response.success) {
      let button = document.getElementById('joinButton')
      button.addEventListener('click', function (event) {
        if (!locked) {
          locked = true
          button.disabled = true
          let gameCode = document.getElementById('gameCode').value
          let teamName = document.getElementById('teamName').value
          // check inputs
          let regex = /^(?=.*[A-Za-z0-9À-ž])[A-Za-z0-9À-ž _\-]*$/g
          if (regex.test(teamName) && teamName.length < 15) {
          // if (!teamName.match(regex) && !gameCode.match(regex)) {
            let regex2 = /^[a-zA-Z0-9]*$/g
            if (regex2.test(gameCode) && gameCode.length == 4) {
              console.log('testin gameCode')
              console.log('tiimi nimi OK')
              let data = new FormData()
              data.append('gameCode', gameCode)
              data.append('teamName', teamName)
              ajaxPost('joinGame', data, function (response) {
                if (response.success === true) {
                  errorDiv.innerHTML = ''
                  // gameId = response.gameId
                  // teamId = response.teamId
                  // UpdateQueryString('gameId', response.gameId)
                  // UpdateQueryString('teamId', response.teamId)
                  loadHTML('content', 'views/joinedScreen.html', function () {
                    location.hash = 'joined'
                    gameStart()
                  })
                } else {
                  errorDiv.innerHTML = 'Vigane mängukood!'
                  document.getElementById('gameCode').style.borderColor = 'red'
                  button.disabled = false
                  errorDivMoveDown()
                  locked = false
                }
              })
            }
          } else {
            console.log('tiimi nimi not OK')
            errorDiv.innerHTML = 'Palun sisesta uus tiiminimi!'
            document.getElementById('teamName').style.borderColor = 'red'
            button.disabled = false
            errorDivMoveDown()
            locked = false
            if (gameCode.length === 4 && teamName.length < 15) {

            } else {
              console.log('errorDiv tuleb')
              errorDiv.innerHTML = 'Vigane tiimi nimi või mängukood!'
              document.getElementById('gameCode').style.borderColor = 'red'
              document.getElementById('teamName').style.borderColor = 'red'
              button.disabled = false
              errorDivMoveDown()
              locked = false
            }
          }
        }
      })
    }
  })
}

function gameStart () { // checks if game has started yet, if yes directs to other view, if not then stays
  let gameStartInterval = setInterval(function () {
    ajaxGet('gameStarted', function (response) {
      if (response.gameStarted === 1) {
        switchView('joined-view', 'fish-view')
        clearInterval(gameStartInterval)
        fishSubmitButton = document.getElementById('fishButton')
        locked = false
        fishSubmitButton.addEventListener('click', function (event) {
          submitFish()
        })
        fishInput = document.getElementById('fishInput')
        let backButton = document.getElementById('backButton')
        backButton.addEventListener('click', function (event) {
          location.reload()
        })
        endInterval = setInterval(isGameOver, 3000)
      } /* else {
        console.log('ilmnes viga')
      } */
    })
  }, 1000)
}

function waitPlayers () { // checks how many players are ready and shows it to player who has submitted fihWanted
  let waitSpan = document.getElementById('waitSpan')
  waitPlayersInterval = setInterval(function () {
    ajaxGet('playersReady', function (response) {
      if (response.playersReady) {
        if (response.playersReady === maxPlayers) {
          clearInterval(waitPlayersInterval)
          waitPlayersInterval = setInterval(function () {
            ajaxGet('gameStats', function (response) {
              if (response.currentRound) {
                if (response.currentRound != currentRound) {
                  clearInterval(waitPlayersInterval)
                  switchView('wait-view', 'fish-view')
                  round()
                }
              }
            })
          }, 500)
        } else {
          waitSpan.innerHTML = '(' + response.playersReady + '/' + maxPlayers + ')'
        }
      } /* else {
        errorDiv.innerHTML = 'Ilmnes viga!'
        errorDivMoveDown()
        // error div or redirect ilmnes viga
      } */
    })
  }, 1000)
}

function round () { // shows player how many fishes was caught last round and how many have been caught by him/her this game
  locked = false
  fishInput.value = ''
  currentFishLabel = document.getElementById('currentFish')
  lastRoundFishLabel = document.getElementById('lastFish')
  ajaxGet('playerFish', function (response) {
    if (response.totalFish) {
      currentFishLabel.innerHTML = response.totalFish
      lastRoundFishLabel.innerHTML = parseInt(response.lastFish)
    }
  })
}

function isInteger (x) { // checks if is integrer
  return (typeof x === 'number') && (x % 1 === 0)
}

function submitFish () { // checks if fish input is integrer and is there that much fish in sea, if yes, submits fishWanted
  if (!locked) {
    locked = true
    console.log('click')
    let fishInputValue = fishInput.value
    ajaxGet('gameStats', function (response) {
      if (response.maxPlayers) {
        maxPlayers = response.maxPlayers
        currentRound = response.currentRound
        if (fishInputValue && fishInputValue >= 0 && isInteger(+fishInputValue)) {
          if (fishInputValue <= response.fishInSea) {
            let data = new FormData()
            data.append('playerFish', fishInputValue)
            ajaxPost('submitFish', data, function (response) {
              if (response.success) {
                switchView('fish-view', 'wait-view')
                waitPlayers()
              } else if (response.success === false) {
                errorDiv.innerHTML = 'Ilmnes viga!'
                errorDivMoveDown()
                locked = false
              // error div
              }
            })
          } else {
            errorDiv.innerHTML = 'Meres pole nii palju kalu!'
            errorDivMoveDown()
            locked = false
          }
        } else {
          errorDiv.innerHTML = 'Kontrollige sisendit!'
          errorDivMoveDown()
          locked = false
        }
      } else {
        errorDiv.innerHTML = 'Ilmnes viga!'
        errorDivMoveDown()
        locked = false
      }
    })
  }
}

function isGameOver () { // if game is over directs to other view
  ajaxGet('gameStarted', function (response) {
    if (response.gameStarted === 2) {
      clearInterval(waitPlayersInterval)
      clearInterval(endInterval)
      switchView('fish-view', 'end-view')
      switchView('wait-view', 'end-view')
      ajaxGet('logOut', function (response) {})
    }
  })
}
