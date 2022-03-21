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
        //console.log("FINISH");
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

     var res = 0
     fs.readFile(cachePath, 'utf8', function readFileCallback(err, data){
     if (err){
        console.log(err);
     } 
     else {
        obj = JSON.parse(data); //now it an object
        res = obj.table.findIndex(i => { return i.userId === userId && i.streamId === streamId});
    }});
    //console.log("res")
    //console.log(res)
    return (res != -1 && typeof res != 'undefined')

}

// Récupère le temps restant d'un utilisateur pour un stream donné
async function getTimeFromCache(userId, streamId){
    var obj = {
        table: []
     };

    try{
        let data = fs.readFileSync(cachePath, 'utf8');
        obj = JSON.parse(data); //now it an object
        console.log(obj)
        return obj.table[obj.table.findIndex(i => {
            return i.userId == userId && i.streamId == streamId
          })].time; //del some data
    }catch{
        console.log(err);
    }

}


// newEntry : UserStreamEntity 
function addTimer(newEntry){
  timerList.push(newEntry);
  writeCache(newEntry.userId,newEntry.streamId,newEntry.timer.getTimeLeft())
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
    
    var obj = {
        table: []
     };
     
    fs.readFile(cachePath, 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            console.log("earse");
            console.log("##############################");
        obj = JSON.parse(data); //now it an object
        console.log("Reading:")
        console.log(obj)
        fs.unlinkSync('cache.json');
            
        delete obj.table[obj.table.findIndex(i => {return i.userId == userId && i.streamId == streamId})]; //del some data
        obj.table = obj.table.filter((a) => a)
        console.log("Writing: ")
        json = JSON.stringify(obj); //convert it back to json
        console.log(json);
        fs.writeFile(cachePath, json, 'utf8', function(error) {
            //console.log(json);
            console.log("File has been erased");
        }); // write it back 
        console.log("##############################");
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
                    console.log("write")
                    console.log("=============================");
                    obj = JSON.parse(data); //now it an object

                    
                    console.log("ERASE:");
                    delete obj.table[obj.table.findIndex(i => {return i.userId == userId && i.streamId == streamId})]; //del some data
                    console.log(obj)
                    obj.table = obj.table.filter((a) => a)
                    console.log("Reading:");
                    console.log(obj)
                    obj.table.push(entity); //add some data
                    json = JSON.stringify(obj); //convert it back to json
                    console.log("Writing:");
                    console.log(json)
                    fs.writeFile(cachePath, json, 'utf8', function(error) {
                    //console.log(json)
                    console.log("Wrote in cache!");
                    console.log("=============================");
                  }); // write it back 
            }});

        }else{          


            obj.table.push(entity)
            var json = JSON.stringify(obj);
            fs.writeFile(cachePath, json, 'utf8', function(error) {
                console.log("Cache has been created");
              })    
        }
    } catch(err) {
        console.error(err)
    }
}



function printCache(){
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
                    //console.log(obj)
            }});

        }    
    }catch{
        console.log(err)
    }
}

function updateRemainingTime(userID, streamID){
    var timerLeft = socketList[userID + "|" + streamID].timer.getTimeLeft();
  
    var entity = {
        "userId": userID,
        "streamId": streamID,
        "time": timerLeft
    }
    console.log("ooooooooooooooooo");
    //eraseCache(userID,streamID);
    printCache();
    console.log("TIME LEST")
    console.log(timerLeft)
    writeCache(userID,streamID,timerLeft);
    printCache();
    console.log("ooooooooooooooooo");
}


async function getRemainingTime(userID, streamID){
    //If user-stream combo doesn´t exist in cache -> return TRIALTIMEDURATION
    if(existCache(userID, streamID)){
        console.log("ALREADY EXIIIIIIST ?")
        //console.log("userID/streamID already exist in cache")
        let remainingTime = await getTimeFromCache(userID, streamID);
        console.log(remainingTime);
        return remainingTime;
    }else{
        return TRIALTIMEDURATION;
    }
}

app.listen(8080);
console.log('Server started');


app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

//This is called by the frontend whenever the page is loaded
//in order to know the tie remaining
app.get('/time/:stream /:user', (res,req) =>{
    //Get the time remaining for the user. 
    res.send(getRemainingTime(req.params.user, req.params.stream));
});



io.on('connection', (socket) => {

  var roomID = "";
  var userID = "";
  //console.log("Connected!");
  socket.on('init', (args) => {
    roomID = args['roomID'];
    userID = args['userID'];

    socket.join(args['roomID']);
    // key is userID + "|" + roomID

    let remainingTime = getRemainingTime(userID, roomID)

    socketList[args['userID'] + "|" + args['roomID']] = new UserStreamEntity(args['userID'], args['roomID'],remainingTime, socket, i =>
      {

        socket.disconnect();

      });
    if(!existCache(userID, roomID)){
        addTimer(socketList[userID + "|" +roomID]);
    }
  });

  socket.on('chat message', (args) => {
    socket.to(args['roomID']).emit('recieve message', ({ "msg": args['msg'], "userID": args['userID'], "question": args['question'] }));
  });

  socket.on('disconnect', (reason) =>{
      console.log(reason)
    //console.log(userID + "|" + roomID);
    socketList[userID + "|" + roomID].timer.pause();
    //console.log("Paused!");
    //console.log(socketList);
    updateRemainingTime(userID,roomID);

    delete socketList[userID + "|" + roomID];
    
    //Replace userID roomID : time by new time which is


    /*for (var key in socketList){
        if(JSON.stringify([key].socket) === JSON.stringify(socket)){
            socketList[key].pause()
            console.log("Paused!");
        }
    }*/
    socket.disconnect();
  });

  //console.log('a user connected');
});

//On connection to socket -> add the socket to the correct room

server.listen(3000, () => {
  console.log('listening on *:3000');
});