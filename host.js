
window.onload = function () {

}

function isLoggedIn () {
  let response = getAjax('isLoggedIn')
  if(response.loggedIn){
    loadHTML('content', 'views/joinedScreen.html', function(){  
    })
  } else {
    loadHTML('content', 'views/login.html', function(){
    })
  }
}
