function loadHTML (myDivId, url, callback) { // https://stackoverflow.com/questions/34330919/jquery-load-template-html-in-pure-javascript
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
        callback()
      } else {
        alert('Error')
      }
    }
  }

  xmlhttp.open('GET', url, true)
  xmlhttp.send()
}

function ajaxPost (action, data, callback) {
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
        let response = JSON.parse(request.ressponse)
        if (response.result) {
          return response.result
        } else {
          console.log('ajaxPostError')
        }
      }
    }
  }
  request.send(data)
}

function ajaxGet (action, cFunction) {
  let request = new XMLHttpRequest()
  let url = 'controller.php?action=' + action
  // let data = new FormData()
  // data.append('userName', userName)
  // data.append('passWord', passWord)
  request.open('GET', url, true)
  // request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        console.log(this)
        cFunction(this)
      }
    }
  }
  request.send()
}
