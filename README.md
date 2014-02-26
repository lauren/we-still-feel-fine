♥ We Still Feel Fine ♥
======================

In 2005, [Jonathan Harris](http://number27.org) and [Sep Kamvar](http://www.stanford.edu/~sdkamvar/) created [We Feel Fine](http://wefeelfine.org), a project that searched blogs for mentions of feelings and visualized them in a Java applet written in Processing. 

Their complete [methodology](http://wefeelfine.org/methodology.html) is still available online.

I thought it would be fun to update the project for 2013 by using the [Twitter Streaming API](https://dev.twitter.com/docs/streaming-apis), [Node.js](http://nodejs.org/), and [D3.js](http://d3js.org). I've followed We Feel Fine's original methodology pretty closely. 

Briefly, here's what's going on:

* I'm listening to the Twitter Streaming API for tweets that contain the feeling indicators: "feel," "feeling," or "felt." The inclusion of the past tense is a divegence from We Feel Fine's methods.
* When a new Tweet comes in with a feeling indicator word, I create a string of eligible words that starts two words before the feeling indicator and ends five words after it. This is a departure from We Feel Fine, which looked for eligible feelings in the entire sentence in which the feeling indicator was detected. Limiting eligible words to those closer to the feeling indicator seems to provide higher-quality feelings.
*  I search the string of eligible words for any word in [the list of valid feelings](http://wefeelfine.org/data/files/feelings.txt) that We Feel Fine compiled.
* If a valid feeling is found in the eligible words selection, the source Tweet is sent to the browser, which draws a circle representing the feeling tweet in the color that the original We Feel Fine project used for that feeling. Sad feelings are blue or gray, happy feelings are yellow or orange, loved feelings are pink, and angry feelings are red.

## Contributing

Pull requests make ME feel ♥. Here's how to contribute:

1. Fork and pull repo.
2. If you don't have node, [install it](http://howtonode.org/how-to-install-nodejs).
3. From the repo directory, `npm install --save-dev`
4. `grunt watch`: This will automatically JSHint all JavaScript, concatenate and minify the client-side JavaScript, and compile the LESS every time you save. Watch for JSHint errors and correct them.
5. Rename `keys-sample.js` as `keys.js` and update it with your twitter credentials. This file is .gitignored, so it won't be checked in if you push this to a public repo.
6. `foreman start` to start the server, which listens on port 5000.
7. Code!

## Deploying

To deploy to heroku, you must set these environmental variables:

```
  heroku config:set TWITTER_CONSUMER_KEY="your-consumer-key" 
  TWITTER_CONSUMER_SECRET="your-consumer-secret" 
  TWITTER_ACCESS_TOKEN="your-access-token" 
  TWITTER_TOKEN_SECRET="your-token-secret" 
  NODE_ENV="production" --app your-app
```