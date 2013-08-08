var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server),
    Twitter = require('ntwitter'),
    // keys-sample.js is included. rename to keys.js and update with your own keys.
    keys = require('./lib/keys.js'),
    feelings = require('./lib/feelings.js').feelings;

// app configuration
app.configure(function () {
  app.use(express.static(__dirname + "/public"));
  app.set("view engine", "jade");
  app.set("view options", {layout: false});
  app.set("views", __dirname + "/views");
  app.use(express.logger("dev"));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  // development only
  if (app.get("env") === "development") {
    app.use(express.errorHandler());
  }
  if (app.get("env") === "production") {
    app.enable("view cache");
  }
});

// socket.io setup
io.sockets.on("connection", function (socket) {

  socket.on("disconnect", function () {
  });

});

// ntwitter setp
var twit = new Twitter({
  consumer_key: keys.TWITTER_CONSUMER_KEY,
  consumer_secret: keys.TWITTER_CONSUMER_SECRET,
  access_token_key: keys.TWITTER_ACCESS_TOKEN,
  access_token_secret: keys.TWITTER_TOKEN_SECRET
});

twit.stream('statuses/filter', {'track':'feel,feeling,felt', 'language':'en'}, function(stream) {
  stream.on('data', function (data) {
    var cleanedText = data.text,
        matchingFeelings;
    
    // remove @handles from the text to be analyzed
    if (/@/.test(data.text)) {
      cleanedText = data.text.split(" ").filter(function (word) {
        return !/@/.test(word);
      }).join(" ");
    }
    
    // look for legitimate feeling words
    matchingFeelings = new RegExp(feelings.join("|")).exec(cleanedText);
    if (matchingFeelings) {
      data.feeling = matchingFeelings[0].replace(/ /g, "");
      io.sockets.emit('feelingTweet', data);
      console.log("feeling tweet: " + data.text);
      console.log("feeling: " + data.feeling);
    }
    else {
      console.log("not a real feeling: " + data.text);
    }
    
  });
});

// routes
app.get("/?", function (request, response) {
  response.render("index");
});

app.get("*", function (request, response) {
  response.status(404);
  if (request.accepts('html')) {
    response.render('404', { url: request.url });
    return;
  }
  if (request.accepts('json')) {
    response.send({ error: 'Not found' });
    return;
  }
});

server.listen(process.env.PORT || 3000);