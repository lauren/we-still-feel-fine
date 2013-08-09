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

    var quarterBrowserHeight = function () {
      return 0.25 * document.documentElement.clientHeight;
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
        .attr("cx", randomX())
        .attr("cy", randomY())
        .attr("r", 0)
        .transition()
        .duration(200)
        .attr("r", 20);

    });

    // cross-browser event binder
    var bindEvent = function (element, event, thisFunction) {
      if (element.addEventListener) {
        element.addEventListener(event, thisFunction);
      } else {
        element.attachEvent(event, thisFunction);
      }
    };

    // reset circle to default values
    var resetCircle = function (circle) {
      d3.select(circle).transition()
        .duration(200)
        .attr("class", "circle")
        .attr("r", 20);
    };

    // reset all circles to default values
    var resetAllCircles = function () {
      d3.select("svg").selectAll("circle").transition()
        .duration(200)
        .attr("r", 20)
        .attr("class", "circle");
    };

    var hideTweetDetails = function (detailEl) {
      d3.select(detailEl).transition()
        .duration(200)
        .style("opacity", "0");
    };

    bindEvent(document, "click", function (event) {
      var clickedEl = event.srcElement,
          detailEl = document.getElementById('tweet-detail'),
          textEl = document.createElement("text");
      
      if (clickedEl.className.baseVal === "circle selected") {

        // if click was on the selected circle, 
        // reset selected circle and hide tweet detials
        resetCircle(clickedEl);
        hideTweetDetails(detailEl);

      } else if (clickedEl.className.baseVal === "circle") {

        resetAllCircles();

        // bring clicked circle to front
        clickedEl.parentNode.appendChild(clickedEl);
        
        // transition clicked circle to radius of
        // 25% of browser height and add
        // selected class
        d3.select(clickedEl).transition()
          .duration(200)
          .attr("class", "selected")
          .attr("r", quarterBrowserHeight);

        // put the tweet in detailEl and fade in
        detailEl.innerHTML = clickedEl.dataset.tweet;
        d3.select(detailEl).transition()
          .duration(200)
          .style("opacity", "0.8");

        textEl.innerHTML = clickedEl.dataset.feeling;
        textEl.style.fill = randomHex();
      
      } else {
        // if click was outside a circle,
        // close all circles hide tweet detials
        resetAllCircles();
        hideTweetDetails(detailEl);
      }

    });

  };

})();