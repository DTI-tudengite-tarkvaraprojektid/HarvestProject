
window.onload = function () {
  isLoggedIn()
}

function isLoggedIn () {
<<<<<<< HEAD
  let response = ajaxGet('isLoggedIn')
  if(response.loggedIn){
    loadHTML('content', 'views/joinedScreen.html', function(){  
    })
  } else {
    loadHTML('content', 'views/login.html', function(){
    })
  }
=======
  ajaxGet('isLoggedIn', function (response) {
    if (response.loggedIn) {
      loadHTML('content', 'views/joinedScreen.html', function () {
      })
    } else {
      loadHTML('content', 'views/login.html', function () {
      })
    }
  })
>>>>>>> db4b33e5ca75fb9c4f64aff7e4af2fdb7aac31a7
}
