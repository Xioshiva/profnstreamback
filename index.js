const express = require('express')

var cors = require('cors')

const app = express()


//app.use(cors);

const port = 8091

app.listen(port);
console.log('Server started');

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api', function (request, response){
  console.log("HELLO MEN");
  response.status(200).json("yo").end();
});


/*
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";
MongoClient.connect(url, function(err, db) {

  if (err) throw err;
  var dbo = db.db("alexchien");
  var query = { address: /^S/ };
  dbo.collection("fruits").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
}); 





//Cache

const redis = require('redis');
const client = redis.createClient({
    host: 'localhost',
    port: 6379,
});

client.on('error', err => {
    console.log('Error ' + err);
});

client.connect();

client.set('foo', 'TEST123456677883259');

let val = client.get('foo');
val.then(i=>console.log(i))

*/