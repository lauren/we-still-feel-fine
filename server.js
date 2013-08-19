var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server),
    Twitter = require('ntwitter'),
    // keys-sample.js is included. rename to keys.js and update with your own keys.
    keys = require('./lib/keys.js'),
    feelings = require('./lib/feelings.js'),
    feelingsList = feelings.feelings,
    feelingsColors = feelings.feelingColors;

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
    // app.use(express.errorHandler());
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

// ntwitter setup
var twit = new Twitter({
  consumer_key: keys.TWITTER_CONSUMER_KEY,
  consumer_secret: keys.TWITTER_CONSUMER_SECRET,
  access_token_key: keys.TWITTER_ACCESS_TOKEN,
  access_token_secret: keys.TWITTER_TOKEN_SECRET
});

twit.stream('statuses/filter', {'track':'feel,feeling,felt', 'language':'en', 'filter_level': 'medium'}, function(stream) {
  stream.on('data', function (data) {

    // eligible words span 2 words before and 5 after feel/feeling/felt
    // 2 words before "how bad I felt"
    // 5 words after "I felt oh so very incredibly shitty"
    var tokenizedText = tokenizeText(data.text),
        feelingIndex = findFeelingIndex(tokenizedText),
        eligibleWords = tokenizedText.slice(Math.max(0, feelingIndex - 2), Math.min(feelingIndex + 5, tokenizedText.length)).join(" ");
    
    // look for legitimate feeling words
    matchingFeelings = new RegExp(feelingsList.join("|")).exec(eligibleWords);

    if (matchingFeelings) {
      // strip spaces from matching feeling
      firstFeeling = matchingFeelings[0].replace(/ /g, "");
      data.feeling = firstFeeling;
      data.feelingColor = feelingsColors[firstFeeling];
      io.sockets.emit('feelingTweet', data);
      console.log("feeling tweet: " + data.text);
      console.log("feeling: " + data.feeling);
      console.log(data);
    }
    else {
      console.log(data);
      console.log("not a real feeling: " + data.text);
    }
    
  });
});

twit.stream.on('end', function (response) {
    // Handle a disconnection
});

twit.stream.on('destroy', function (response) {
    // Handle a 'silent' disconnection from Twitter, no end/error event fired
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

// replace punctuation with spaces, collapse multiple
// consecutive spaces, and split into words
var tokenizeText = function (text) {
  text = text.toLowerCase().replace(/[\.\?\"\n,-\/#!$%\^&\*;:{}=\-_`~()]/g," ");
  text = text.replace(/\s{2,}/g," ");
  return text.split(" ");
};

// find location of feel, feeling, or felt
var findFeelingIndex = function (tokenizedText) {
  if (tokenizedText.indexOf("feel") > -1) {
    return tokenizedText.indexOf("feel");
  } else if (tokenizedText.indexOf("feeling") > -1) {
    return tokenizedText.indexOf("feeling");
  } else {
    return tokenizedText.indexOf("felt");
  }
};

server.listen(process.env.PORT || 3000);