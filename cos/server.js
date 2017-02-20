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
var multer = require('multer');
var SocketIOFile = require('socket.io-file');
var path = require('path');
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
        var filenames = "";
 var uploader = new SocketIOFile(socket, {
            overwrite: false,
            rename: function(filename) {
                var file = path.parse(filename);
                var fname = file.name;
                var ext = file.ext;
            return  (Math.floor((Math.random() * 100000) + 1))+ext;
          },
              uploadDir: {
                    img: 'uploads',
                    files: 'uploads/files'
              },
                      // chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg' 
                maxFileSize: 5194304,                       // 4 MB. default is undefined(no limit) 
                chunkSize: 10240,                           // default is 10240(1KB) 
                transmissionDelay: 0,                       // delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay) 
                overwrite: true                             // overwrite file if exists, default is true.
            });
        uploader.on('start', (fileInfo) => {
        console.log('Start uploading');
        console.log(fileInfo);
        });
        uploader.on('stream', (fileInfo) => {
            console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
        });
        uploader.on('complete', (fileInfo) => {
            console.log('Upload Complete.');
            console.log(fileInfo);
            console.log("filename = "+fileInfo.name);
            filenames = fileInfo.name;
        });
        uploader.on('error', (err) => {
            console.log('Error!', err);
        });
        uploader.on('abort', (fileInfo) => {
            console.log('Aborted: ', fileInfo);
        });
            socket.on('send-img', function(data) {
                     console.log('sending Img'+filenames);
                     message.messageInsertFile(data.userSent,filenames,data.userRe);
            });
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
        });
        /// join group
         socket.on('subscribe-group', function(ganme) {
            console.log('joining Group', ganme);
            socket.join(ganme);
        });
         socket.on('unsubscribe-group', function(ganme) {
            console.log('leaving Group',ganme);
            socket.leave(ganme);
        });
         ///end join
        socket.on('send', function(data) {
            console.log('sending message');
            io.sockets.in(data.room).emit('send message01', data);
            message.messageInsert(data.userSent,data.message,data.userRe);
        });
         socket.on('del group', function(u_g_id) {
           console.log('dis Group');
           message.delGroup(u_g_id);
         });


        ///////// send message to group ///////
        socket.on('send-group', function(data) {
            console.log('sending message to group');
            io.sockets.in(data.room).emit('send message group', data);
            message.insertMessageroup(data.message,data.userGID,data.pic);
        });
        socket.on('send-img-group', function(data) {
            console.log('sending message to group'+filenames);
            message.insertFilegroup(filenames,data.userGID,data.pic);
        });
        /////end send to grouph////
    ////
    // getMessages to show
        socket.on('get message', function(userSent,userRe,sortQty,pic,picRe){

            message.getMessageByuser(userSent,userRe,sortQty,function(items){
                var room = userRe+""+userSent;
                // var room = userSent+""+userRe;
                io.sockets.in(room).emit('msg',items,userRe,pic,picRe);
            });

        });
        socket.on('get message group', function(gid,gname,sortQty){
                var resulte = [];
            message.getMessageByGroup(gid,sortQty,function(items){
               io.sockets.in(gname).emit('msg group',items);
            });
        });

         socket.on('send-group base64',function (msg) {
            console.log('received base64 file from' + msg.u_g_ID);
            console.log(' base64 file ' + msg.fileName);
            socket.u_g_ID = msg.u_g_ID;
            // socket.broadcast.emit('base64 image', //exclude sender
             io.sockets.in(msg.room).emit('send-group base64',msg);
        });
        // end get ////////////////////
        // clear Log ///////////////////////
        socket.on('clearLog',function(userSent,id){
             message.clearLog(userSent,id);
        });
        socket.on('clearLogGroup',function(u_g_id){
             message.clearLogGroup(u_g_id);
        });
        ///////////////////////////////////
        socket.on('base64 file',function (msg,pic) {
            console.log('received base64 file from' + msg.username);
            console.log(' base64 file ' + msg.fileName);
            socket.username = msg.username;
            // socket.broadcast.emit('base64 image', //exclude sender
             io.sockets.in(msg.room).emit('base64 file',  //include sender
                {
                  username: msg.username,
                  file: msg.file,
                  fileName: msg.fileName,
                  picture: pic
                }

            );
        });
        socket.on('base64 FILES_INPUT',function (msg) {
            console.log('received base64 file from' + msg.username);
            console.log(' base64 file ' + msg.fileName);
            socket.username = msg.username;
            // socket.broadcast.emit('base64 image', //exclude sender
             io.sockets.in(msg.room).emit('base64 FILES_INPUT',  //include sender
                {
                  username: msg.username,
                  file: msg.file,
                  fileName: msg.fileName
                }

            );
        });
        //////////////////////////////////
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