
//var url = 'http://127.0.0.1:5000';
//var url = base_url;
var url = getServerBaseUrl();
var socket = io.connect(url);
var isSocketConnected = false;
var btnLoadQuestions, tableNames;

socket.on('connect', function() {
    isSocketConnected = true;
});

socket.on('get_file_names', function(file_names) {
    addNamesToTable(file_names);
});

function addNamesToTable(file_names) {
    for(let i=0; i < file_names.length; i++) {
        let file_name = file_names[i];
        var row = tableNames.insertRow(-1);
        var cell1 = row.insertCell(0);

        const button = document.createElement("button");
        button.type = "button";
        button.innerText = file_name;
        cell1.innerHTML = button.outerHTML;

        row.onclick = function() {
            console.log(file_name);
            new_url = url + "/host?file_name="+file_name;
            window.open(new_url,"_self");
        };
   }
}


function listeners() {
    btnLoadQuestions = document.getElementById("btn_load_names");
    tableNames = document.getElementById("table_names");

    btnLoadQuestions.onclick = function() {
        socket.emit("get_file_names");
    };
 }

$(document).ready(function() {
    listeners();
});