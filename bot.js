// Import llibraries
const Discord = require('discord.js');
const Util = require('util')
const DarkSky = require('forecast.io');
const NodeGeocoder = require('node-geocoder');

// Import auth files
const Auth = require('./auth.json');
const DarkSkyAuth = require('./darkskyauth.json');
const GeocodingAuth = require('./geocoding.json');

var options = {
  provider: 'openmapquest',

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: GeocodingAuth.token, // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

// Create an instance of a Discord client
const client = new Discord.Client();

// The token of your bot - https://discordapp.com/developers/applications/me
const token = Auth.token;

var options = {
    APIKey: DarkSkyAuth.token,
    timeout: 1000
  },
  darksky = new DarkSky(options);

/*client.on('ready', () => {
  client.user.setStatus('online');
  client.user.setGame('The Best Game');
  //TODO this should be updated to a general solution
  const channel = client.channels.get("227518767427616778");
  channel.send("I'm back online bitches!");
});*/

// Create an event listener for messages
client.on('message', message => {
  if (message.content.substring(0, 1) == '-') {
    message.channel.startTyping();

    var args = message.content.substring(1).split(' ');
    var cmd = args[0];

    args = args.splice(1);
    if (cmd === 'hello') {
      // Send "pong" to the same channel
      message.channel.send("hello to you too " + message.author.toString() + "!");
    } else if (cmd === 'weather') {
      var location = "";

      for (var i = 0; i < args.length; i++) {
        var obj = args[i];
        location += obj + " ";
      }

      console.log(location);

      if (location === undefined) {
        message.channel.send("Location invalid my dude!");
      } else if (location.startsWith('my ')) {
        message.channel.send("Fuck you " + message.author.toString() + " :)");
      } else {
        geocoder.geocode(location.trim(), function(err, res) {
          if (err) {
            message.channel.send("Seems that location is invalid!");
          } else {
            console.log(res);

            var confidence = 0;
            var index = 0;
            for (var i = 0; i < res.length; i++) {
              var obj = res[i];
              if (obj.extra.confidence > confidence) {
                confidence = obj.extra.confidence;
                index = i;
              }
            }

            if (confidence <= 0.1) {
              message.channel.send("Seems that location is invalid!");
            } else {
              var latitude, longitude;
              latitude = res[index].latitude;
              longitude = res[index].longitude;

              darksky.get(latitude, longitude, function(err, res, data) {
                if (err) {
                  message.channel.send("Couldn't get information for that location!");
                } else {
                  var temperature = ((data.currently.temperature - 32) * (5 / 9));
                  message.channel.send(data.currently.summary + " with temperature of " + (Math.round(temperature * 10) / 10) + "ºC");
                }
              });
            }
          }
        });
      }
    }
    message.channel.stopTyping();
  }
});

client.on("presenceUpdate", (oldMember, newMember) => {

  console.log(oldMember.presence);
  console.log(newMember.presence);

  if (oldMember.presence.game !== newMember.presence.game) {
    const channel = client.channels.get("227518767427616778");

    if (newMember.presence.game != null) {
      channel.send("Hey people, " + newMember.user.username + " is playing " + newMember.presence.game.name + ". You should join!");
    }
    else {
      channel.send(newMember.user.username + " stopped playing " + oldMember.presence.game.name + ". And you missed your chance!");
    }
  }
});

// Log our bot in
client.login(token);

/*const getDefaultChannel = (guild) => {
  // get "original" default channel
  if(guild.channel.has(guild.id))
    return guild.channels.get(guild.id)

  // Check for a "general" channel, which is often default chat
  if(guild.channels.exists("name", "general"))
    return guild.channels.find("name", "general");

  // Now we get into the heavy stuff: first channel in order where the bot can speak
  // hold on to your hats!
  return guild.channels
   .filter(c => c.type === "text" &&
     c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
   .sort((a, b) => a.position - b.position ||
     Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
   .first();
}*/
