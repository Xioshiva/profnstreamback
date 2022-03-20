const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
var cors = require('cors')
const fs = require('fs');
const bodyParser = require('body-parser');

app.use(cors());

app.use(express.static('../frontend'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


var redis = require('redis');



var socketList = {};
var timerList = [];

const cachePath = './cache.json'

const { Server } = require("socket.io");
const path = require('path');
const session = require('express-session');
const bodyParse = require('body-parser');
const passport = require('./testing-front/server/auth/passport');
const mongoose = require('mongoose');
const middleware = require('connect-ensure-login');
const MongoStore = require('connect-mongo');
const config = require('./testing-front/server/config/default');
const flash = require('connect-flash');
const port = config.server.port;
const node_media_server = require('./testing-front/server/media_server');
const thumbnail_generator = require('./testing-front/server/cron/thumbnails');
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
  }
});


const TRIALTIMEDURATION = 5*60*1000;


class UserStreamEntity {
    constructor(userId, streamId,time,socketId , callback) {
      this.userId= userId;
      this.streamId = streamId;
      this.time = time;
      this.timer = new timer(function() {
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

function test(){
    //console.log("EH OH")
}

function timer(callback, delay) {
    var id, started, remaining = delay, running

    this.start = function() {
        running = true
        started = new Date()
        console.log(delay)
        if(delay >= 0){
          id = setTimeout(callback, remaining)
        }
        
    }

    this.pause = function() {
        running = false
        clearTimeout(id)
        remaining -= new Date() - started
    }

    this.getTimeLeft = function() {
        if (running) {
            this.pause()
            this.start()
        }
        return remaining
    }

    this.getStateRunning = function() {
        return running
    }
    this.start()
    
}




//This is called by the frontend whenever the page is loaded
//in order to know the tie remaining
app.get('/timer/:stream/:user', (req,res) =>{
  //Get the time remaining for the user.
  console.log(req.params.user)
  getRemainingTime(req.params.user, req.params.stream)
    .then(a=>{
      if(a<0){
        a = 0;
      }
      res.json({"timer": a});
      res.status(200).end();
});});





async function writeCache(userID,streamID,time) {

  var value = userID + "|" + streamID
  return add(value,time)
}

// Récupère le temps restant d'un utilisateur pour un stream donné
async function getTimeFromCache(userID, streamID){
  var value = userID + "|" + streamID;
  return chope(value);
}

async function getRemainingTime(userID, streamID){
    //If user-stream combo doesn´t exist in cache -> return TRIALTIMEDURATION
    return existCache(userID + "|" + streamID).then(a=> {
      console.log("a = " + a)
      if(a == 1){
        console.log("Get Remaining Time -> Si le timer UserID|StreamID Exist ")
        //console.log("userID/streamID already exist in cache")
        let remainingTime = getTimeFromCache(userID, streamID);
        console.log("remaining time = " + remainingTime);
        return remainingTime;
    }else{

      console.log("durée max")
        return TRIALTIMEDURATION;
    }

    });

}

async function existCache(value){
  var client = redis.createClient();
  return client.connect().then( a =>{
    return client.exists(value);
    });
}

async function add(key,timer) {

  var client = redis.createClient();
  return client.connect().then( a =>{

      return client.set(key, timer).then(b=>
        client.disconnect()
      );

    });

  console.log("heu")
}




async function chope(key) {

  var client = redis.createClient();
  
  return client.connect().then( a =>{
    return client.get(key).then( b =>{
      client.disconnect();
      return b;
    });
    });
}

async function addTimer(newEntry){
  //timerList.push(newEntry);
  return writeCache(newEntry.userId,newEntry.streamId,newEntry.timer.getTimeLeft())
}

function updateCache(){

}

io.on('connection', (socket) => {

    var roomID = "";
    var userID = "";

    
    socket.on('init', (args) => {
      console.log("eheh")
      roomID = args['roomID'];
      userID = args['userID'];
      socket.join(args['roomID']);


      getRemainingTime(userID, roomID).then( a => {

        let remainingTime = a;
        console.log("remaining : " + remainingTime)
        
        if(remainingTime <= 0){
          socketList[args['userID'] + "|" + args['roomID']] = new UserStreamEntity(args['userID'], args['roomID'],remainingTime, socket, i =>
          {
            console.log("Timer Ended");
            socket.disconnect();
          });
          console.log("Detected negative or 0 time!");
          socket.disconnect();
        }else{
          socketList[args['userID'] + "|" + args['roomID']] = new UserStreamEntity(args['userID'], args['roomID'],remainingTime, socket, i =>
          {
            console.log("Timer Ended");
            socket.disconnect();
          });

          console.log(socketList[userID + "|" +roomID]);
          existCache(userID + "|"+ roomID).then(b => {      
            if(b == 0){
            addTimer(socketList[userID + "|" +roomID]);
          }});
        }
        
      })
      

      /*
      if(!existCache(userID, roomID)){
        console.log("SHIT")
        addTimer(socketList[userID + "|" +roomID]);
      }*/
    });
  
    socket.on('chat message', (args) => {
      socket.to(args['roomID']).emit('recieve message', ({ "msg": args['msg'], "userID": args['userID'], "question": args['question'] }));
    });
  
    socket.on('disconnect', (reason) =>{
      //socketList[userID + "|" + roomID].timer.pause();
      console.log(socketList[userID + "|" + roomID])
      addTimer(socketList[userID + "|" + roomID]).then( o => {
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
  
  /*server.listen(3000, () => {
    console.log('listening on *:3000');
  });*/
////////////////////////////////

mongoose.connect('mongodb://127.0.0.1/nodeStream' , { useNewUrlParser: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './testing-front/server/views'));
app.use(express.static(__dirname + '/public'));

app.use('/thumbnails', express.static('./testing-front/server/thumbnails'));
app.use(flash());

app.use(require('cookie-parser')());
app.use(bodyParse.urlencoded({extended: true}));
app.use(bodyParse.json({extended: true}));

app.use(session({
    store: MongoStore.create({
        mongoUrl: 'mongodb://127.0.0.1/nodeStream',
        ttl: 14 * 24 * 60 * 60 // = 14 days. Default
    }),
    secret: config.server.secret,
    maxAge : Date().now + (60 * 1000 * 30),
    resave : true,
    saveUninitialized : false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Register app routes
app.use('/login', require('./testing-front/server/routes/login'));
app.use('/register', require('./testing-front/server/routes/register'));
app.use('/settings', require('./testing-front/server/routes/settings'));
app.use('/streams', require('./testing-front/server/routes/streams'));
app.use('/user', require('./testing-front/server/routes/user'));

app.get('/logout', (req, res) => {
    req.logout();
    return res.redirect('/login');
});

app.get('*', middleware.ensureLoggedIn(), (req, res) => {
    res.render('index');
});


server.listen(port, () => console.log(`App listening on ${port}!`));
node_media_server.run();
thumbnail_generator.start();

shortid = require('shortid');
console.log(shortid.generate());
