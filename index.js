const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

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


let connections = {};

const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};

const constraints = {
  video: { facingMode: "user" }
  // Uncomment to enable audio
  // audio: true,
};

io.on('connection', (socket) => {
  console.log("Connected!");
  socket.on('init', (roomID) => {
    console.log("joined to " + roomID);
    socket.join(roomID);

    //Initiate webRTC p2p connection
    const con = new RTCPeerConnection(config);
    connections[socket] = con;

    let stream = "AH"; //insert data;
    stream.getTracks().forEach(track => con.addTrack(track, stream));

    con.onicecandidate = event => {
      if(event.candidate){
        socket.emit("candidate", socket, event.candidate);
      }
    }

    con
      .createOffer()
      .then(sdp => con.setLocalDescription(sdp))
      .then(() =>{
        socket.emit("offer", id, con.localDescription)
      });
  });

  socket.on('answer', (socket, descr)=>{
    con[id].setRemoteDescription(descr);
  });

  socket.on("candidate", (socket, candidate) =>{
    connections[socket].addIceCandidate(new RTCIceCandidate(candidate));
  });


  server.on("close", socket =>{
    connections[socket].close();
    delete connections[socket];
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


