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

    var quarterSmallestBrowserDimension = function () {
      return document.documentElement.clientHeight < document.documentElement.clientWidth 
        ? 0.25 * document.documentElement.clientHeight
        : 0.25 * document.documentElement.clientWidth;
    };

    socket.on("feelingTweet", function (data) {
      console.log(data);
      tweets.push(data);
      var svg = d3.select("svg");

      var groups = svg.selectAll("g")
          .data(tweets)
          .enter()
          .append("g");

      groups.attr("transform", function(d, i) {
        var x = randomX();
        var y = randomY();
        return "translate(" + [x,y] + ")";
      });
        
      var circles = groups.append("circle")
          .attr({
            cx: 0,
            cy: 0,
            r: 0,
            fill: randomHex(),
            stroke: randomHex(),
            "stroke-width": 2,
            "data-feeling": data.feeling,
            "data-tweet": data.text,
            class: "circle"
          })
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

    // remove all labels
    var removeLabels = function () {
      d3.select("svg").selectAll("text").remove();
    };

    // remove one label
    var removeLabel = function (clickedEl) {
      d3.select(clickedEl.parentNode).selectAll("text").remove();
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
        // reset selected circle, remove its label,
        //  and hide tweet detials
        resetCircle(clickedEl);
        removeLabel(clickedEl);
        hideTweetDetails(detailEl);

      } else if (clickedEl.className.baseVal === "circle") {

        resetAllCircles();
        removeLabels();

        // bring group container of clicked circle to front
        clickedEl.parentNode.parentNode.appendChild(clickedEl.parentNode);
        
        // transition clicked circle to radius of
        // 25% of browser height and add
        // selected class
        d3.select(clickedEl).transition()
          .duration(200)
          .attr("class", "circle selected")
          .attr("r", quarterSmallestBrowserDimension);

        // put the tweet in detailEl and fade in
        detailEl.innerHTML = clickedEl.dataset.tweet;
        d3.select(detailEl).transition()
          .duration(200)
          .style("opacity", "0.8");

        var label = d3.select(clickedEl.parentNode).append("text")
            .text(clickedEl.dataset.feeling)
            .attr({
              "alignment-baseline": "middle",
              "text-anchor": "middle",
              "class": "label"
            });
      
      } else {
        // if click was outside a circle,
        // close all circles hide tweet detials
        resetAllCircles();
        removeLabels();
        hideTweetDetails(detailEl);
      }

    });

  };

})();