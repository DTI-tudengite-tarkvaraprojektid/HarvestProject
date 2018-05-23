
window.onload = function () {
  let button = document.getElementById('loginButton')
  let userName = document.getElementsByName('username').value
  let passWord = document.getElementsByName('password').value
  button.addEventListener('click', function (event) {
    let request = new XMLHttpRequest()
    let url = '/controller.php?action=login'
    let data = new FormData()
    data.append('userName', userName)
    data.append('passWord', passWord)
    request.open('POST', url, true)
    // request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          let response = JSON.parse(request.ressponse)
          if (response.result === 1) {
            console.log('gameStarted')
          } else {
            console.log('gameStartedError')
          }
        }
      }
    }
    request.send(data)
  })
}

function hasSession () {
  let request = new XMLHttpRequest()
  let url = '/controller.php?action=login'
  request.open('POST', url, true)
  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        let response = JSON.parse(request.ressponse)
        if (response.result.success === true) {
          loadHTML()
        } else {
          console.log('gameStartedError')
        }
      }
    }
  }
}
