
//var url = 'http://192.168.1.48:5000';
var url = getServerBaseUrl();
var socket = io.connect(url);
var divTable = "";
var divWonAmount;

var divQuestionBack, divQuestionText;
var divOptionABack, divOptionBBack, divOptionCBack, divOptionDBack;
var divOptionAText, divOptionBText, divOptionCText, divOptionDText;

var divLifelines, imgLifeline1, imgLifeline2, imgLifeline3;
var divAudiencePoll;
var divLogo;
var currLockedOptionIdx = "";
var divTimer, spTimer, spWonAmount;
const wonAmountShowSeconds = 4000;
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
    //console.log(time);
    updateTimer(time);
});

socket.on('question', function(questionObj) {
    // show question
    //console.log(questionObj);
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

socket.on('lifelines', function(lifelinesObj) {
    // show lifelines
    // Lifelines: {'lifelines': [{'isUsed': True, 'name': 'Audience Poll'}, {'isUsed': True, 'name': '50:50'},
    // {'isUsed': True, 'name': 'Dial A Dost'}], 'showLifeLines': False}
    console.log(lifelinesObj);
    showLifeLines(lifelinesObj);
    if(!lifelinesObj.showLifeLines) {
        showHideDivSection(divAudiencePoll, false);
    }
});

socket.on('lifeline_5050', function(removedIndexes) {
    // remove 2 options
    // [0, 1]
    console.log(removedIndexes);
    activateLifeline5050(removedIndexes);
});

socket.on('audience_poll_data', function(audiencePollData) {
    console.log(audiencePollData);
    //showHideDivSection(divLifelines, false);
    showHideLifelinesDivSection(false);
    showAudiencePollData(audiencePollData);
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

function showHideLifelinesDivSection(show) {
    const trOption1 = document.getElementById("tr_option_row_1");
    const trOption2 = document.getElementById("tr_option_row_2");
    const trLifelines = document.getElementById("tr_lifelines");

    if(show) {
        trOption1.setAttribute("hidden", "hidden");
        trOption2.setAttribute("hidden", "hidden");
        trLifelines.removeAttribute("hidden");
    } else {
        trLifelines.setAttribute("hidden", "hidden");
        trOption1.removeAttribute("hidden");
        trOption2.removeAttribute("hidden");
    }
}

function revealAnswer(answerObj) {
    const optionDiv = getOptionDivByIndex(currLockedOptionIdx);
    if(currLockedOptionIdx != answerObj.correctOptionIdx) {
        // wrong answer, stop
        // marking current selected option as wrong
        applyWrongAnswerStyle(optionDiv, currLockedOptionIdx);
        // marking correct option as answer
        applyCorrectAnswerStyle(getOptionDivByIndex(answerObj.correctOptionIdx), answerObj.correctOptionIdx);
        // show amount won
        window.setTimeout(showWonAmount, showAnswerAfterSeconds, answerObj.amountWon);
    } else {
        // right answer, show won amount
        // marking current selected option as right
        applyCorrectAnswerStyle(optionDiv, currLockedOptionIdx);
        //showHideTableDiv(false);
        window.setTimeout(showWonAmount, showAnswerAfterSeconds, answerObj.amountWon);
    }
}

function showWonAmount(amount) {
    showHideDivSection(divLogo, true);

    spWonAmount.innerHTML = "Rs. " + String(amount);
    showHideTableDiv(false);
    showHideDivSection(divWonAmount, true);
    window.setTimeout(showHideDivSection, wonAmountShowSeconds, divWonAmount, false);
}

function activateLifeline5050(removedIndexes) {
    for(let i=0; i<removedIndexes.length; i++) {
        let indexToRemove = removedIndexes[i];
        getOptionEleByIndex(indexToRemove).innerHTML = "";
    }
}

function showAudiencePollData(audienceData) {
    //audienceData = [10,0,1,1];
    showHideDivSection(div_audience_poll, true);

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Option');
    data.addColumn('number', 'Percentage');
    data.addColumn({ role: 'style' }, 'style');
    data.addColumn({ role: 'annotation' }, 'annotation');

    var totVotes = 0;
    for(let i=0; i<audienceData.length; i++) {
        totVotes += audienceData[i];
    }

    const optionNames = ['A', 'B', 'C', 'D'];

    for(let i=0; i<audienceData.length; i++) {
        var optionPerc = (audienceData[i]/totVotes)*100;
        optionPerc = Math.round(optionPerc);

        barStyle = 'stroke-color: #232366; stroke-opacity: 0.6; stroke-width: 2; fill-color: #273296;'
        const val = [optionNames[i], optionPerc, barStyle, String(optionPerc)+"%"];
        data.addRow(val);
    }
    
    var options = {'title':'Audience Poll',
        vAxis: {
            minValue: 0,
            maxValue: 100
        },
        'width':400,
        'height':300};

    // Instantiate and draw the chart.
    var chart = new google.visualization.ColumnChart(document.getElementById('div_audience_poll_chart'));
    chart.draw(data, options);
}

function showQuestion(question) {
    showHideTableDiv(true);
    showHideDivSection(divLogo, false);

    if(question.maxSeconds == 0) {
        showHideDivSection(divTimer, false);
    } else {
        showHideDivSection(divTimer, true);
    }

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

    // marking time empty initially
    updateTimer("");
}

function showLifeLines(lifelinesObj) {
    if(!lifelinesObj.showLifeLines) {
        //showHideDivSection(divLifelines, false);
        showHideLifelinesDivSection(false);
        return;
    }

    //showHideDivSection(divLifelines, true);
    showHideLifelinesDivSection(true);
    const lineHideOpacity = 0.3;
    if(lifelinesObj.lifelines[0].isUsed) {
        //imgLifeline1.style.opacity = lineHideOpacity;
        imgLifeline1.src = "static/images/audience_poll_used.png"
    }
    if(lifelinesObj.lifelines[1].isUsed) {
        // it's 50:50, remove 2 options
        //imgLifeline2.style.opacity = lineHideOpacity;
        imgLifeline2.src = "static/images/lifeline_5050_used.png"
    }
    if(lifelinesObj.lifelines[2].isUsed) {
        //imgLifeline3.style.opacity = lineHideOpacity;
        imgLifeline3.src = "static/images/lifeline_call_used.png"
    }
}

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

function getOptionEleByIndex(optionIdx) {
    var selectedEle = "";
    if(optionIdx == 0) {
        selectedEle = divOptionAText;
    } else if(optionIdx == 1) {
        selectedEle = divOptionBText;
    } else if(optionIdx == 2) {
        selectedEle = divOptionCText;
    } else if(optionIdx == 3) {
        selectedEle = divOptionDText;
    }
    return selectedEle;
}

function setLockedAnswer(selectedOptionIdx) {
    var selectedDiv = "";
    selectedDiv = getOptionDivByIndex(selectedOptionIdx);
    applyLockedAnswerStyle(selectedDiv, selectedOptionIdx);
}

function updateTimer(time) {
    spTimer.innerHTML = time;
}

function applyLockedAnswerStyle(optionDiv, optionIndex) {
    //optionDiv.style.backgroundColor = "yellow";
    optionDiv.style.backgroundImage = 'url(static/images/div_option_back_locked.svg)';
    //optionDiv.style.color = "black";
    getOptionEleByIndex(optionIndex).style.color = "black";
}

function applyCorrectAnswerStyle(optionDiv, optionIndex) {
    //optionDiv.style.backgroundColor = "green";
    optionDiv.style.backgroundImage = 'url(static/images/div_option_back_correct.svg)';
    //optionDiv.style.color = "black";
    getOptionEleByIndex(optionIndex).style.color = "black";
}

function applyWrongAnswerStyle(optionDiv, optionIndex) {
    //optionDiv.style.backgroundColor = "red";
    optionDiv.style.backgroundImage = 'url(static/images/div_option_back_wrong.svg)';
    //optionDiv.style.color = "black";
    getOptionEleByIndex(optionIndex).style.color = "black";
}

function readElements() {
    divTable = document.getElementById("div_table");

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

    divWonAmount = document.getElementById("div_won_amount");

    spTimer = document.getElementById("sp_timer");
    spWonAmount = document.getElementById("sp_won_amount");

    // lifelines
    divLifelines = document.getElementById("div_lifelines");
    imgLifeline1 = document.getElementById("img_line1");
    imgLifeline2 = document.getElementById("img_line2");
    imgLifeline3 = document.getElementById("img_line3");

    divLogo = document.getElementById("div_logo");
    divTimer = document.getElementById("div_timer");

    divAudiencePoll = document.getElementById("div_audience_poll");
}

$(document).ready(function() {
    readElements();
    showHideTableDiv(false);
    //showHideDivSection(divLifelines, false);
    showHideLifelinesDivSection(false);
    showHideDivSection(divWonAmount, false);
    google.charts.load('current', {packages: ['corechart', 'bar']});
    //google.charts.setOnLoadCallback(showAudiencePollData);

    const options = ["some long option which can ", "Option B", "Option C", "Option D"];
    var question = new Question("Question 1, some long question to see how it's gonna display", options, 0, 1, 0, "explanation", 10);
    showQuestion(question);

});