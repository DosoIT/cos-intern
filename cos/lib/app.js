var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var cosDB = require('./cosDatabase.js');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var mongos = require('mongoose');
// var url = 'mongodb://localhost:27017/test';

app.get('/public/image', function(req, res){
  res.sendFile(__dirname + '/public/image/navigation.png');
});
app.get('/', function(req, res){

  res.sendFile(__dirname + '/public/index.html');
});
app.get('/login', function(req, res){
  res.sendFile(__dirname + '/public/login.html');
});
app.get('/css', function(req, res){
  res.sendFile(__dirname + '/public/css/bootstrap.min.css');
});
app.get('/font-icon', function(req, res){
  res.sendFile(__dirname + '/public/css/font-awesome.min.css');
});
app.get('/style', function(req, res){
  res.sendFile(__dirname + '/public/css/style.css');
});
app.get('/js', function(req, res){
  res.sendFile(__dirname + '/public/js/jquery-3.1.1.min.js');
});
app.get('/socketJs',function(req,res) {
	res.sendFile(__dirname+'/public/js/socket.io.js');
});
app.post('/profile', function(req, res){
  res.sendFile(__dirname + '/public/profile.html');
});
app.get('/pic-default', function(req, res){
  res.sendFile(__dirname + '/public/image/pic-default.png');
});
app.get('/home',function(req,res){
	res.sendFile(__dirname + '/public/template.html');
	// cosDB.getDataUser(function(callback){
 //   		console.log(callback);
 //    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

// check status connnect to application
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

// Broad casting
io.on('connection', function(socket){
  socket.broadcast.emit('hi');
});
io.on('connection', function(socket){
  socket.on('chat message', function(msg,userSent,userRecei){
    io.emit('chat message', msg);
    cosDB.messageInsert('noom',msg,'grust');
  });
});

console.log("hahaha Nodemon it's working Now !!!");