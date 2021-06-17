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

// var raw = JSON.stringify({"text":"With great power comes great responsibility","features":{"syntax":{"tokens":{"part_of_speech":true}}}});
// var requestOptions = {
//   method: 'POST',
//   headers: myHeaders,
//   body: raw,
//   redirect: 'follow'
// };

var endingPoint = " ##--## ";
var answers = [];
var ansStr = [];
var totalQuestions = 0;
var rightAnsColor = "rgba(102, 255, 153, 0.5)";
var wrongAnsColor = "rgba(255, 102, 102, 0.5)";

function createQuestions(quotes) {
  var para = ""
  quotes.forEach(quote => {
    para += quote.content + endingPoint;
  });
  var raw = JSON.stringify({"text":para ,"features":{"syntax":{"tokens":{"part_of_speech":true}}}});
  // console.log(raw);
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  fetch("https://api.eu-gb.natural-language-understanding.watson.cloud.ibm.com/instances/3e63004e-d3d9-40ce-97b8-0679c6c387d3/v1/analyze?version=2020-08-01", requestOptions)
  .then(response => response.json())
  .then(result => {
    // console.log(result);
    // console.log(result.syntax);
    let myContainer = document.querySelector('.myContainer');
    var tokens = result.syntax.tokens;
    var i = 0;
    var str = "";
    let quesNum = 1;
    let question = createMyElement('div', quesNum+". ", 'question');
    var answer = [];
    ansStr.push("");
    while(i<tokens.length) {
      if(tokens[i]["part_of_speech"] == "PUNCT") {
        str+=tokens[i]["text"];
      }
      else if(tokens[i]["part_of_speech"] == "ADP") {
        answer.push(tokens[i]["text"]);
        var myInput = createMyInput(quesNum, answer.length);
        var myLabel = createMyLabel(str + " ");
        ansStr[quesNum-1]+=str + " " + tokens[i]["text"];
        str = "";
        question.append(myLabel, myInput);
      }
      else if(tokens[i]["text"] == endingPoint.trim()){
        var myLabel = createMyLabel(str);
        ansStr[quesNum-1]+=str;
        str = "";
        question.append(myLabel);
        if(answer.length>0){     //add the question only if it contains adposition
          question.id = 'question' + quesNum;
          myContainer.append(question);
          answers.push(answer);
          quesNum++;
        }
        else {
          ansStr.pop();
        }
        question = createMyElement('div', quesNum+". ", 'question');
        answer = [];
        ansStr.push("");
      }
      else{
        str+= " " + tokens[i]["text"];
      }
      i++;
    }
    totalQuestions =  quesNum-1;
  })
  .catch(error => console.log('error', error));
}

function createMyInput(quesNum, ansNum) {
  var myInput = createMyElement('input', '', 'myInput my-1' + ' ' + 'ques' + quesNum + "ans" + ansNum);
  return myInput;
}

function createMyLabel(str) {
  var div = createMyElement('div', str, 'myLabel');
  return div;
}

function createMyElement(tag, value="", classes="", id="") {
  var element = document.createElement(tag);
  if(value!="")
    element.innerHTML = value;
  if(classes!="")
    element.setAttribute('class', classes);
  if(id!="")
    element.setAttribute('id', id);
  return element;
}

function randomNum() {
  return Math.floor(Math.random() * 100);
}

var quotesURL = "https://api.quotable.io/quotes?limit=10&page="
var maxPages = 94;

var page = randomNum() % maxPages;
// console.log(page);
fetch(quotesURL+page)
  .then(response => { return response.json(); })
  .then(result => { 
    console.log(result); 
    if(result && result.results){
      createQuestions(result.results);
    }
  })
  .catch(err => { console.log(err); })

function submit() {
  var score = 0;
  console.log(answers);
  for(var quesNum=1; quesNum<=totalQuestions; quesNum++) {
    var ansPoints = 0;
    answers[quesNum-1].forEach((answer, index) => {
      var userAns = document.querySelector('.ques'+(quesNum)+'ans'+(index+1));
      userAns.disabled = true;
      if(userAns.value.trim()==answer) {
        ansPoints++;
        userAns.style.backgroundColor = rightAnsColor;
      }
      else {
        userAns.style.backgroundColor = wrongAnsColor;
      }
    });
    if(ansPoints == answers[quesNum-1].length){
      score++;
    }
    else {
      var ques = document.querySelector('#question'+quesNum);
      var ans = createMyElement('div', ansStr[quesNum-1]); 
      ans.style.backgroundColor = rightAnsColor;
      var br = createMyElement('br'); 
      ques.append(br, ans);
    }
    var scoreDiv = document.querySelector('.score');
    scoreDiv.innerText = "Score: " + score;
  }
}