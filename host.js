
window.onload = function () {
  isLoggedIn()
}

function isLoggedIn () {
  let response = ajaxGet('isLoggedIn')
  if(response.loggedIn){
    loadHTML('content', 'views/joinedScreen.html', function(){  
    })
  } else {
    loadHTML('content', 'views/login.html', function(){
    })
  }
}
