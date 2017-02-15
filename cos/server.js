// server.js
// get all the tools we need
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var configDB = require('./config/database.js');
var message = require('./models/Message.js');

// uncomment this line
require('./config/passport')(passport); // pass passport for configuration
// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database
require('./config/passport')(passport); // pass passport for configuration
// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.use('/uploads',express.static(__dirname + '/uploads'));
app.use('/image',express.static(__dirname + '/public/image'));

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.set('view engine', 'ejs'); // set up ejs for templating
// required for passport
app.use(session({secret: 'sessiontestbyslumboy'})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes =====================================================================
require('./routes.js')(app, passport,urlencodedParser,jsonParser,session,express); // load our routes and pass in our app and fully configured passport

// ================= launch Socket.io  ==============================
var server = app.listen(port);
var io = require('socket.io').listen(server);

console.log('=====================================================');
console.log('|>>>> >>>>> Node.js running on port ' + port+' <<<<< <<<<<|');
console.log('=====================================================');

var user_id={};
var room ={};
var people = {};
var user = [];
// // Broad casting
io.on('connection', function (socket) {
    socket.broadcast.emit('hi');
});
io.on('connection', function (socket) {
        console.log('=====================================================');
        console.log('a user connected server : ' ,socket.connected);
        console.log('a user connected server  ID: ' ,socket.id);
        console.log('=====================================================');
    socket.on('typing',function(msg,st){
        io.emit("typingShow",msg,user_id[socket.id],st);
    });
    // Message
    // socket.on('chat message', function (userSent,msg, userRecei) {
    //     io.emit('chat message', msg,user_id[socket.id],userRecei);
   	// 	message.messageInsert(userSent,msg,userRecei);
    // });

    // getUserID
    socket.on('userID',function(id){
         user_id[socket.id]= id;
    });
    ////privat chat
        socket.on('subscribe', function(userSent,id) {
            console.log('joining room', room);
            user.push({'user':userSent});
            user.push({'user':id});
            people[room] = user;
            user=[];

            var room1 = userSent+""+id;
            var room2 = id+""+userSent;

            socket.join(room1);
            socket.join(room2);
        });

        socket.on('unsubscribe', function(userSent,userRe) {
            console.log('leaving room', userSent,userRe);
             var room1 = userSent+""+userRe;
             var room2 = userRe+""+userSent;
            socket.leave(room1);
            socket.leave(room2);
        })

        socket.on('send', function(data) {
            console.log('sending message');
            io.sockets.in(data.room).emit('send message01', data);
            message.messageInsert(data.userSent,data.message,data.userRe);
        });
    ////
    // getMessages to show
        socket.on('get message', function(userSent,userRe,sortQty){

            message.getMessageByuser(userSent,userRe,sortQty,function(items){
                var room = userSent+""+userRe;
                io.sockets.in(room).emit('msg',items,userRe);
            });

        });
        socket.on('clearLog',function(userSent,id){
             message.clearLog(userSent,id);
        });
    // reconnect
    socket.on('userReconnect',function(user){
        console.log('user Reconnect.....');
        message.userReconnect(user);
    });
    // Disconnect
    socket.on('disconnect', function () {
        console.log('user disconnected server : ',{userID:user_id[socket.id], status: "disconnected from server"});
        // var userdie = message.userLogout(user_id[socket.id]);
    });
});