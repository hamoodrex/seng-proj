const User = require("./users.js");
var mongoose = require("mongoose");
// Mongoose setup
var database_connected = false;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	database_connected = true;
	console.log("Database connected!");
});

module.exports.run = function(){
	mongoose.connect('mongodb://127.0.0.1:27017/users', 
	{useNewUrlParser: true, useUnifiedTopology: true});
}

module.exports.checkUser = function(username, password=null, role){
	return new Promise((resolve,reject) => {
		if (!database_connected) return;
		var usero = {};
		usero["username"] = username;
		if (password != null) usero["password"] = password;
		if (role !== undefined) usero["role"] = role;
		User.findOne(usero).exec((err, user) => {
			if (err) {
				resolve(false);
			}
			if (user) {
				resolve(true);
			}
			else resolve(false);
		});
	});
	
}

module.exports.printDB = function (){
	User.find(function(err,data){
		if (err) return "Error while getting database!";
		console.log(data);
	});
}

module.exports.addUser = function(username,password,role="user"){
	return new Promise((resolve,reject) => {
		(new User({
			username: username,
			password: password,
			role: role,
			data: []
		})).save().then(() => {
			console.log("New user has been added to the database!");
			resolve(true);
		});
	});
	
}

module.exports.removeUser = function(username){
	return new Promise((resolve,reject) => {
		User.find({username: username}).deleteOne(() => {
			console.log("A user has been deleted!"); resolve(true);
		});
	});
	
}

module.exports.setRole = function(username,role){
	return new Promise((resolve,reject) => {
		User.findOne({username}).exec((err, user) => {
			if (err) {
				resolve(false);
			}
			if (user) {
				user.role = role;
				user.save().then(() => {
					console.log("Role of the user has been set!");
					resolve(true);
				})
			}
		});
	});
	
}

module.exports.getRole = function(username){
	return new Promise((resolve,reject) => {
		User.findOne({username}).exec((err, user) => {
			if (err) {
				resolve(false);
			}
			if (user) {
				resolve(user.role);
			}
		});
	});
	
}

module.exports.getData = function(username){
	return new Promise((resolve,reject) => {
		User.findOne({username}).exec((err, user) => {
			if (err) {
				resolve(false);
			}
			if (user) {
				resolve(user.data);
			}
		});
	});
}

module.exports.setData = function(username,data){
	return new Promise((resolve,reject) => {
		User.findOne({username}).exec((err, user) => {
			if (err) {
				resolve(false);
			}
			if (user) {
				user.data;
				user.save().then(() => {
					console.log("Data of the user has been set!");
					resolve(true);
				});
			}
		});
	});
}

module.exports.setPassword = function(username,password){
	return new Promise((resolve,reject) => {
		User.findOne({username}).exec((err, user) => {
			if (err) {
				resolve(false);
			}
			if (user) {
				user.password = password;
				user.save().then(() => {
					console.log("Password of the user has been set!");
					resolve(true);
				});
			}
		});
	});
}

