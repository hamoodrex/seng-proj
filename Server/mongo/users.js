const mongoose = require("mongoose");

var User =  mongoose.Schema({
    username: {
		type: String,
		required: true
	},
    password: {
		type: String,
		required: true
	},
    role: {
		type: String,
		default: "user",
		enum: ['admin','user']
    },
	data: []
});
module.exports = User = mongoose.model('user',User);