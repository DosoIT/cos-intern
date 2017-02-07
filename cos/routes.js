// app/routes.js

module.exports = function (app, passport, urlencodedParser, jsonParser, session) {
    var messages = require('./models/Message.js');
    var multer = require('multer');
    var path = require('path');
    var filenames = "";
    var storage = multer.diskStorage({
        destination: './uploads/',
        filename: function (req, file, cb, raw) {
            filenames = "Avatar" + (Math.floor((Math.random() * 1000) + 1)) + path.extname(file.originalname);
            cb(null, filenames)
        }
    }

    )

    var upload = multer({storage: storage})
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });
    app.get('/bg', function (req, res) {
        res.sendFile(__dirname + '/public/image/bg-no-font.png');
    });
    app.get('/bg-login', function (req, res) {
        res.sendFile(__dirname + '/public/image/img6.png');
    });
    app.get('/metroCss', function (req, res) {
        res.sendFile(__dirname + '/public/css/metro.css');
    });
    app.get('/cos', function (req, res) {
        res.sendFile(__dirname + '/public/image/COS-1.png');
    });
    app.get('/font-cos', function (req, res) {
        res.sendFile(__dirname + '/public/image/font-cos01.png');
    });
    app.get('/loadingPic', function (req, res) {
        res.sendFile(__dirname + '/public/image/loading.gif');
    });
    app.get('/metroIcon', function (req, res) {
        res.sendFile(__dirname + '/public/css/metro-icons.css');
    });
    app.get('/metroJs', function (req, res) {
        res.sendFile(__dirname + '/public/js/metro.min.js');
    });
    app.get('/pic-default', function (req, res) {
        res.sendFile(__dirname + '/public/image/pic-default.png');
    });
    app.get('/public/image', function (req, res) {
        res.sendFile(__dirname + '/public/image/navigation.png');
    });
    app.get('/css', function (req, res) {
        res.sendFile(__dirname + '/public/css/bootstrap.min.css');
    });
    app.get('/style', function (req, res) {
        res.sendFile(__dirname + '/public/css/style.css');
    });
    app.get('/css-datatable', function (req, res) {
        res.sendFile(__dirname + '/public/css/css-datatable/dataTables.bootstrap.min.css');
    });
    app.get('/jqueryjs', function (req, res) {
        res.sendFile(__dirname + '/public/js/js-datatable/jquery.js');
    });
    app.get('/dataTables-js', function (req, res) {
        res.sendFile(__dirname + '/public/js/js-datatable/jquery.dataTables.min.js');
    });
    app.get('/dataTables-bs-js', function (req, res) {
        res.sendFile(__dirname + '/public/js/js-datatable/dataTables.bootstrap.min.js');
    });
    app.get('/bootstrap-js', function (req, res) {
        res.sendFile(__dirname + '/public/js/bootstrap.min.js');
    });

    app.get('/font-icon', function (req, res) {
        res.sendFile(__dirname + '/public/css/font-awesome.min.css');
    });
    app.get('/style', function (req, res) {
        res.sendFile(__dirname + '/public/css/style.css');
    });
    app.get('/js', function (req, res) {
        res.sendFile(__dirname + '/public/js/jquery-3.1.1.min.js');
    });
    app.get('/imageonline', function (req, res) {
        res.sendFile(__dirname + '/public/image/green_operational_icon.png');
    });
    app.get('/imageoffline', function (req, res) {
        res.sendFile(__dirname + '/public/image/icon-offline.png');
    });


    app.get('/socketJs', function (req, res) {
        res.sendFile(__dirname + '/public/js/socket.io.js');
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', urlencodedParser, function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('./login.ejs', {message: req.flash('loginMessage')});
    });

    app.get('/home', isLoggedIn, function (req, res) {
        messages.getGroupByID(req.user._id,function(callback){
            console.log(callback);
        });
        messages.getUserAll(function (item) {
            res.render('./home.ejs', {userAll: item, user: req.user});
        });
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('./signup.ejs', {message: req.flash('signupMessage')});
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)

    app.get('/userpic', function(req, res){
               res.sendFile(__dirname + '/uploads/'+req.user.local.picture);
    });
     app.get('/profileUpdate', isLoggedIn, function(req, res) {
            res.render('./profile.ejs', {
                user : req.user // get the user out of session and pass to template
            });
    });
    app.get('/profile', isLoggedIn, function (req, res) {
        if (req.user.local.fname == null) {
            res.render('./profile.ejs', {
                user: req.user // get the user out of session and pass to template
            });
        } else {
            res.redirect('/home');
        }
    });
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        messages.userLogout(req.user._id);
        req.session.destroy();
        res.redirect('/');
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // Edit Profile
    app.post('/editProfile', upload.any(), isLoggedIn, function (req, res) {
        // res.send(req.files);
        if (filenames == "") {
            res.redirect("/profile");
        } else {
            var dataUser = {
                '_id': req.body._id,
                'picture': filenames,
                'fname': req.body.fname,
                'lname': req.body.lname,
                'email': req.body.email,
                'tel': req.body.tel,
                'position': req.body.position,
            }
            var msg = messages.updateProfile(dataUser);
            if (!msg) {
                console.log('Updated..');
                res.redirect('/home');
            } else {
                console.log('update failed');
            }
        }
    });

    app.post('/addGroup',isLoggedIn, function (req, res) {
       messages.createGroup(req.body.group_n,req.body.user_id);
       res.redirect('/home');
    });
// route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/');
    }
};