

var socket = io.connect('http://127.0.0.1:5000');

socket.on('connect', function() {
    socket.send("client connect");
});

socket.on('message', function(msg) {
    console.log(msg);
});