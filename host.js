
window.onload = function () {
  isLoggedIn()
}

function isLoggedIn () {
  ajaxGet('isLoggedIn', function (response) {
    if (response.loggedIn) {
      loadHTML('content', 'views/joinedScreen.html', function () {
      })
    } else {
      loadHTML('content', 'views/login.html', function () {
      })
    }
  })
}
