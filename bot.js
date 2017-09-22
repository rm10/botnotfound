// Import the discord.js module
const Discord = require('discord.js');
var util = require('util')
const auth = require('./auth.json');
var DarkSky = require('forecast.io');
const darkSkyAuth = require('./darkskyauth.json');
const geocodingAuth = require('./geocoding.json');
var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'openmapquest',

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: geocodingAuth.token, // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

/*geocoder.geocode("marinha grande", function(err, res) {
  console.log(res);

  var confidence = 0;
  var index = 0;
  for(var i = 0; i < res.length; i++) {
    var obj = res[i];
    if (obj.extra.confidence > confidence) {
      confidence = obj.extra.confidence;
      index = i;
    }
  }

  var latitude, longitude;
  latitude = res[index].latitude;
  longitude = res[index].longitude;

  darksky.get(latitude, longitude, function (err, res, data) {
    if (err) throw err;
    var temperature = ((data.currently.temperature - 32) * (5/9));
    console.log(data.currently.summary + " with temperature of " + (Math.round(temperature * 10) / 10) + "ºC");
  });
});*/

// Create an instance of a Discord client
const client = new Discord.Client();

// The token of your bot - https://discordapp.com/developers/applications/me
const token = auth.token;

var options = {
  APIKey: darkSkyAuth.token,
  timeout: 1000
},
darksky = new DarkSky(options);

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
  if (message.content.substring(0, 1) == '-') {
    var args = message.content.substring(1).split(' ');
    var cmd = args[0];

    args = args.splice(1);
    if (cmd === 'hello') {
      // Send "pong" to the same channel
      message.channel.send("hello to you too  " + message.author.toString() + "!");
    }
    else if (cmd === 'weather') {
      var location = args[0];

      if (location === undefined) {
        message.channel.send("location invalid dude");
      }
      else {
        geocoder.geocode(location, function(err, res) {
          console.log(res);

          var confidence = 0;
          var index = 0;
          for(var i = 0; i < res.length; i++) {
            var obj = res[i];
            if (obj.extra.confidence > confidence) {
              confidence = obj.extra.confidence;
              index = i;
            }
          }

          var latitude, longitude;
          latitude = res[index].latitude;
          longitude = res[index].longitude;

          darksky.get(latitude, longitude, function (err, res, data) {
            if (err) throw err;
            var temperature = ((data.currently.temperature - 32) * (5/9));
            message.channel.send(data.currently.summary + " with temperature of " + (Math.round(temperature * 10) / 10) + "ºC");
          });
        });
      }
    }
  }
});

// Log our bot in
client.login(token);
