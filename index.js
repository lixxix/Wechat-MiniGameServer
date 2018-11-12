const WebSocket = require("ws")
const http = require("http");
const MSG = require("./message");
const Service = require("./Server")

var service = new Service();

var server = http.createServer((req, res) => {
    res.end("yes");
}).listen(20000);

var socketManager = new Map();

const wsServer = new WebSocket.Server({ server });

wsServer.on("connection", (socket, req) => {

    // socketManager.set(socket, socket);
    socket.SendToServer = function(id, data){
        let obj = {
            id,
            type:1,
            data
        };
        socket.send(JSON.stringify(obj));
    }

    socket.SendToGame = function(id, data){
        let obj = {
            id,
            type:2,
            data
        };
        socket.send(JSON.stringify(obj));
    }
  
    socket.on("close", (code, reason) => {
        // socketManager.delete(socket);
        service.OnUserLeave(socket);
    });

    socket.on("message", data => {
        service.OnMessageRead(socket,data)
    });
});

wsServer.on("error", error => {
    console.log(error);
});
