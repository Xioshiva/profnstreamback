const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
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
io.on('connection', (socket) => {
  console.log("Connected!");
  socket.on('init', (roomID) => {
    console.log("joined to " + roomID);
    socket.join(roomID);
  });

  socket.on('chat message', (args)  => {
    console.log("msg: " + args['msg'] + " roomID: " + args['roomID'] + " userID: " + args['userID'] + " question: " + args['question']);

    console.log("Sending");
    socket.to(args['roomID']).emit('recieve message', ({"msg": args['msg'], "userID" : args['userID'], "question": args['question']}));
    console.log("Sent");
    //Add to cache
  });

  console.log('a user connected');
});

//On connection to socket -> add the socket to the correct room

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
