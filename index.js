const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);


const redis = require('redis')
const fs = require('fs');
const bodyParser = require('body-parser');

app.use(express.static('../frontend'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


var socketList = {};
var timerList = [];

const cachePath = './cache.json'


const { Server } = require("socket.io");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
  }
});


const TRIALTIMEDURATION = 20 * 1000;


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
        console.log(timerList)
    }, time)
    }    
}

function test(){
    console.log("EH OH")
}

function timer(callback, delay) {
    var id, started, remaining = delay, running

    this.start = function() {
        running = true
        started = new Date()
        id = setTimeout(callback, remaining)
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

function existCache(userId,streamId){
    var obj = {
        table: []
     };
    var res
    console.log(userId, streamId);  
    fs.readFile(cachePath, 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } 
    else {
      obj = JSON.parse(data); //now it an object
      res = obj.table.findIndex(i => {
        return i.userId === userId && i.streamId === streamId});
      console.log(res);
    }});

  if(typeof res === 'undefined'){
    return false;
  }
  return res  != -1 ; //del some data

}

function getTimeFromCache(userId, streamId){
    var obj = {
        table: []
     };
    fs.readFile(cachePath, 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } 
        else {
          obj = JSON.parse(data); //now it an object
      }});
      return obj.table[obj.table.findIndex(i => {return i.userId == userId && i.streamId == streamId})].time; //del some data
}


// newEntry : UserStreamEntity 
function addTimer(newEntry){
  timerList.push(newEntry);
  writeCache(newEntry.userId,newEntry.streamId,newEntry.time)
}
/*
app.post('/cache', async (request, response) => {
    
    if(request.query.userId != undefined){
        userId = request.query.userId
        streamId = request.query.streamId
        time = request.query.time

        response.status(200).json(response.json);
    } else{
        response.status(400).end("Failed to get the ressource");
    }
});
*/
/*
function updateCache(){
    
    f.readFile(cachePath, 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } 
      else {
            timerList.forEach(element => {
            
        })
    }});

}*/

function eraseCache(userId,streamId){

    fs.readFile(cachePath, 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
        obj = JSON.parse(data); //now it an object


        if(obj.table.length <= 1 ){
            try {
                fs.unlinkSync('cache.json');
            
                console.log("File is deleted.");
            } catch (error) {
                console.log(error);
            }
        }
        else{
            //console.log(obj.tab    git push --set-upstream origin adjusting-socketsle)
            delete obj.table[obj.table.findIndex(i => {return i.userId == userId && i.streamId == streamId})]; //del some data
            obj.table = obj.table.filter((a) => a)
            json = JSON.stringify(obj); //convert it back to json
            fs.writeFile(cachePath, json, 'utf8', function(error) {
                console.log("File has been erased");
              }); // write it back 
        }


    }});
}

function writeCache(userId,streamId,time) {

    var entity = {
        "userId": userId,
        "streamId": streamId,
        "time": time
    }

    var obj = {
        table: []
     };
    
    try {
        var fs = require('fs');
        if (fs.existsSync(cachePath)) {
            fs.readFile(cachePath, 'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                    obj = JSON.parse(data); //now it an object
                    obj.table.push(entity); //add some data
                    json = JSON.stringify(obj); //convert it back to json
                    fs.writeFile(cachePath, json, 'utf8', function(error) {
                    console.log("File has been updated");
                  }); // write it back 
            }});

        }else{          


            obj.table.push(entity)
            var json = JSON.stringify(obj);
            fs.writeFile(cachePath, json, 'utf8', function(error) {
                console.log("File has been created");
              })
        }
    } catch(err) {
        console.error(err)
    }
}

app.listen(8080);
console.log('Server started');














app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {

  var roomID = "";
  var userID = "";
  console.log("Connected!");
  socket.on('init', (args) => {
    roomID = args['roomID'];
    userID = args['userID'];
    console.log("joined to " + args['roomID']);
    socket.join(args['roomID']);
    // key is userID + "|" + roomID
    let remainingTime = TRIALTIMEDURATION;
    console.log(existCache(args['userID'], args['roomID']));
    if(existCache(args['userID'], args['roomID'])){
        remainingTime = getTimeFromCache(args['userID'], args['roomID']);
        console.log("Loaded");
    }

    socketList[args['userID'] + "|" + args['roomID']] = new UserStreamEntity(args['userID'], args['roomID'],remainingTime, socket, i =>
      {
        console.log("Done");
        socket.disconnect();
        delete socketList[args['userID'] + "|" + args['roomID']];
        console.log(socketList);
      });
      addTimer(socketList[args['userID'] + "|" + args['roomID']]);
  });

  socket.on('chat message', (args) => {
    console.log("msg: " + args['msg'] + " roomID: " + args['roomID'] + " userID: " + args['userID'] + " question: " + args['question']);

    console.log("Sending");
    socket.to(args['roomID']).emit('recieve message', ({ "msg": args['msg'], "userID": args['userID'], "question": args['question'] }));
    console.log("Sent");
    //Add to cache
  });

  socket.on('disconnect', (reason) =>{
    console.log("heyooo");
    console.log(socketList);

    console.log(userID + "|" + roomID);
    socketList[userID + "|" + roomID].timer.pause();
    console.log("Paused!");
    delete socketList[userID + "|" + roomID];
    /*for (var key in socketList){

        if(JSON.stringify([key].socket) === JSON.stringify(socket)){
            socketList[key].pause()
            console.log("Paused!");
        }
    }*/
    socket.disconnect();
  });

  console.log('a user connected');
});

//On connection to socket -> add the socket to the correct room

server.listen(3000, () => {
  console.log('listening on *:3000');
});


