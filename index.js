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

// il reste a determiner comment on va faire pour debiter un type qui est sur un stream
// -> il faut donc savoir si le type est toujours sur le stream
// -> il faut savoir quelles sont les conditions pour debiter et comment on va faire pour debiter

/* QUAND UN CONNARD SE CONNECTE SUR LE STREAM
 * On va recevoir des (tokens ?) du frontend avec un champ "join"
 * 1- determiner a partir des donnees recus le "user_id" et le "stream_id"
 * 2- verifier que le stream existe et qu'il a le droit d'acceder au stream
 *    -> oui: etape 3
 *    -> non: retourner une erreur d'authentification au frontend -> FIN MAUVAISE
 * 3- regarder si un timer est deja lance (pour la combinaison user_id,stream_id)
 *    -> un timer existe deja: etape 4
 *    -> pas de timer existant: etape 5
 * 4- (le timer existe deja) regarder si le temps est ecoule
 *    -> oui: etape 6
 *    -> non: etape 7
 * 5- (pas de timer existant) creer un timer
 *    -> etape 8
 * 6- (le temps est ecoule) regarder si l'utilisateur peut payer
 *    -> oui: etape 9
 *    -> non: retourner une erreur de credits manquant au frontend -> FIN MAUVAISE
 * 7- (le temps n'est pas ecoule) mettre a jour le timer
 *    -> etape 8
 * 8- retourner le temps restant (timestamp ?) au frontend -> FIN BONNE
 * 9- (l'utilisateur peut payer) debiter l'utilisateur
 *    retourner les credits restant au frontend -> FIN BONNE
 */

/* QUAND UN CONNARD QUITTE LE STREAM
 * On va recevoir des (tokens ?) du frontend avec un champ "quit"
 * 1- determiner a partir des donnees recus le "user_id" et le "stream_id"
 * 2- verifier que le stream existe et qu'il a le droit de quitter le stream
 *    -> oui: etape 3
 *    -> non: retourner une erreur d'authentification au frontend -> FIN MAUVAISE
 * 3- regarder si un timer est deja lance (pour la combinaison user_id,stream_id)
 *    -> un timer existe deja: etape 4
 *    -> pas de timer existant: retourner un acknowledge au frontend -> FIN BONNE
 * 4- (le timer existe deja) mettre en pause le timer
 *    retourner un acknowledge au frontend -> FIN BONNE
 */

var redis = require('redis')

getMessage();

async function getMessage() {
  client = redis.createClient();

  client.connect();
  client.on("error", function (err) {
    console.log("Error " + err);
  });
  
  mydict = {1:2,2:3,3:4}
  p_mydict = JSON.stringify(mydict);
  
  //client.hSet("dict", p_mydict,"stream1");
  
  
  client.hDel("dict", p_mydict,function (err) {
    console.log("Error " + err);
  });

  //client.hSet("dict", p_mydict,"stream2");
  
  let i = "ez"
  await client.hGetAll("dict").then(e=> i = e);

  console.log(i);
  
}