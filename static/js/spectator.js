
//var url = base_url;
var url = getServerBaseUrl();
var socket = io.connect(url);

var divQuestionBack, divQuestionText;
var divOptionABack, divOptionBBack, divOptionCBack, divOptionDBack;
var divOptionAText, divOptionBText, divOptionCText, divOptionDText;

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
        selectedDiv = divOptionABack;
    } else if(optionIdx == 1) {
        selectedDiv = divOptionBBack;
    } else if(optionIdx == 2) {
        selectedDiv = divOptionCBack;
    } else if(optionIdx == 3) {
        selectedDiv = divOptionDBack;
    }
    return selectedDiv;
}

function getOptionDivTextByIndex(optionIdx) {
    var selectedDiv = "";
    if(optionIdx == 0) {
        selectedDiv = divOptionAText;
    } else if(optionIdx == 1) {
        selectedDiv = divOptionBText;
    } else if(optionIdx == 2) {
        selectedDiv = divOptionCText;
    } else if(optionIdx == 3) {
        selectedDiv = divOptionDText;
    }
    return selectedDiv;
}

function disableAllOptions(disable) {
	if(disable) {
		divOptionABack.disabled = true;
	    divOptionBBack.disabled = true;
	    divOptionCBack.disabled = true;
	    divOptionDBack.disabled = true;

	    divOptionABack.onclick = false;
	    divOptionBBack.onclick = false;
	    divOptionCBack.onclick = false;
	    divOptionDBack.onclick = false;
	} else {
		divOptionABack.disabled = "false";
	    divOptionBBack.disabled = "false";
	    divOptionCBack.disabled = "false";
	    divOptionDBack.disabled = "false";
	}
}

function applyLockedAnswerStyle(optionDiv, optionIdx) {
    //optionDiv.style.backgroundColor = "yellow";
    optionDiv.style.backgroundImage = 'url(static/images/div_option_back_locked.svg)';
    getOptionDivTextByIndex(optionIdx).style.color = "black";
}

function applyCorrectAnswerStyle(optionDiv, optionIdx) {
    //optionDiv.style.backgroundColor = "green";
    optionDiv.style.backgroundImage = 'url(static/images/div_option_back_correct.svg)';
    getOptionDivTextByIndex(optionIdx).style.color = "black";
}

function applyWrongAnswerStyle(optionDiv, optionIdx) {
    //optionDiv.style.backgroundColor = "red";
    optionDiv.style.backgroundImage = 'url(static/images/div_option_back_wrong.svg)';
    getOptionDivTextByIndex(optionIdx).style.color = "black";
}

function lockUserGivenOption(lockOptionIdx) {
	if(isLockedOption) {
		return;
	}
	isLockedOption = true;
	currLockedOptionIdx = lockOptionIdx;
	var selectedDiv = getOptionDivByIndex(lockOptionIdx);
	applyLockedAnswerStyle(selectedDiv, lockOptionIdx);
	disableAllOptions(true);
	// sending locked option
	sendUserSelectedOption(lockOptionIdx);
}

function sendUserSelectedOption(lockOptionIdx) {
	socket.emit("set_audience_locked_answer", lockOptionIdx);
}

function revealAnswer(answerObj) {
    if(currLockedOptionIdx == null) {
        applyCorrectAnswerStyle(getOptionDivByIndex(answerObj.correctOptionIdx), answerObj.correctOptionIdx);
        return;
    }
    const optionDiv = getOptionDivByIndex(currLockedOptionIdx);
    if(currLockedOptionIdx != answerObj.correctOptionIdx) {
        // wrong answer, stop
        // marking current selected option as wrong
        applyWrongAnswerStyle(optionDiv, currLockedOptionIdx);
        // marking correct option as answer
        applyCorrectAnswerStyle(getOptionDivByIndex(answerObj.correctOptionIdx), answerObj.correctOptionIdx);
    } else {
        // right answer
        // marking current selected option as right
        applyCorrectAnswerStyle(optionDiv, currLockedOptionIdx);
    }
}

function showQuestion(question) {
    currQuestion = question;

    divOptionABack.style.backgroundImage = 'url(static/images/div_option_back.svg)';
    divOptionBBack.style.backgroundImage = 'url(static/images/div_option_back.svg)';
    divOptionCBack.style.backgroundImage = 'url(static/images/div_option_back.svg)';
    divOptionDBack.style.backgroundImage = 'url(static/images/div_option_back.svg)';

    divQuestionText.innerHTML = question.question;

    divOptionAText.style.color = "white";
    divOptionBText.style.color = "white";
    divOptionCText.style.color = "white";
    divOptionDText.style.color = "white";

    divOptionAText.innerHTML = "A. " + question.options[0];
    divOptionBText.innerHTML = "B. " + question.options[1];
    divOptionCText.innerHTML = "C. " + question.options[2];
    divOptionDText.innerHTML = "D. " + question.options[3];

    isLockedOption = false;
    currLockedOptionIdx = null;
    disableAllOptions(false);
}

function addEventListeners() {
    divOptionABack.addEventListener("click", (e) => {
        lockUserGivenOption(0);
    });

    divOptionBBack.addEventListener("click", (e) => {
        lockUserGivenOption(1);
    });

    divOptionCBack.addEventListener("click", (e) => {
        lockUserGivenOption(2);
    });

    divOptionDBack.addEventListener("click", (e) => {
        lockUserGivenOption(3);
    });

}

function readElements() {
    // question
    divQuestionBack = document.getElementById("div_question_back");
    divQuestionText = document.getElementById("div_question_text");

    // options
    divOptionABack = document.getElementById("div_option_a_back");
    divOptionBBack = document.getElementById("div_option_b_back");
    divOptionCBack = document.getElementById("div_option_c_back");
    divOptionDBack = document.getElementById("div_option_d_back");
    divOptionAText = document.getElementById("div_option_a_text");
    divOptionBText = document.getElementById("div_option_b_text");
    divOptionCText = document.getElementById("div_option_c_text");
    divOptionDText = document.getElementById("div_option_d_text");
}

$(document).ready(function() {
    readElements();
    addEventListeners();

    /*const options = ["some long option which can ", "Option B", "Option C", "Option D"];
    var question = new Question("Question 1, some long question to see how it's gonna display", options, 0, 1, 0, "explanation", 10);
    showQuestion(question);*/
});