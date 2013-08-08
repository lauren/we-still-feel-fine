;(function () {

  window.onload = function () {
    var socket = io.connect();

    socket.on("feelingTweet", function (data) {
      console.log(data);
    });

  };

})();