var Config = require('./config.secret.js');
var Twit = require('twit');
var Ent = require('ent');

// Caching emojis for hash searching.

var Emojilib = require('emojilib');
var emojiSearchHash = {};

Object.keys(Emojilib.lib).forEach(function(emoji_key) {
  var emoji = Emojilib.lib[emoji_key];
  var keywords = emoji["keywords"];

  keywords.forEach(function(keyword) {
    emojiSearchHash[keyword] = emojiSearchHash[keyword] || [];
    emojiSearchHash[keyword].push(emoji_key);
  });
});

var T = new Twit({
  consumer_key: Config.consumer_key,
  consumer_secret: Config.consumer_secret,
  access_token: Config.access_token,
  access_token_secret: Config.access_token_secret
});

var stream = T.stream('statuses/filter', { follow: Config.user_ids });

stream.on('tweet', function(tweet) {
  if (Config.user_ids.indexOf(tweet.user.id) > -1) {
    if (tweet.retweeted_status) {
      return;
    } else {

    var tweet_text = tweet.text;
    var splitText = tweet_text.split(" ");

    var emojifiedText = splitText.map(function(word) {
      var lowercaseWord = word.toLowerCase();
      var potentialEmojis = emojiSearchHash[lowercaseWord] || [];

      if (potentialEmojis.length == 0) {
        return word;
      } else if (potentialEmojis.length == 1) {
        return Emojilib.lib[potentialEmojis[0]]["char"] + " ";
      } else {
        var randomEmoji = potentialEmojis[Math.floor(Math.random() * potentialEmojis.length)];
        return Emojilib.lib[randomEmoji]["char"] + " ";
      }
    }).join(' ');

    console.log(tweet_text);
    console.log(emojifiedText);

    T.post('statuses/update', { status: emojifiedText }, function(err, data, response) {
      // Handle errors.
    });
  }
});
