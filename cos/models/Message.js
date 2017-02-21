var MongoClient = require('mongodb').MongoClient;
var db;
var objId = require('mongodb').ObjectID;
var mongojs = require('mongojs');
module.exports = {
    messageInsert,
    updateProfile,
    getUserAll,
    userLogout,
    createGroup,
    userLogout,
    getGroupByID,
    getMessageByuser,
    getGroup,
    userReconnect,
    getLog,
    clearLog,
    insertMessageroup,
    clearLogGroup,
    getMessageByGroup,
    delGroup,
    messageInsertFile,
    getFiles,
    insertFilegroup,
    getFileGroup,
    getGroupAll
};
MongoClient.connect('mongodb://localhost:27017/cos', function (err, database) {
    db = database;
});
//User=============================
function messageInsert(sent, msg, receive,_file) {
    var msgtb = db.collection('message');
    var log = db.collection('log_chat');
    var data = {
        'user_sent': sent,
        'user_receive': receive,
        'message': msg,
        'file_upload': _file,
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

    log.insert(data,function(err,item){
        if (!err) {
            console.log('insert Log success');
        } else {
            console.log('insert Log feil');
        }
    });

    return function () {
        console.log("insert return...");
    };
}
function messageInsertFile(sent,filename, receive) {
    var msgtb = db.collection('message');
    var log = db.collection('log_chat');
    var data = {
        'user_sent': sent,
        'user_receive': receive,
        'message': '',
        'file_upload':filename,
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

    log.insert(data,function(err,item){
        if (!err) {
            console.log('insert Log success');
        } else {
            console.log('insert Log feil');
        }
    });

    return function () {
        console.log("insert return...");
    };
}



function getUserAll(callback) {

    if (db) {
        var userAll = db.collection('users').find().toArray(callback);
    } else {
        return 0;
    }
}


function getMessageByuser(userSent,userRe,sortQty,callback) {
    var message = db.collection('message');
     var nomber = parseInt(sortQty);
    message.find({$or:[
    {$and:[{user_sent:userSent},{user_receive:userRe}]},
    {$and:[{user_sent:userRe},{user_receive:userSent}]}
    ]}).limit(nomber).sort({_id:-1}).toArray(function(err,items){
        callback(items);
    });
}
function getMessageByGroup(gid,sortQty,callback) {
            var u_group = db.collection('user_group');
            var msr_group = db.collection('message_group');
            var nomber = parseInt(sortQty);
            var result = [];
             u_group.find({g_id:new objId(gid)}).toArray(function(err,items) {
                 for(var i in items){
                    result.push(items[i]._id.toString());
                     }
                        var msgData = [];
                        msr_group.find({ u_g_id:{$in:result} }).limit(nomber).sort({_id:-1}).toArray(function(err,data) {
                                    callback(data);
                        });
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
            console.log('Insert Group OK...' + item.insertedIds[0]);
            for (var key in user) {
                usergData = {
                    'g_id': item.insertedIds[0],
                    'user_id': new objId(user[key]),
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
    group.find().toArray(callback);
}
function getGroupByID(id, callback) {
    var user_group = db.collection('user_group');
    var groupObj = {};
    var groupID = [];

    user_group.find({user_id: new objId(id)}).toArray(function (err, item) {
        if (!err) {
            // for (var value in item) {
            //     var gid = item[value].g_id;
            //     var id = item[value]._id;
            //     groupID.push({'g_id': gid},{'_id':id});
            // }
           callback(item);
        } else {
            console.log('Find Group BY ID Noooo.');
        }
    });
}
function getGroupAll(callback) {
    var user_group = db.collection('user_group');
    var groupObj = {};
    var groupID = [];

    user_group.find({}).toArray(function (err, item) {
        if (!err) {
            // for (var value in item) {
            //     var gid = item[value].g_id;
            //     var id = item[value]._id;
            //     groupID.push({'g_id': gid},{'_id':id});
            // }
           callback(item);
        } else {
            console.log('Find Group BY ID Noooo.');
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
function insertMessageroup(msg, u_gid,pic) {
    var message_group = db.collection('message_group');
    var message_group_log = db.collection('message_group_log');
    var data = {
        'g_message': msg,
        'u_g_id': u_gid,
        'file_upload': '',
        'picture':pic,
        'dateTime': new Date()
    };

    message_group.insert(data, function (err, item) {
        if (!err) {
            console.log('Insert Msg Group OK...');
        } else {
            console.log('Insert Msg Group No...');
        }
    });
    message_group_log.insert(data, function (err, item) {
        if (!err) {
            console.log('Insert Msg Group OK...');
        } else {
            console.log('Insert Msg Group No...');
        }
    });
}

function insertFilegroup(file, u_gid,pic) {
    var message_group = db.collection('message_group');
    var message_group_log = db.collection('message_group_log');
    var data = {
        'g_message':"" ,
        'u_g_id': u_gid,
        'file_upload': file,
        'picture': pic,
        'dateTime': new Date()
    };

    message_group.insert(data, function (err, item) {
        if (!err) {
            console.log('Insert Msg Group OK...');
        } else {
            console.log('Insert Msg Group No...');
        }
    });
    message_group_log.insert(data, function (err, item) {
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

function userLogout(id) {
    var users = db.collection('users');
    users.update({"_id": new objId(id)}, {
        $set: {
            "local.st": false
        }
    }
    );
    return false;
    console.log('User Logout Success....');
}
function userReconnect(id) {
    var users = db.collection('users');
    users.update({"_id": new objId(id)}, {
        $set: {
            "local.st": true
        }
    }
    );
    return true;
    console.log('User userReconnect Success....');
}

function getLog(id,callback){
        var log = db.collection('log_chat');
        log.find({user_receive:id.toString()}).toArray(function(err,item){
            callback(item);
        });
}
function clearLog(userSent,id){
        var log = db.collection('log_chat');
        log.find({$and:[{user_receive:userSent},{user_sent:id}]}).toArray(function(err,item){
                       for(var i in item){
                        log.remove({_id:{$in:[new objId(item[i]._id)]}});
                       }
        });

}
function clearLogGroup(u_g_id){
        var log = db.collection('message_group_log');
        log.find({u_g_id:u_g_id}).toArray(function(err,item){
                       for(var i in item){
                             log.remove({_id:new objId(item[i]._id)});
                       }
        });

}
function delGroup (u_g_id){
        var user_group = db.collection('user_group');
          user_group.update({"_id": new objId(u_g_id)}, {
                    $set: {
                        "del_st": true
                    }
         });
}
//Function get Files to table
function getFiles (id,callback) {
    var dbase = mongojs('cos', ['message']);
    dbase.message.find({$or:[{user_sent:id.toString()},{user_receive:id.toString()}]}).toArray(function (err,dbase) {
        callback(dbase);
    });
}

function getFileGroup (id,callback) {
    var dbase_g = mongojs('cos',['message_group']);
    var dbase_ug = db.collection("user_group");
    var getGroup = mongojs('cos',['group']);
    var groupId=[],userGroupId = [],dataItem = [],gGroupName=[];
    dbase_ug.find({user_id:id}).toArray(function (err,dbase_ug) {
        for(var i in dbase_ug){
            // console.log("Befor Delete : "+dbase_ug[i].g_id);
            if(dbase_ug[i].del_st == false){
                // console.log("After Delete : "+ dbase_ug[i].g_id);
                groupId.push(dbase_ug[i].g_id);
            }
        }
        var dbase_ug2 = db.collection("user_group");
        dbase_ug2.find({g_id:{$in:groupId}}).toArray(function(err,item){
                // console.log(item);
                for(var j in item){
                    userGroupId.push(item[j]._id.toString());
               }
                dbase_g.message_group.find({u_g_id:{$in:userGroupId}}).toArray(function(err,item2){
                    for(var k in item2){
                        if(item2[k].g_message == ""){
                            if(item2[k].file_upload.split(".").pop()!="png" && item2[k].file_upload.split(".").pop()!="jpg")
                            // console.log(item2[k].file_upload);
                            dataItem.push({"file":item2[k].file_upload,"date":item2[k].dateTime.toDateString(),"u_g_id":item2[k].u_g_id});
                        }
                    }
                    console.log(dataItem);
                    callback(dataItem);
                });
            });
    });
}