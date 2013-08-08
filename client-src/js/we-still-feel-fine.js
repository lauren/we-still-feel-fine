;(function () {

  window.onload = function () {
    var socket = io.connect(),
        tweets = [];

    // thanks Paul Irish
    var randomHex = function () {
      return '#'+Math.floor(Math.random()*16777215).toString(16);
    };

    var randomX = function () {
      return Math.random() * document.documentElement.clientWidth;
    };

    var randomY = function () {
      return Math.random() * document.documentElement.clientHeight;
    };

    socket.on("feelingTweet", function (data) {
      console.log(data);
      tweets.push(data);
      var circles = d3.select("svg").selectAll("circle")
        .data(tweets);

      circles.enter().append("circle")
        .attr("class", "circle")
        .attr("data-feeling", data.feeling)
        .attr("data-tweet", data.text)
        .style("fill", randomHex())
        .style("stroke", randomHex())
        .style("stroke-width", "2px")
        .attr("r", 20)
        .attr("cx", randomX())
        .attr("cy", randomY());

    });

  };

})();