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

function insertParam (key, value) { // https://stackoverflow.com/questions/486896/adding-a-parameter-to-the-url-with-javascript
  key = escape(key); value = escape(value)

  var kvp = document.location.search.substr(1).split('&')
  if (kvp === '') {
    document.location.search = '?' + key + '=' + value
  } else {
    var i = kvp.length; var x; while (i--) {
      x = kvp[i].split('=')

      if (x[0] === key) {
        x[1] = value
        kvp[i] = x.join('=')
        break
      }
    }

    if (i < 0) { kvp[kvp.length] = [key, value].join('=') }

    // this will reload the page, it's likely better to store this until finished
    document.location.search = kvp.join('&')
  }
}
