;(function () {

  window.onload = function () {
    var socket = io.connect(),
        tweets = [];

    // thanks Paul Irish
    var randomHex = function () {
      return '#'+Math.floor(Math.random()*16777215).toString(16);
    };

    // constrained by browser width
    var randomX = function () {
      return Math.random() * document.documentElement.clientWidth;
    };

    // constrained by browser height
    var randomY = function () {
      return Math.random() * document.documentElement.clientHeight;
    };

    var quarterSmallestBrowserDimension = function () {
      return document.documentElement.clientHeight < document.documentElement.clientWidth 
        ? 0.25 * document.documentElement.clientHeight
        : 0.25 * document.documentElement.clientWidth;
    };

    socket.on("feelingTweet", function (data) {

      tweets.push(data);

      var svg = d3.select("svg");

      // create groups and mouse/click events
      var groups = svg.selectAll("g")
          .data(tweets)
          .enter()
          .append("g")
          .attr({
            "data-feeling": data.feeling,
            "data-tweet": data.text,
            "data-user": data.user.screen_name,
            "data-userimage": data.user.profile_image_url,
            "data-tweetId": data.id_str,
            "data-feelingColor": data.feelingColor
          })
          .on("mouseenter", function () {
            mouseEnterGroup(this);
          })
          .on("mouseleave", function () {
            if (this.id !== "selected") {
              resetGroup(this);
            }
          })
          .on("click", function (event) {
            clickGroup(this);
          });

      // place the group in a random location w/in browser
      groups.attr("transform", function(d, i) {
        var x = randomX();
        var y = randomY();
        return "translate(" + [x,y] + ")";
      });

      // add circles to each group
      var circles = groups.append("circle")
          .attr({
            r: 0,
            fill: data.feelingColor,
            class: "circle"
          })
          .transition()
          .duration(200)
          .attr("r", 20);

    });

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
        .style("opacity", "0");
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
          .attr("r", 50);

        // add shadow with feeling text
        d3.select(group)
          .append("text")
          .text(group.dataset.feeling)
          .attr({
            "alignment-baseline": "middle",
            "text-anchor": "middle",
            "class": "shadow"
          });
      
        // add label with feeling text
        d3.select(group)
          .append("text")
          .text(group.dataset.feeling)
          .attr({
            "alignment-baseline": "middle",
            "text-anchor": "middle",
            "class": "label"
          });
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
          .attr("r", quarterSmallestBrowserDimension);

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
          .style("opacity", "0.8");

        // shadow disappears on first group clicked unless we add it again here
        var shadow = d3.select(group).append("text")
            .text(group.dataset.feeling)
            .attr({
              "alignment-baseline": "middle",
              "text-anchor": "middle",
              "class": "shadow",
            });

        // label disappears on first group clicked unless we add it again here
        var label = d3.select(group).append("text")
            .text(group.dataset.feeling)
            .attr({
              "alignment-baseline": "middle",
              "text-anchor": "middle",
              "class": "label",
            });
      }
    };

  };

})();