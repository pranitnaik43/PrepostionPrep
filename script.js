// API: https://cloud.ibm.com/apidocs/natural-language-understanding#syntax
// cannot access the API directly using front-end JS
// therefore using cookies
fetch("sensitiveData.json")
  .then(response => { 
    return response.json();
  })
  .then(result => {
    sessionStorage.setItem("Authorization", result["Authorization"]);
    sessionStorage.setItem("Cookie", result["Cookie"]);
  })
  .catch(err => { console.log(err); })

var myHeaders = new Headers();
myHeaders.append("Authorization", sessionStorage.getItem("Authorization"));
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Cookie", sessionStorage.getItem("Cookie"));

var raw = JSON.stringify({"text":"With great power comes great responsibility","features":{"syntax":{"sentences":true,"tokens":{"part_of_speech":true}}}});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("https://api.eu-gb.natural-language-understanding.watson.cloud.ibm.com/instances/3e63004e-d3d9-40ce-97b8-0679c6c387d3/v1/analyze?version=2020-08-01", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));