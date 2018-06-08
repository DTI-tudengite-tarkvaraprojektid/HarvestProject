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

function ajaxPost (action, data, cFunction) {
  let request = new XMLHttpRequest()
  let url = 'controller.php?action=' + action
  // let data = new FormData()
  // data.append('userName', userName)
  // data.append('passWord', passWord)
  request.open('POST', url, true)
  // request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        try {
          console.log(this) // debug
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

function ajaxGet (action, cFunction) {
  let request = new XMLHttpRequest()
  let url = 'controller.php?action=' + action
  request.open('GET', url, true)
  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        try {
          console.log(this) // debug
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

function switchView (view, toView) {
  let currentView = document.getElementById(view)
  let newView = document.getElementById(toView)
  currentView.style.display = 'none'
  newView.style.display = 'block'
}

function getParameters () { // https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  let match
  let pl = /\+/g // Regex for replacing addition symbol with a space
  let search = /([^&=]+)=?([^&]*)/g
  let decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')) }
  let query = window.location.search.substring(1)

  let urlParams = {}
  while (match = search.exec(query)) { urlParams[decode(match[1])] = decode(match[2]) }
  return urlParams
}

function UpdateQueryString (key, value) { // https://stackoverflow.com/questions/5999118/how-can-i-add-or-update-a-query-string-parameter
  let url = window.location.href
  let re = new RegExp('([?&])' + key + '=.*?(&|#|$)(.*)', 'gi')
  let hash

  if (re.test(url)) {
    if (typeof value !== 'undefined' && value !== null) {
      url = url.replace(re, '$1' + key + '=' + value + '$2$3')
      window.history.replaceState({path: url}, '', url)
    } else {
      hash = url.split('#')
      url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '')
      if (typeof hash[1] !== 'undefined' && hash[1] !== null) { url += '#' + hash[1] }
      window.history.replaceState({path: url}, '', url)
    }
  } else {
    if (typeof value !== 'undefined' && value !== null) {
      var separator = url.indexOf('?') !== -1 ? '&' : '?'
      hash = url.split('#')
      url = hash[0] + separator + key + '=' + value
      if (typeof hash[1] !== 'undefined' && hash[1] !== null) { url += '#' + hash[1] }
      window.history.replaceState({path: url}, '', url)
    } else {
      window.history.replaceState({path: url}, '', url)
    }
  }
}

function errorDivMoveDown () {
  var elem = document.getElementById('errorDiv')
  // console.log(elem.offsetTop)
  if (elem.offsetTop != -45) {
    // console.log('error message doesnt move')
  } else {
    // console.log('error message moves')
    var pos = -45
    var id = setInterval(frame, 40)
    function frame () {
      if (pos == 0) {
        clearInterval(id)
        errorDivMoveUp()
      } else {
        pos++
        elem.style.top = pos + 'px'
      }
    }
  }
}

function errorDivMoveUp () {
  var elem = document.getElementById('errorDiv')
  var pos = 0
  var id = setInterval(frame, 40)
  function frame () {
    if (pos == -45) {
      clearInterval(id)
      elem.style.top = pos + 'px'
    } else {
      pos--
      elem.style.top = pos + 'px'
    }
  }
}
