// Readymade modules
const http = require("http");
const https = require('https');
const express = require("express");
const path = require("path");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cron = require('node-cron');

const eventController = require('./controller/Event.controller');


//This Cronjob For Guest Mail 

cron.schedule('0 17 * * *', () => {
	console.log('running a task every 5 seconds');
	eventController.checkForEmailDateAndTime();
});

// Created Modules
// const config = require("./config");
// const Database = require("./database/database");

config = {};
config.env = require("./config/env.config");
const Database = require("./config/database");

// Load dotenv config
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
	// eslint-disable-next-line global-require
	require("dotenv").load();
	if (!process.env.PORT) {
		console.error('Required environment variable not found. Are you sure you have a ".env" file in your application root?');
		console.error('If not, you can just copy "example.env" and change the defaults as per your need.');
		process.exit(1);
	}
}

const app = express();
// const server = http.createServer(app);

// Following Code For Secure Server https

// const secureServer = https.createServer(credentials, app);
// secureServer.listen(process.env.PORT);
// console.log(`Secure Server started on port ${process.env.PORT}`);



app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// API routes initialise
require("./routes/index")(app);

// Catch 404 errors
// Forwarded to the error handlers

// app.use((req, res, next) => {
// 	const err = new Error("Not Found");
// 	err.status = 404;
// 	next(err);
// });

// Development error handler
// Displays stacktrace to the user

// if (app.get("env") === "development") {
// 	app.use((err, req, res) => {
// 		res.status(err.status || 500);
// 		res.render("error", {
// 			message: err.message,
// 			error: err,
// 		});
// 	});
// }

// Production error handler
// Does not display stacktrace to the user

// app.use((err, req, res) => {
// 	res.status(err.status || 500);
// 	res.render("error", {
// 		message: err.message,
// 		error: "",
// 	});
// });



function databaseConnectivity(envName) {
	Database.config(
		config.env.name === envName
			? config.env.settings.dbaddress
			: config.env.common.dbaddress,
		config.env.name === envName
			? config.env.settings.dbname
			: config.env.common.dbname,
		config.env.name === envName
			? config.env.settings.dbusername
			: config.env.common.dbusername,
		config.env.name === envName
			? config.env.settings.dbpassword
			: config.env.common.dbpassword,
		config && config.databaseOption ? config.databaseOption : undefined,
		(err, message) => {
			if (!err) console.info("Mongodb is connected to " + config.env.settings.dbname);
			else console.error(`Mongodb Error:${message}`);
		}
	);
}
console.log("env file name ------============>", config.env.name)
if (config.env.name === "production") {

	// var credentials = {
	// 	key: fs.readFileSync("/var/www/html/conduct/ssl/privkey1.pem"),
	// 	cert: fs.readFileSync("/var/www/html/conduct/ssl/fullchain1.pem")
	// };
	databaseConnectivity(config.env.name);
	console.log(`Server started on port ${config.env.port}`);
	var server = https.createServer(credentials, app);
	server.listen(config.env.port);
	server.on("error", onError);
	server.on("listening", onListen);
} else if (config.env.name === "test") {
	var server = https.createServer(
		{
			key: fs.readFileSync("/var/www/html/Aso-ebi/ssl/privkey1.pem"),
			cert: fs.readFileSync("/var/www/html/Aso-ebi/ssl/fullchain1.pem")
		},
		app
	);
	// var server = http.createServer(app);
	console.log(`Server started on port ${config.env.port}`);
	databaseConnectivity(config.env.name);
	// server.listen(config.env.port);
	// server.on("error", onError);
	// server.on("listening", onListen);
	// Development and Testing mode
} else {
	if (config.env.name === "development" && config.env.https) {
		var server = http.createServer(
			// {
			// 	key: fs.readFileSync("/var/www/html/triviaPost/ssl/privkey1.pem"),
			// 	cert: fs.readFileSync("/var/www/html/triviaPost/ssl/fullchain1.pem")
			// },
			app
		);
		databaseConnectivity(config.env.name);
	} else {
		databaseConnectivity(config.env.name);
		var server = http.createServer(app);
	}
	// server.listen(config.env.port);
	console.log("runnint port number======", config.env.port)
	// server.on("error", onError);
	// server.on("listening", onListen);
}



// db configuration
// console.log("process.env.DEV_ADDRESS", process.env.DEV_ADDRESS);
// Database.config(
// 	process.env.NODE_ENV === "production" ? process.env.PROD_ADDRESS : process.env.DEV_ADDRESS,
// 	process.env.NODE_ENV === "production" ? process.env.PROD_DBNAME : process.env.DEV_DBNAME,
// 	process.env.NODE_ENV === "production" ? process.env.PROD_USERNAME : process.env.DEV_USERNAME,
// 	process.env.NODE_ENV === "production" ? process.env.PROD_PASSWORD : process.env.DEV_PASSWORD,
// 	config && config.databaseOption ? config.databaseOption : undefined,
// 	(err, message) => {
// 		if (!err) console.info("Mongodb is connected");
// 		else console.error(`Mongodb Error:${message}`);
// 	},
// );




server.listen(process.env.PORT);
console.log(`Server started on port ${process.env.PORT}`);
module.exports = app;