var WebSocket = require("ws");

var client = new WebSocket('ws://127.0.0.1:20000');
client.on("open", ()=>{
    console.log("client, open");
    client.send(JSON.stringify({nick:'lixxix'}));
});

client.on("message", data=>{
    console.log(data);
});

client.on("close", function(code, reason){
    console.log(code,reason);
});