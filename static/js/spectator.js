
var url = base_url;
var socket = io.connect(url);
var divOptionA, divOptionB, divOptionC, divOptionD;
var pOptionA, pOptionB, pOptionC, pOptionD;
var divQuestion, pQuestion;
var currLockedOptionIdx;
var isLockedOption = false;

socket.on('connect', function() {
    socket.send("client connect");
});

socket.on('question', function(questionObj) {
    // show question
    //console.log(questionObj);
    showQuestion(questionObj);
});

socket.on('answer', function(answerObj) {
    // show answer
    // correct answer: {'isAnsweredCorrectly': True, 'correctOptionIdx': 1, 'amountWon': 0}
    //console.log(answerObj);
    revealAnswer(answerObj);
});

socket.on('lifeline_5050', function(removedIndexes) {
    // remove 2 options
    // [0, 1]
    //console.log(removedIndexes);
});


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

function disableAllOptions(disable) {
	if(disable) {
		divOptionA.disabled = true;
	    divOptionB.disabled = true;
	    divOptionC.disabled = true;
	    divOptionD.disabled = true;

	    divOptionA.onclick = false;
	    divOptionB.onclick = false;
	    divOptionC.onclick = false;
	    divOptionD.onclick = false;
	} else {
		divOptionA.disabled = "false";
	    divOptionB.disabled = "false";
	    divOptionC.disabled = "false";
	    divOptionD.disabled = "false";
	}
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

function lockUserGivenOption(lockOptionIdx) {
	if(isLockedOption) {
		return;
	}
	isLockedOption = true;
	currLockedOptionIdx = lockOptionIdx;
	var selectedDiv = getOptionDivByIndex(lockOptionIdx);
	applyLockedAnswerStyle(selectedDiv);
	disableAllOptions(true);
	// sending locked option
	sendUserSelectedOption(lockOptionIdx);
}

function sendUserSelectedOption(lockOptionIdx) {
	socket.emit("set_audience_locked_answer", lockOptionIdx);
}

function revealAnswer(answerObj) {
    if(currLockedOptionIdx == null) {
        applyCorrectAnswerStyle(getOptionDivByIndex(answerObj.correctOptionIdx));
        return;
    }
    const optionDiv = getOptionDivByIndex(currLockedOptionIdx);
    if(currLockedOptionIdx != answerObj.correctOptionIdx) {
        // wrong answer, stop
        // marking current selected option as wrong
        applyWrongAnswerStyle(optionDiv);
        // marking correct option as answer
        applyCorrectAnswerStyle(getOptionDivByIndex(answerObj.correctOptionIdx));
    } else {
        // right answer
        // marking current selected option as right
        applyCorrectAnswerStyle(optionDiv);
    }
}

function showQuestion(question) {
    currQuestion = question;

    divOptionA.style.backgroundColor = "lightblue";
    divOptionB.style.backgroundColor = "lightblue";
    divOptionC.style.backgroundColor = "lightblue";
    divOptionD.style.backgroundColor = "lightblue";

    //divQuestion.innerHTML = question.question;
    pQuestion.innerHTML = question.question;

    // prefixes = ['-o-', '-ms-', '-moz-', '-webkit-'];
    divOptionA.style.background = "-webkit-linear-gradient(#232366 15%, #273296 90%, #232366)";
    divOptionB.style.background = "-webkit-linear-gradient(#232366 15%, #273296 90%, #232366)";
    divOptionC.style.background = "-webkit-linear-gradient(#232366 15%, #273296 90%, #232366)";
    divOptionD.style.background = "-webkit-linear-gradient(#232366 15%, #273296 90%, #232366)";

    divOptionA.style.color = "white";
    divOptionB.style.color = "white";
    divOptionC.style.color = "white";
    divOptionD.style.color = "white";

    pOptionA.innerHTML = "A. " + question.options[0];
    pOptionB.innerHTML = "B. " + question.options[1];
    pOptionC.innerHTML = "C. " + question.options[2];
    pOptionD.innerHTML = "D. " + question.options[3];

    isLockedOption = false;
    currLockedOptionIdx = null;
    disableAllOptions(false);
}

function addEventListeners() {
    divOptionA.addEventListener("click", (e) => {
        lockUserGivenOption(0);
    });

    divOptionB.addEventListener("click", (e) => {
        lockUserGivenOption(1);
    });

    divOptionC.addEventListener("click", (e) => {
        lockUserGivenOption(2);
    });

    divOptionD.addEventListener("click", (e) => {
        lockUserGivenOption(3);
    });

}

function readElements() {
    // question
    divQuestion = document.getElementById("div_question");
    pQuestion = document.getElementById("p_question");

    // options
    divOptionA = document.getElementById("div_option_a");
    divOptionB = document.getElementById("div_option_b");
    divOptionC = document.getElementById("div_option_c");
    divOptionD = document.getElementById("div_option_d");

    pOptionA = document.getElementById("p_option_a");
    pOptionB = document.getElementById("p_option_b");
    pOptionC = document.getElementById("p_option_c");
    pOptionD = document.getElementById("p_option_d");
}

$(document).ready(function() {
    readElements();
    addEventListeners();
});