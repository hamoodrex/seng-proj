var express = require("express");
const bodyParser = require("body-parser");
var session = require("express-session");
const Database = require("./mongo/database.js");
const User = require('./mongo/users');
const path = require('path');

var app = express();
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

const port = 80;

Database.run();

// Express app setup
app.use(express.static("/var/www/html/public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
	secret: "bajlnkavroba;jehouasn(*&%^&$*&TY*",
	resave: false,
	saveUninitialized: true,
	//cookie: { secure: true}
}));

app.get("/", (req, res) => {
	req.session.logged_in = false;
	req.session.admin = false;
	req.session.guest = false;
	res.sendFile("/var/www/html/Login_page.html");
});
app.get("/js/:filename", (req, res) => {
	let filename = req.params.filename;
	if (req.session.logged_in) {
		if (req.session.admin) {
			res.sendFile("/var/www/html/private/admin/" + filename);
		}
		else if (req.session.guest) {
			res.sendFile("/var/www/html/private/guest/" + filename);
		}
		else {
			res.sendFile("/var/www/html/private/user/" + filename);
		}
	}
});

app.get("/logout", (req, res) => {
	delete req.session.logged_in;
	delete req.session.username;
	res.redirect("/");
});

app.get("/simulator", function (req, res) {
	if (req.session.logged_in) {
		if (req.session.admin)
			res.sendFile("/var/www/html/admin_simulator.html");
		else if (req.session.guest)
			res.sendFile("/var/www/html/guest_simulator.html");
		else
			res.sendFile("/var/www/html/user_simulator.html");
	}
	else {
		res.send("Login failed!");
	}

});

app.post("/login", function (req, res) {
	var user = req.body.username;
	var pass = req.body.password;
	if ('login' in req.body) {
		Database.checkUser(user, pass).then(response => {
			if (response) {
				req.session.logged_in = true;
				req.session.username = user;
				Database.checkUser(user, pass, "admin").then(response => {
					if (response) {
						req.session.admin = true;
					}
					res.redirect("simulator");

				});
			}
			else {
				req.session.logged_in = false;
				res.send("Invalid credentials!");
			}
		});
	}
	else if ('register' in req.body) {
		Database.checkUser(user).then(response => {
			if (response) {
				res.send("User already registered!");
			}
			else {
				Database.addUser(user, pass);
				res.send("User has been registered!");
			}
		});
	}
	else if ("guest" in req.body) {
		req.session.logged_in = true;
		req.session.guest = true;
		res.redirect("simulator");
	}

});


app.get('/admin_panel', async (req, res) => {
	if (req.session.admin) {
		try {
			const users = await User.find();
			res.render('admin_panel', { users });
		} catch (err) {
			res.status(500).send("ERROR");
		}

	} else {
		res.send('Unauhterized');
	}
})
app.get("/admin_panel/delete/:userId", async (req, res) => {
	if (!req.session.logged_in || !req.session.admin) {
		return res.redirect('login')
	}
	try {
		const { userId } = req.params;
		const r = await User.findByIdAndRemove(userId);
		res.redirect('/admin_panel');

	} catch (err) {
		res.send("ERROR");
	}
})

app.get('/admin_panel/make_admin/:userId', async (req, res) => {
	if (!req.session.logged_in || !req.session.admin) {
		return res.redirect('login')
	}
	try {
		const { userId } = req.params;
		const u = await User.findById(userId);
		makeAdmin(u.username);
		res.redirect('/admin_panel');

	} catch (err) {
		res.send("ERROR");
	}
})

app.get('/admin_panel/make_user/:userId', async (req, res) => {
	if (!req.session.logged_in || !req.session.admin) {
		return res.redirect('login')
	}
	try {
		const { userId } = req.params;
		const u = await User.findById(userId);
		makeUser(u.username);
		res.redirect('/admin_panel');

	} catch (err) {
		res.send("ERROR");
	}
})
app.post('/admin_panel/change_password/:userId', async (req, res) => {
	if (!req.session.logged_in || !req.session.admin) {
		return res.redirect('login')
	}
	try {
		const { userId } = req.params;
		const u = await User.findById(userId);
		await Database.setPassword(u.username, req.body.password);
		res.redirect('/admin_panel');

	} catch (err) {
		res.send("ERROR");
	}
})
app.post('/admin_panel/add_user', async (req, res) => {
	if (!req.session.logged_in || !req.session.admin) {
		return res.redirect('login')
	}
	var user = req.body.username;
	var pass = req.body.password;
	Database.checkUser(user).then(response => {
		if (response) {
			res.send("User already registered!");
		}
		else {
			Database.addUser(user, pass);
			res.redirect('/admin_panel')
		}
	});
})

app.get('/get_data', async (req, res) => {
	// const data = await Database.getData(req.session.username);
	const user = await User.findOne({ username: req.session.username });
	const data = user.data;
	res.status(200).json(data);
});
app.post('/set_data', async (req, res) => {
	const data = req.body;
	const user = await User.findOne({ username: req.session.username });
	user.data = data;
	await user.save();
	// await Database.setData(req.session.username, data);
	res.status(201).json(data);
});

function makeAdmin(username) {
	Database.setRole(username, "admin");
}
function makeUser(username) {
	Database.setRole(username, "user");
}

app.listen(port, () => {
	console.log("Express server started listening on port 80");
});