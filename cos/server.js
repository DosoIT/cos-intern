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
app.use(session({name:'noom',secret: 'sessiontestbyslumboy'})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes =====================================================================
require('./routes.js')(app, passport,urlencodedParser,jsonParser,session); // load our routes and pass in our app and fully configured passport

// ================= launch Socket.io  ==============================
var server = app.listen(port);
var io = require('socket.io').listen(server);
console.log('=====================================================');
console.log('|>>>> >>>>> Node.js running on port ' + port+' <<<<< <<<<<|');
console.log('=====================================================');

var user_id={};
// // Broad casting
io.on('connection', function (socket) {
    socket.broadcast.emit('hi');
});
io.on('connection', function (socket) {
        console.log('=====================================================');
        console.log('a user connected server : ' ,socket.connected);
        console.log('a user connected server  ID = : ' ,socket.id);
        console.log('=====================================================');



    // Message
    socket.on('chat message', function (userSent,msg, userRecei) {
        io.emit('chat message', msg);
   		message.messageInsert(userSent,msg,userRecei);
    });
    
    // getUserID
    socket.on('userID',function(id){
         user_id[socket.id]= id;
        console.log('UserIDDDD = '+id);
    })

    // Disconnect
    socket.on('disconnect', function () {
        console.log('user disconnected server : ',{userID:user_id[socket.id], status: "disconnected from server"});

            message.userLogout(user_id[socket.id]);

    });


});
