var MongoClient = require('mongodb').MongoClient;
var db;
module.exports ={
	messageInsert,
	getDataUser
} ;

MongoClient.connect('mongodb://localhost:27017/cos',function(err,database){
	if(!err){
		db = database;
	}else{
		console.log(' Connected feil...')
	}
});

function messageInsert(name,msg,receive){

	var usertb = db.collection('user');
	var data = {
		'name':name,
		'lastname':msg,
		'email':receive,
		'password':'1234'
	};
	 usertb.insert(data,function(err,item){
	 	if(!err){
	 		console.log('insert success');
	 	}else{
	 		console.log('insert feil');
	 	}
	 });
	// // }
	db.close();

}

function getDataUser(callback){

	if(db){
		var user = db.collection('user');
		var data;
	   	 user.find().toArray(function(err,items){
	   	 	callback(items);
	   	 });
		
	}else {
		return 0;
	}
}