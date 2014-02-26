var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    env = process.env.NODE_ENV || "development",
    io = require("socket.io").listen(server),
    Twitter = require('ntwitter'),
    feelings = require('./lib/feelings.js'),
    feelingsRegex = feelings.feelingsRegex,
    feelingsColors = feelings.feelingColors;

if (env === "development") {
  // keys-sample.js is included. rename to keys.js and update with your own keys.
  var keys = require('./lib/keys.js');
}

// app configuration
app.configure(function () {
  app.use(express.static(__dirname + "/public"));
  app.set("view engine", "jade");
  app.set("view options", {layout: false});
  app.set("views", __dirname + "/views");
  app.use(express.logger("dev"));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  if (env === "development") {
    // app.use(express.errorHandler());
  }
});

var getTweets = function (backOffDuration) {
  console.log("getTweets with initial backoff duration: " + backOffDuration);

  // ntwitter setup
  var twit = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY || keys.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET || keys.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN || keys.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET || keys.TWITTER_TOKEN_SECRET
  });

  twit.stream('statuses/filter', {'track':'feel,feeling,felt', 'language':'en', 'filter_level': 'medium'}, function(stream) {
    stream.on('data', function (data) {

      if (data.text) {
        // eligible words span 2 words before and 5 after feel/feeling/felt
        // 2 words before "how bad I felt"
        // 5 words after "I felt oh so very incredibly shitty"
        var tokenizedText = tokenizeText(data.text),
            feelingIndex = findFeelingIndex(tokenizedText),
            eligibleWords = tokenizedText.slice(Math.max(0, feelingIndex - 2), Math.min(feelingIndex + 5, tokenizedText.length)).join(" ");

        // look for legitimate feeling words
        matchingFeelings = new RegExp(feelingsRegex).exec(eligibleWords);

        if (matchingFeelings) {
          // strip spaces from matching feeling
          firstFeeling = matchingFeelings[0].replace(/ /g, "");
          data.feeling = firstFeeling;
          data.feelingColor = feelingsColors[firstFeeling];
          io.sockets.emit('feelingTweet', data);
          // console.log(data);
          console.log("feeling tweet: " + data.text);
          console.log("feeling: " + data.feeling);
        }
        else {
          // console.log(data);
          console.log("not a real feeling: " + data.text);
        }
      } else {
        console.log("no data.text?!");
      }
      
    });

    stream.on('end', function (response) {
      backOff(5000);
    });
    stream.on('destroy', function (response) {
      backOff(5000);
    });
    stream.on('error', function (response, status) {
      console.log("an error happened with status " + status);
      console.log("current duration: " + backOffDuration);
      backOff(backOffDuration);
    });


  });
};

getTweets(60000);

// routes
app.get("/?", function (request, response) {
  response.render("index");
});

app.get("/about", function (request, response) {
  response.render("about");
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

// back off reconnection attempts exponentially
var backOff = function (duration) {
  var newDuration = duration * 2;
  console.log("reconnecting with " + duration + " millisecond back-off");
  console.log("new duration: " + newDuration);
  setTimeout(function () {
    getTweets(newDuration * 2);
  }, duration);
};

server.listen(process.env.PORT || 3000);