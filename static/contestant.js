
//var url = 'http://192.168.1.48:5000';
var url = base_url;
var socket = io.connect(url);
var divTable = "";
var divOptionA, divOptionB, divOptionC, divOptionD;
var pOptionA, pOptionB, pOptionC, pOptionD;
var divQuestion, divWonAmount, pQuestion;
var currLockedOptionIdx = "";
var spTimer, spWonAmount;
const wonAmountShowSeconds = 5000;
const wrongAnswerShowSeconds = 4000;
const rightAnswerShowSeconds = 4000;
const showAnswerAfterSeconds = 4000;

socket.on('connect', function() {
    socket.send("client connect");
});

socket.on('message', function(msg) {
    console.log(msg);
});

socket.on('curr_timer', function(time) {
    console.log(time);
    updateTimer(time);
});

socket.on('question', function(questionObj) {
    // show question
    console.log(questionObj);
    showHideTableDiv(true);
    showQuestion(questionObj);
});

socket.on('locked_answer', function(msg) {
    // locked answer
    //console.log(msg);
    const selectedOptionIdx = msg;
    currLockedOptionIdx = selectedOptionIdx;
    setLockedAnswer(selectedOptionIdx);
});

socket.on('answer', function(answerObj) {
    // show answer
    // correct answer: {'isAnsweredCorrectly': True, 'correctOptionIdx': 1, 'amountWon': 0}
    console.log(answerObj);
    revealAnswer(answerObj);
});

function showHideTableDiv(show) {
    if(show) {
        divTable.style.display = "block";
    } else {
        divTable.style.display = "none";
    }
}

function showHideDivSection(div, show) {
    if(show) {
        div.style.display = "block";
    } else {
        div.style.display = "none";
    }
}

function revealAnswer(answerObj) {
    const optionDiv = getOptionDivByIndex(currLockedOptionIdx);
    if(currLockedOptionIdx != answerObj.correctOptionIdx) {
        // wrong answer, stop
        // marking current selected option as wrong
        applyWrongAnswerStyle(optionDiv);
        // marking correct option as answer
        applyCorrectAnswerStyle(getOptionDivByIndex(answerObj.correctOptionIdx));
        // show amount won
        window.setTimeout(showWonAmount, showAnswerAfterSeconds, answerObj.amountWon);
    } else {
        // right answer, show won amount
        // marking current selected option as right
        applyCorrectAnswerStyle(optionDiv);
        //showHideTableDiv(false);
        window.setTimeout(showWonAmount, showAnswerAfterSeconds, answerObj.amountWon);
    }
}

function showWonAmount(amount) {
    spWonAmount.innerHTML = "Rs. " + String(amount);
    showHideTableDiv(false);
    showHideDivSection(divWonAmount, true);
    window.setTimeout(showHideDivSection, wonAmountShowSeconds, divWonAmount, false);
}

function showQuestion(question) {
    divOptionA.style.backgroundColor = "lightblue";
    divOptionB.style.backgroundColor = "lightblue";
    divOptionC.style.backgroundColor = "lightblue";
    divOptionD.style.backgroundColor = "lightblue";

    //divQuestion.innerHTML = question.question;
    pQuestion.innerHTML = question.question;

    /*divOptionA.innerHTML = question.options[0];
    divOptionB.innerHTML = question.options[1];
    divOptionC.innerHTML = question.options[2];
    divOptionD.innerHTML = question.options[3];*/

    // prefixes = ['-o-', '-ms-', '-moz-', '-webkit-'];
    divOptionA.style.background = "-webkit-linear-gradient(#232366 15%, #273296 90%, #232366)";
    divOptionB.style.background = "-webkit-linear-gradient(#232366 15%, #273296 90%, #232366)";
    divOptionC.style.background = "-webkit-linear-gradient(#232366 15%, #273296 90%, #232366)";
    divOptionD.style.background = "-webkit-linear-gradient(#232366 15%, #273296 90%, #232366)";

    divOptionA.style.color = "white";
    divOptionB.style.color = "white";
    divOptionC.style.color = "white";
    divOptionD.style.color = "white";

    pOptionA.innerHTML = question.options[0];
    pOptionB.innerHTML = question.options[1];
    pOptionC.innerHTML = question.options[2];
    pOptionD.innerHTML = question.options[3];

    // marking time empty initially
    updateTimer("");
}

function getOptionDivByIndex(optionIdx) {
    var selectedDiv = "";
    if(optionIdx == 0) {
        selectedDiv = divOptionA;
    } else if(optionIdx == 1) {
        selectedDiv = divOptionB;
    } else if(optionIdx == 2) {
        selectedDiv = divOptionC;
    } else if(optionIdx == 3) {
        selectedDiv = divOptionD;
    }
    return selectedDiv;
}

function setLockedAnswer(selectedOptionIdx) {
    var selectedDiv = "";
    selectedDiv = getOptionDivByIndex(selectedOptionIdx);
    applyLockedAnswerStyle(selectedDiv);
}

function updateTimer(time) {
    spTimer.innerHTML = time;
}

function applyLockedAnswerStyle(optionDiv) {
    //optionDiv.style.backgroundColor = "yellow";
    optionDiv.style.background = "yellow";
    optionDiv.style.color = "black";
}

function applyCorrectAnswerStyle(optionDiv) {
    //optionDiv.style.backgroundColor = "green";
    optionDiv.style.background = "green";
    optionDiv.style.color = "black";
}

function applyWrongAnswerStyle(optionDiv) {
    //optionDiv.style.backgroundColor = "red";
    optionDiv.style.background = "red";
    optionDiv.style.color = "black";
}

function readElements() {
    divTable = document.getElementById("div_table");
    divQuestion = document.getElementById("div_question");
    pQuestion = document.getElementById("p_question");

    divOptionA = document.getElementById("div_option_a");
    divOptionB = document.getElementById("div_option_b");
    divOptionC = document.getElementById("div_option_c");
    divOptionD = document.getElementById("div_option_d");

    pOptionA = document.getElementById("p_option_a");
    pOptionB = document.getElementById("p_option_b");
    pOptionC = document.getElementById("p_option_c");
    pOptionD = document.getElementById("p_option_d");

    divWonAmount = document.getElementById("div_won_amount");

    spTimer = document.getElementById("sp_timer");
    spWonAmount = document.getElementById("sp_won_amount");
}

$(document).ready(function() {
    readElements();
    showHideTableDiv(false);
    showHideDivSection(divWonAmount, false);
});