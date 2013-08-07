var express = require("express"),
    app = express(),
    io = require("socket.io").listen(server),
    server = require("http").createServer(app);

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

io.sockets.on("connection", function (socket) {

  socket.on("disconnect", function () {
  });

});


server.listen(process.env.PORT || 3000);