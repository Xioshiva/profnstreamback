const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

var cors = require('cors')

const { Server } = require("socket.io");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
  }
});


app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
  console.log("Connected!");
  socket.on('init', (roomID) => {
    console.log("joined to " + roomID);
    socket.join(roomID);
  });

  socket.on('chat message', (args)  => {
    console.log("msg: " + args['msg'] + " roomID: " + args['roomID'] + " userID: " + args['userID']);

    console.log("Sending");
    socket.to(args['roomID']).emit('recieve message', ({"msg": args['msg'], "userID" : args['userID']}));
    console.log("Sent");
    //Add to cache
  });

  console.log('a user connected');
});

//On connection to socket -> add the socket to the correct room

server.listen(3000, () => {
  console.log('listening on *:3000');
});


