const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

var cors = require('cors')
app.use(cors());

var redis = require('redis');
const fs = require('fs');
const bodyParser = require('body-parser');
const payment = require('./modules/payment')

app.use(express.static('../frontend'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


var socketList = {};
var timerList = [];

app.get('/payment/debit/:stream/:user', (req, res) => {
  // we suppose we don't need any timestamp to compute the number of credits to debit
  if(payment.debitUser(parseInt(req.params.user), payment.computeCreditsToDebit("timestamp", parseInt(req.params.user), parseInt(req.params.stream))) == 0){
    payment.updatePayment(parseInt(req.params.user), parseInt(req.params.stream));
    res.json({
      "credits": payment.getUserCredits(parseInt(req.params.user))
    });
    res.status(200).end();
  } else {
    res.json({
      "credits": -1
    });
    res.status(200).end();
  }
});

app.get('/payment/credits/:user', (req, res) => {
  // we suppose we don't need any timestamp to compute the number of credits to debit
  var credits = payment.getUserCredits(parseInt(req.params.user)); 
  if(credits >= 0){
    res.json({
      "credits": credits
    });
    res.status(200).end();
  } else {
    res.json({
      "credits": -1
    });
    res.status(200).end();
  }
});

app.get('/payment/check/:stream/:user', (req, res) => {
  // we suppose we don't need any timestamp to compute the number of credits to debit
  output = payment.checkPayment(parseInt(req.params.user), parseInt(req.params.stream));
  console.log("ouela: " + output);
  if(output){
    res.json({
      "credits": true
    });
    res.status(200).end();
  } else {
    res.json({
      "credits": false
    });
    res.status(200).end();
  }
});


const cachePath = './cache.json'

const {
  Server
} = require("socket.io");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
  }
});

const port = 8080;
const TRIALTIMEDURATION = 5 * 60 * 1000;

class UserStreamEntity {
  constructor(userId, streamId, time, socketId, callback) {
    this.userId = userId;
    this.streamId = streamId;
    this.time = time;
    this.timer = new timer(function () {
      console.log("FINISH");
      callback.call()

      //eraseCache(userId,streamId)
      //console.log(timerList)
      //delete timerList[timerList.findIndex(i => {return i.userId == userId && i.streamId == streamId})];
      //timerList = timerList.filter((a) => a)
      //console.log(timerList)
    }, time)
  }
}

function timer(callback, delay) {
  var id, started, remaining = delay,
    running

  this.start = function () {
    running = true
    started = new Date()
    console.log(delay)
    if (delay >= 0) {
      id = setTimeout(callback, remaining)
    }
  }

  this.pause = function () {
    running = false
    clearTimeout(id)
    remaining -= new Date() - started
  }

  this.getTimeLeft = function () {
    if (running) {
      this.pause()
      this.start()
    }
    return remaining
  }

  this.getStateRunning = function () {
    return running
  }
  this.start()

}

//This is called by the frontend whenever the page is loaded
//in order to know the tie remaining
app.get('/timer/:stream/:user', (req, res) => {
  //Get the time remaining for the user.
  console.log(req.params.user)
  getRemainingTime(req.params.user, req.params.stream)
    .then(a => {
      if (a < 0) {
        a = 0;
      }
      res.json({
        "timer": a
      });
      res.status(402).end();
    });
});


async function writeCache(userID, streamID, time) {

  var value = userID + "|" + streamID
  return add(value, time)
}

// Récupère le temps restant d'un utilisateur pour un stream donné
async function getTimeFromCache(userID, streamID) {
  var value = userID + "|" + streamID;
  return chope(value);
}

async function getRemainingTime(userID, streamID) {
  //If user-stream combo doesn´t exist in cache -> return TRIALTIMEDURATION
  return existCache(userID + "|" + streamID).then(a => {
    console.log("a = " + a)
    if (a == 1) {
      console.log("Get Remaining Time -> Si le timer UserID|StreamID Exist ")
      //console.log("userID/streamID already exist in cache")
      let remainingTime = getTimeFromCache(userID, streamID);
      console.log("remaining time = " + remainingTime);
      return remainingTime;
    } else {

      console.log("durée max")
      return TRIALTIMEDURATION;
    }

  });

}

async function existCache(value) {
  var client = redis.createClient();
  return client.connect().then(a => {
    return client.exists(value);
  });
}

async function add(key, timer) {

  var client = redis.createClient();
  return client.connect().then(a => {

    return client.set(key, timer).then(b =>
      client.disconnect()
    );

  });

  console.log("heu")
}




async function chope(key) {

  var client = redis.createClient();

  return client.connect().then(a => {
    return client.get(key).then(b => {
      client.disconnect();
      return b;
    });
  });
}

async function addTimer(newEntry) {
  //timerList.push(newEntry);
  return writeCache(newEntry.userId, newEntry.streamId, newEntry.timer.getTimeLeft())
}

function updateCache() {

}

io.on('connection', (socket) => {

  var roomID = "";
  var userID = "";


  socket.on('init', (args) => {
    console.log("eheh")
    roomID = args['roomID'];
    userID = args['userID'];
    socket.join(args['roomID']);


    getRemainingTime(userID, roomID).then(a => {

      let remainingTime = a;
      console.log("remaining : " + remainingTime)

      if (remainingTime <= 0) {
        socketList[args['userID'] + "|" + args['roomID']] = new UserStreamEntity(args['userID'], args['roomID'], remainingTime, socket, i => {
          console.log("Timer Ended");
          socket.disconnect();
        });
        console.log("Detected negative or 0 time!");
        socket.disconnect();
      } else {
        socketList[args['userID'] + "|" + args['roomID']] = new UserStreamEntity(args['userID'], args['roomID'], remainingTime, socket, i => {
          console.log("Timer Ended");
          socket.disconnect();
        });

        console.log(socketList[userID + "|" + roomID]);
        existCache(userID + "|" + roomID).then(b => {
          if (b == 0) {
            addTimer(socketList[userID + "|" + roomID]);
          }
        });
      }

    })


    /*
    if(!existCache(userID, roomID)){
      console.log("SHIT")
      addTimer(socketList[userID + "|" +roomID]);
    }*/
  });

  socket.on('chat message', (args) => {
    socket.to(args['roomID']).emit('recieve message', ({
      "msg": args['msg'],
      "userID": args['userID'],
      "question": args['question']
    }));
  });

  socket.on('disconnect', (reason) => {
    //socketList[userID + "|" + roomID].timer.pause();
    console.log(socketList[userID + "|" + roomID])
    addTimer(socketList[userID + "|" + roomID]).then(o => {
      console.log("HELOO MY NAME IS CHIKCHIKASLIMSHADY")
      console.log(socketList[userID + "|" + roomID])
      delete socketList[userID + "|" + roomID]
      console.log("dec")
      socket.disconnect();
    });

  });

});

app.listen(8080);
console.log('Server started');

//On connection to socket -> add the socket to the correct room

server.listen(3000, () => {
  console.log('listening on *:3000');
});