var MongoClient = require('mongodb').MongoClient;
var db;
var objId = require('mongodb').ObjectID;
module.exports = {
    messageInsert,
    updateProfile,
    getUserAll,
    createGroup
};
MongoClient.connect('mongodb://localhost:27017/cos', function (err, database) {
    db = database;
});

//User=============================
function messageInsert(sent, msg, receive) {

    var msgtb = db.collection('message');

    var data = {
        'user_sent': sent,
        'user_receive': receive,
        'message': msg,
        'file_upload': '',
        'dateTime': new Date(),
        'del_status': false
    };
    msgtb.insert(data, function (err, item) {
        if (!err) {
            console.log('insert success');
        } else {
            console.log('insert feil');
        }
    });

    return function () {
        console.log("insert return...");
    };
}

function getDataMessage(callback) {

    if (db) {
        var message = db.collection('message');
        message.find().toArray(function (err, items) {
            callback(items);
        });

    } else {
        return 0;
    }
}

function getUserAll(callback) {

    if (db) {
        var userAll = db.collection('users');
        userAll.find().toArray(function (err, items) {
            callback(items);
        });

    } else {
        return 0;
    }
}

function getUserByID(id, callback) {

    if (db) {
        var userAll = db.collection('users');
        userAll.find({'_id': new objId(id)}).toArray(function (err, items) {
            callback(items);
        });

    } else {
        return 0;
    }
}




function getMessageByuserSent(user) {
    var message = db.collection('message');
    message.find({user_sent: user}).toArray(function (err, items) {
        console.log('getMessageByuserSent');
    });
}



//Group ===========================
function createGroup(Gname, user) {

    var group = db.collection('group');
    var userG = db.collection('user_group');
    var data = {
        'g_name': Gname
    };
    var usergData = [];

    group.insert(data, function (err, item) {
        if (!err) {
            console.log('Insert Group OK...');
            
            for (var key in user) {
                usergData = {
                    'g_id': item.insertedIds,
                    'user_id': user[key],
                    'del_st': false,
                    'dateTime': new Date()
                };
                userG.insert(usergData, function (err, item) {
                    if (!err) {
                        console.log('Insert User Group OK.....');
                    } else {
                        console.log('Insert User Group No.....');
                    }
                });
            }

        } else {
            console.log('Insert Group Noo....');
        }
    });

}

function getGroup(callback) {
    var group = db.collection('group');
    group.find().toArray(function (err, item) {
        if (!err) {
            console.log('Find Group Ok.');
            callback(item);
        } else {
            console.log('Find Group Noooo.');
            db.close();
        }
    });
}
function getGroupByID(user_id, callback) {
    var group = db.collection('group');
    var user_group = db.collection('user_group');

    user_group.find({user_id: new objId(user_id)}).toArraya(function (err, item) {
        if (!err) {
            console.log('Find Group By ID Ok.');
            var groupName = [];
            for (var key in item) {
                group.find({_id: new objId(key.g_id)}, function (err, itemG) {
                    groupName = {
                        'user_grou_id': key._id,
                        'group_name': itemG.g_name,

                    };
                });
            }
            callback(item);
        } else {
            console.log('Find Group BY ID Noooo.');
            db.close();
        }
    });
}




//User Group =====================================

function delUserGroup(gid, user) {
    var userG = db.collection('user_group');
    userG.update({g_id: gid, user_id: user}, {del_st: true}, function (err, item) {
        if (!err) {
            console.log('Del User Group Ok.....');
        } else {
            console.log('Del User Group Noo.....');
        }
    });
}

function getUserGroupByuser(user) {
    var userG = db.collection('user_group');
    userG.find().toArray(function (err, item) {
        if (!err) {
            console.log('getUserGroupByuser Ok...');
        } else {
            console.log('getUserGroupByuser Ok...');
            db.close();
        }
    });
}

//Message Group ==============================================
function insertMessageroup(msg, gid) {
    var msg = db.collection('group_message');

    var data = {
        'g_message': msg,
        'g_id': gid,
        'file_upload': '',
        'dateTime': new Date()
    };

    msg.insert(data, function (err, item) {
        if (!err) {
            console.log('Insert Msg Group OK...');
        } else {
            console.log('Insert Msg Group No...');
        }
    });
}
function updateProfile(data) {
    var users = db.collection('users');
    users.update({"_id": new objId(data._id)}, {$set: {
            "local.fname": data.fname,
            "local.lname": data.lname,
            "local.tel": data.tel,
            "local.position": data.position,
            "local.email": data.email,
            "local.picture": data.picture,
        }});
    return false;
}


