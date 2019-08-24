var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var bodyParser = require('body-parser');
var fs = require("fs");
var request = require('request');
var serverPort = 1234;

app.use(express.static('static'));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));

io.on('connection', function(socket) {
    function log() {
        var array = [">>> "];
        
        for(var i = 0; i < arguments.length; i++) {
                array.push(arguments[i]);
        }
        socket.emit('log', array);
    }
    socket.on('message', function (message) {
        log('Got message: ', message);
        socket.broadcast.emit('message', message); // should be room only
    });
    socket.on('create or join', function (room) {
        var numClients = io.sockets.clients(room).length;

        log('Room ' + room + ' has ' + numClients + ' client(s)');
        log('Request to create or join room', room);

        if (numClients == 0) {
            socket.join(room);
            socket.emit('created', room);
        } 
        else if(numClients == 1) {
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room);
        } 
        else {
            socket.emit('full', room);
        }
        socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
        socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
    });
});


http.listen(serverPort, function() {    
    console.log(`Server is started at port ${serverPort}\nTo close use Ctrl+C`);
});
