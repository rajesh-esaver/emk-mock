
//var url = 'http://192.168.1.48:5000';
var url = getServerBaseUrl();
var socket = io.connect(url);
var divTable = "";
var divOptionA, divOptionB, divOptionC, divOptionD;
var pOptionA, pOptionB, pOptionC, pOptionD;
var divQuestion, divWonAmount, pQuestion;

var divQuestionBack, divQuestionText;
var divOptionABack, divOptionAText;

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
    //revealAnswer(answerObj);
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
    showHideDivSection(divLifelines, false);
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

    //var svg = document.getElementById('obj_option_a').contentDocument;
    //console.log(svg);
    //svg.getElementById("option").textContent = 'red';

    //divOptionA.style.backgroundColor = "lightblue";
    divOptionB.style.backgroundColor = "lightblue";
    divOptionC.style.backgroundColor = "lightblue";
    divOptionD.style.backgroundColor = "lightblue";

    //divQuestion.innerHTML = question.question;
    //pQuestion.innerHTML = question.question;
    divQuestionText.innerHTML = question.question;

    // prefixes = ['-o-', '-ms-', '-moz-', '-webkit-'];
    //divOptionA.style.background = "-webkit-linear-gradient(#232366 15%, #273296 90%, #232366)";
    divOptionB.style.background = "-webkit-linear-gradient(#232366 15%, #273296 90%, #232366)";
    divOptionC.style.background = "-webkit-linear-gradient(#232366 15%, #273296 90%, #232366)";
    divOptionD.style.background = "-webkit-linear-gradient(#232366 15%, #273296 90%, #232366)";

    //divOptionA.style.color = "white";
    divOptionB.style.color = "white";
    divOptionC.style.color = "white";
    divOptionD.style.color = "white";

    //pOptionA.innerHTML = "A. " + question.options[0];
    divOptionAText.innerHTML = "A. " + question.options[0];
    pOptionB.innerHTML = "B. " + question.options[1];
    pOptionC.innerHTML = "C. " + question.options[2];
    pOptionD.innerHTML = "D. " + question.options[3];

    // marking time empty initially
    updateTimer("");
}

function showLifeLines(lifelinesObj) {
    if(!lifelinesObj.showLifeLines) {
        showHideDivSection(divLifelines, false);
        return;
    }
    showHideDivSection(divLifelines, true);
    const lineHideOpacity = 0.3;
    if(lifelinesObj.lifelines[0].isUsed) {
        imgLifeline1.style.opacity = lineHideOpacity;
    }
    if(lifelinesObj.lifelines[1].isUsed) {
        // it's 50:50, remove 2 options
        imgLifeline2.style.opacity = lineHideOpacity;
    }
    if(lifelinesObj.lifelines[2].isUsed) {
        imgLifeline3.style.opacity = lineHideOpacity;
    }
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

function getOptionEleByIndex(optionIdx) {
    var selectedEle = "";
    if(optionIdx == 0) {
        selectedEle = pOptionA;
    } else if(optionIdx == 1) {
        selectedEle = pOptionB;
    } else if(optionIdx == 2) {
        selectedEle = pOptionC;
    } else if(optionIdx == 3) {
        selectedEle = pOptionD;
    }
    return selectedEle;
}

function setLockedAnswer(selectedOptionIdx) {
    //var svg = document.getElementById('obj_option_a').contentDocument;
    /*console.log(svg);
    console.log(svg.getElementById('linear-border-line'));
    //svg.getElementById("box").style.fill = 'red';
    svg.getElementById("box").style.fill = svg.getElementById('linear-border-line');*/
    //document.getElementById('obj_option_a').setAttribute("data", 'static/images/test.svg');
    divOptionABack.style.backgroundImage = 'url(static/images/test.svg)';
    return;

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
    divQuestionBack = document.getElementById("div_question_back");
    divQuestionText = document.getElementById("div_question_text");
    pQuestion = document.getElementById("p_question");

    divOptionA = document.getElementById("div_option_a");
    divOptionB = document.getElementById("div_option_b");
    divOptionC = document.getElementById("div_option_c");
    divOptionD = document.getElementById("div_option_d");
    divOptionABack = document.getElementById("div_option_a_back");
    divOptionAText = document.getElementById("div_option_a_text");


    pOptionA = document.getElementById("p_option_a");
    pOptionB = document.getElementById("p_option_b");
    pOptionC = document.getElementById("p_option_c");
    pOptionD = document.getElementById("p_option_d");

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
    showHideDivSection(divLifelines, false);
    showHideDivSection(divWonAmount, false);
    google.charts.load('current', {packages: ['corechart', 'bar']});
    //google.charts.setOnLoadCallback(showAudiencePollData);

    const options = ["some long option which can ", "Option B", "Option C", "Option D"];
    var question = new Question("Question 1, some long question to see how it's gonna display", options, 0, 1, 0, "explanation", 10);
    showQuestion(question);

    //var a = document.getElementById('obj_option_a');
    //divOptionABack.style.backgroundImage = 'url(static/images/test.svg)';
    //a.setAttribute("data", 'static/images/test.svg');
    //a.data = "images/div_option_back.svg"
    /*a.addEventListener("load",function(){
        // get the inner DOM of alpha.svg
        var svgDoc = a.contentDocument;
        //svgDoc.getElementById("box").style.fill = 'red';
        //var gradient = svgDoc.getElementById('radial-question');
        //svgDoc.getElementById("box").style.fill = gradient.attributes;

        //svgDoc.getElementById("box").setAttribute({fill: 'url(#radial-question)'});
        //svgDoc.getElementById("box").style.fill = url('#radial-question');
        console.log("hello");
        //document.getElementById('obj_option_b').innerHTMl = svgDoc;
        //svgDoc.getElementById("option").textContent = question.question;
    }, false);*/

    /*var a = document.getElementById('obj_option_a');
    a.addEventListener("load",function(){
        // get the inner DOM of alpha.svg
        var svgDoc = a.contentDocument;
        svgDoc.getElementById("option").textContent = question.question;
    }, false);*/
});