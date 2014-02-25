;(function () {

  window.onload = function () {

    var socket = io.connect();
    var tweets = [];
    var newTweets = [];
    var supportsTouch = 'ontouchstart' in window;

    // constrained by browser width. 100px offset for inner SVG containers.
    var randomX = function () {
      return Math.random() * document.documentElement.clientWidth - 100;
    };

    // constrained by browser height. 100px offset for inner SVG containers.
    var randomY = function () {
      return Math.random() * document.documentElement.clientHeight - 100;
    };

    var quarterSmallestBrowserDimension = function () {
      return document.documentElement.clientHeight < document.documentElement.clientWidth 
        ? 0.25 * document.documentElement.clientHeight
        : 0.25 * document.documentElement.clientWidth;
    };

    // change the loading message every four seconds
    setInterval(function () {
      var messages = [
        "Feelings are hard to find...",
        "So many feelings...",
        "Feeling painfully slow...",
        "Interpreting feelings...",
        "Feelings take time to grow...",
        "I can't feel it yet..."
      ];
      if (d3.select("#load-text").length > 0) {
        var messageIndex = Math.floor(Math.random() * messages.length);
        d3.select("#load-text")
          .transition()
          .duration(200)
          .text(messages[messageIndex]);
      }
    }, 2000);

    socket.on("feelingTweet", function (data) {

      if (d3.select("#loading").length > 0) {
        d3.select("#loading")
          .transition()
          .duration(200)
          .style("opacity", 0);
      }

      tweets.push(data); 

      var svg = d3.select("svg"),
          firstTweet;

      // create inner SVGs (necessary because g elements can't be
      // positioned with X and Y) and give them the tweet data
      // and mouse/click events
      var innerSVGs = svg.selectAll("svg")
        .data(tweets)
        .enter()
        .append("svg")
        .attr({
          "x": randomX(),
          "y": randomY(),
          "data-feeling": data.feeling,
          "data-tweet": data.text,
          "data-user": data.user.screen_name,
          "data-userimage": data.user.profile_image_url,
          "data-tweetId": data.id_str,
          "data-feelingColor": data.feelingColor
        })
        .on("mouseenter", function () {
          if (!supportsTouch) {
            mouseEnterGroup(this);
          }
        })
        .on("mouseleave", function () {
          if (this.id !== "selected" && !supportsTouch) {
            resetGroup(this);
          }
        })
        .on("click", function (event) {
          clickGroup(this);
        });        

      // create groups 
      var groups = innerSVGs.append("g");

      // when tweets array gets too long, take the first one
      // off and remove its SVG element from the DOM
      if (tweets.length > 1000) {
        firstTweet = tweets.shift();
        svg.selectAll("svg")
          .data([firstTweet], function (d) {return d;})
          .remove();
      }

      // add circles to each group
      var circles = groups.append("circle")
          .attr({
            cx: 100,
            cy: 100,
            r: 0,
            fill: data.feelingColor,
            class: "circle"
          })
          .transition()
          .duration(200)
          .attr("r", 20);

    });

    // execute a click event on an SVG group every 4 seconds
    setInterval(function () {
       var innerSVGs = d3.select("svg").selectAll("svg"),
          chosenCircleIndex = Math.floor(Math.random() * innerSVGs.length),
          chosenCircle = innerSVGs[chosenCircleIndex][0];

      if (chosenCircle) {
        var event = document.createEvent("SVGEvents");
        event.initEvent("click",true,true);
        chosenCircle.dispatchEvent(event);
        showLabel(chosenCircle);
      }
    }, 4000);

    // reset group to default state
    var resetGroup = function (group) {
      // if group is not specified, reset all
      group = group ? d3.select(group) : d3.selectAll("g");

      group.attr("id", "");
      group.selectAll("text").remove();
      group.select("circle")
        .attr("class", "circle")
        .transition()
        .duration(200)
        .attr("r", 20);
    };

    var hideTweetDetails = function () {
      d3.select('#tweet-detail').transition()
        .duration(200)
        .style("display", "none");
    };

    var showLabel = function (group) {
      // add shadow with feeling text
      d3.select(group)
        .append("text")
        .text(group.dataset.feeling)
        .attr({
          x: 100,
          y: 100,
          "alignment-baseline": "middle",
          "text-anchor": "middle",
          "class": "shadow"
        });
    
      // add label with feeling text
      d3.select(group)
        .append("text")
        .text(group.dataset.feeling)
        .attr({
          x: 100,
          y: 100,
          "alignment-baseline": "middle",
          "text-anchor": "middle",
          "class": "label"
        });
    };

    // what happens when a group is moused over
    var mouseEnterGroup = function (group) {
      
      // bring moused-over group to front
      group.parentNode.appendChild(group);

      if (group.id !== "selected") {
        
        // expand circle radius
        d3.select(group)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", 60);

        showLabel(group);
      }
    };

    // what happens when a group is clicked 
    var clickGroup = function (group) {
      if (group.id === "selected") {
        
        // if click was on the selected group, 
        // reset it and hide tweet detials
        resetGroup(group);
        hideTweetDetails();
      
      } else {

        // reset currently selected group
        resetGroup(document.getElementById("selected"));

        // bring clicked group to front and give it selected ID
        group.parentNode.appendChild(group);
        d3.select(group)
          .attr("id", "selected");

        // transition clicked circle to radius of
        // 25% of smallest browser dimension
        d3.select(group).select("circle")
          .transition()
          .duration(200)
          .attr("r", 100);

        showLabel(group);

        // put the tweet in #tweet-detail and fade in
        d3.select("#user-link")
          .attr("href", "http://twitter.com/" + group.dataset.user);
        d3.select("#user-image")
          .attr("src", group.dataset.userimage);
        d3.select("#username-link")
          .text(group.dataset.user)
          .attr("href", "http://twitter.com/" + group.dataset.user);
        d3.select("#tweet-text")
          .html(": " + group.dataset.tweet + " ");
        d3.select("#tweet-link")
          .attr("href", "http://twitter.com/" + group.dataset.user + "/status/" + group.dataset.tweetId);
        d3.select("#tweet-detail").transition()
          .duration(200)
          .style("display", "block");

      }
    };

  };

})();