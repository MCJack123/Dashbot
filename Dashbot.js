var tmi = require("tmi.js");
var GDClient = require("node-geometry-dash");
var ncp = require("copy-paste");
var player = require('play-sound')(opts = {});
const GD = new GDClient({
  username: "...",  // doesn't work yet :/
  password: "..."   // doesn't work yet :/
});

var botName = "JackMacBot"; // your bot's name
var userName = "jackmacwindows"; // your broadcaster name
var oauth = "oauth:a1b2c3d4e5f6g7h8i9j10k11l12m13"; // your bot's oauth key (this is not real)
var host = '127.0.0.1'; // your ip
var port = 4000; // port to host server on

var options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: botName,
        password: oauth
    },
    channels: ["#" + userName]
};

var client = new tmi.client(options);

// Connect the client to the server..
client.connect();

var levels = [];
var open = false;

function chat(text) {
	client.say(userName, text);
}

function checkQueue() {
	if (levels.length == 0) {
		chat("There are no levels in the queue. Try adding one first!");
		return false;
	} else if (!open) {
		chat("The level queue is closed! Sorry :(");
		return false;
	} else {
		return true;
	}
}

http = require('http');
fs = require('fs');
server = http.createServer( function(req, res) {

    console.dir(req.param);

    if (req.method == 'POST') {
        console.log("POST");
        var body = '';
        req.on('data', function (data) {
            body += data;
            console.log("Partial body: " + body);
        });
        req.on('end', function () {
            console.log("Body: " + body);
			var data = JSON.parse(body);
			if (data.data == "complete") chat("!completed");
			else if (data.data == "next") chat("!next");
        });
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('post received');
    }
    else
    {
        console.log("GET");
        //var html = '<html><body><form method="post" action="http://localhost:3000">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>';
        var html = fs.readFileSync('Dashbot.html');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
    }

});

server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);

client.on("chat", function (channel, userstate, message, self) {
    // Don't listen to my own messages..
    //if (self) return;
	if (message.substring(0, 4) == "!add") {
		if (message == "!add") {
			chat("Usage: !add <level id>");
			return;
		}
		if (!open) {
			chat("The level queue is closed! Sorry :(");
			return;
		}
		var id = message.substring(5, 13);
		var idNum = parseInt(id);
		if (idNum.toString() == "NaN" || message.length < 13) {
			chat("That is not a valid level id. Please try again, and make sure you use !add <level id>.");
			return;
		}
		GD.levels(id).then(theLevel => {
			if (theLevel == undefined) {
				chat("That is not a valid level id. Please try again, and make sure you use !add <level id>.");
				return;
			}
			var level = theLevel[0];
			console.log(level);
			if (level.difficulty == "Demon") {
				chat("That level is a bit too hard for me to play. Please choose some other level.");
				return;
			}
			if (level.length == "XL") {
				chat("That level is too long for me to play! Please choose another level that isn't as long.");
				return;
			}
			level.submitter = userstate;
			levels.push(level);
			chat("Your level " + level.name + " with the difficulty " + level.difficulty + " was added to the list! Thanks ;)");
			return;
		});
		return;
	}
	if (message.substring(0, 13) == "!currentlevel") {
		if (!checkQueue()) return;
		chat("The level that is being played is " + levels[0].name + ".");
		return;
	}
	if (message.substring(0, 7) == "!levels") {
		if (!checkQueue()) return;
		var levStr = "";
		for (tLev in levels) {
			if (levStr == "") {
				levStr = levels[tLev].name;
			} else {
				levStr += ", " + levels[tLev].name;
			}
		}
		chat("Current levels in the queue are: " + levStr);
		return;
	}
	if (message.substring(0, 10) == "!completed" && (userstate["display-name"] == "JackMacWindows" || userstate["display-name"] == "jackmacbot")) {
		if (!checkQueue()) return;
		var completed = levels.shift();
		chat("Level completed: " + completed.name + " submitted by " + completed.submitter["display-name"]);
		return;
	}
	if (message.substring(0, 5) == "!next" && (userstate["display-name"] == "JackMacWindows" || userstate["display-name"] == "jackmacbot")) {
		if (!checkQueue()) return;
		ncp.copy(levels[0].id, function() { chat("Now playing: " + levels[0].name + " submitted by " + levels[0].submitter["display-name"]); player.play("play.mp3", function(err){ if (err) throw err; }); });
		return;
	}
	if (message.substring(0, 7) == "!toggle" && (userstate["display-name"] == "JackMacWindows" || userstate["display-name"] == "jackmacbot")) {
		open = !open;
		if (open) chat("The level queue is now open! Add a level with !add <level id>.");
		else chat("The level queue is now closed! Sorry :(");
		return;
	}
});
