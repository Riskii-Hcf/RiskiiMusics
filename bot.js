const Discord = require("discord.js");

const ytdl = require('ytdl-core');

const search = require('youtube-search');

const bot = new Discord.Client();

const prefix = "=";

var servers = {};

var token = "NDA0DjUxNjM4Nek5NTMyLDUy.DUXL7A.RXDdcKyBaRTtkqKuSPmoViHDo7A";

function play(connection, message) {
  var server = servers[message.guild.id];
if (!message.guild.voiceConnection) message.member.voiceChannel.join()
  server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));
  ytdl.getInfo(server.queue[0], function(err, info) {
  const title = info.title
  message.channel.sendMessage(`:notes: Now Playing **${title}**!`)
  server.np=title;
  })

  if (server.loop === 1) {
    ytdl.getInfo(server.queue[0], function(err, info) {
    const title = info.title
    server.name.push(title)
    })
    server.queue.push(server.queue[0])
  }

  server.queue.shift();
  server.name.shift();

  server.dispatcher.on("end", function() {
    if (server.queue[0]) {
      play(connection, message);
      return
    } else if (!server.queue[0]) {
      connection.disconnect();
      server.np="Nothing";
    }
  });
}

function searchfunc(message){
  var server = servers[message.guild.id];
  let opts = {
    key: "AIzaSyCNWNedPLheIctU0NGaURc9VPfaBdPnl0w",
  }
  let args = message.content.slice(prefix.length + 5);
  let name = args
  search(name, opts, (err, results) => {
      if(err) {
        message.channel.sendMessage(":x: Invalid Song title/link")
      console.log(err);
      return
    } else {
      server.name.push(results[0].title)
      message.channel.sendMessage(":musical_note: Added **" + results[0].title + "** to the Queue");
      server.queue.push(results[0].link);
    }
    })
};

bot.on('ready', () => {
  console.log(`Started bot as: ${bot.user.tag}!`);
});

bot.on("message", function(message) {
if (message.author.equals(bot.user)) return;

if (!message.content.startsWith(prefix)) return;

var args = message.content.substring(prefix.length).split(" ");

if (!servers[message.guild.id]) servers[message.guild.id] = {
  queue: [],
  np: "Nothing",
  name: [""],
  loop: 0,
}

switch (args[0].toLowerCase()) {

case "ping":
message.channel.send("Pinging...").then(pong => {
        pong.edit(`Pong!\nTelk 2.0: **${pong.createdTimestamp - message.createdTimestamp}ms**\nAPI B5Galaxy: **${Math.round(bot.ping)}ms**`)
      })
break;
case "play":
if (!args[1]) return message.channel.sendMessage(":x: Please provide a link for me to play")
if (!message.member.voiceChannel) return message.channel.sendMessage(":x: Sorry you must be in a voice channel to play music")

var server = servers[message.guild.id];
  searchfunc(message)

if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
  play(connection, message)
});
break;
case "skip":
var server = servers[message.guild.id];
if (!server.name) return message.channel.sendMessage(":x: Sorry no music is currently playing");
message.channel.sendMessage("**Skipped!**")
if (server.dispatcher) {
server.name.shift();
server.np="Nothing";
server.dispatcher.end();
}
break;
case "stop":
var server = servers[message.guild.id];

if (message.guild.voiceConnection)
        {
            for (var i = server.queue.length - 1; i >= 0; i--)
            {
                server.queue.splice(i, 1);
         }
            server.dispatcher.end();

        }﻿
message.channel.sendMessage("**Successfully stoped the queue**")
break;
case "np":
var server = servers[message.guild.id];
message.channel.sendMessage(`:notes: The Current Song that is playing is **${server.np}**!`)
break;
case "queue":
var server = servers[message.guild.id];
if (!server.name) return message.channel.sendMessage(":x: Sorry, there is no music that is currently being played");
var serverqueue = server.name.join("\n-");
message.channel.sendMessage("**" + message.guild.name + "** Queue:\n-" + serverqueue)
break;
case "loop":
var server = servers[message.guild.id];
if (!server.np) return message.channel.sendMessage(":x: Sorry no music is currently playing");
if (server.loop === 0) {
  server.loop=1;
  message.channel.sendMessage(":white_check_mark: Loop **Enabled**")
} else if (server.loop === 1) {
  message.channel.sendMessage(":white_check_mark: Loop **Disabled**")
  server.loop=0;
}
break;





}
});


bot.login(process.env.BOT_TOKEN);
