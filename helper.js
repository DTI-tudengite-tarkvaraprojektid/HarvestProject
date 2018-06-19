function loadHTML (myDivId, url, cFunction) { // https://stackoverflow.com/questions/34330919/jquery-load-template-html-in-pure-javascript
  let xmlhttp
  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest()
  } else {
    xmlhttp = new ActiveXObject('Microsoft.XMLHTTP')
  }

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === XMLHttpRequest.DONE) {
      if (xmlhttp.status === 200) {
        document.getElementById(myDivId).innerHTML = xmlhttp.responseText
        let allScripts = document.getElementById(myDivId).getElementsByTagName('script')
        for (let n = 0; n < allScripts.length; n++) {
          eval(allScripts[n].innerHTML)// run script inside div generally not a good idea but these scripts are anyways intended to be executed.
        }
        cFunction()
      } else {
        alert('Error')
      }
    }
  }

  xmlhttp.open('GET', url, true)
  xmlhttp.send()
}

function ajaxPost (action, data, cFunction) { // performs POST actions
  let request = new XMLHttpRequest()
  let url = 'controller.php?action=' + action
  request.open('POST', url, true)
  // request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        try {
          // console.log(request) // debug
          let response = JSON.parse(this.response)
          cFunction(response)
        } catch (e) {
          alert(e)
        }
      }
    }
  }
  request.send(data)
}

function ajaxGet (action, cFunction) { // performs GET actions
  let request = new XMLHttpRequest()
  let url = 'controller.php?action=' + action
  request.open('GET', url, true)
  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        try {
          // console.log(this) // debug
          let response = JSON.parse(this.response)
          cFunction(response)
        } catch (e) {
          alert(e)
        }
      }
    }
  }
  request.send()
}

function switchView (view, toView) { // switches views
  let currentView = document.getElementById(view)
  let newView = document.getElementById(toView)
  currentView.style.display = 'none'
  newView.style.display = 'block'
}

function errorDivMoveDown () { // moves error div
  let elem = document.getElementById('errorDiv')
  if (elem.offsetTop !== -45) {
  } else {
    let pos = -45
    let intervalDown = setInterval(function () {
      if (pos === 0) {
        clearInterval(intervalDown)
        window.setTimeout(function () {
          let intervalUp = setInterval(function () {
            if (pos === -45) {
              clearInterval(intervalUp)
              elem.style.top = pos + 'px'
            } else {
              pos -= 3
              elem.style.top = pos + 'px'
            }
          }, 20)
        }, 3000)
      } else {
        pos += 3
        elem.style.top = pos + 'px'
      }
    }, 20)
  }
}
