require('dotenv').config()
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const YouTube = require("simple-youtube-api");

const client = new Discord.Client();
const queue = new Map();

let prefix = "~";
//--lib
const change = "change";
const play = "play";
const skip = "skip";
const stop = "stop";
const c_queue = "queue";
const clear = "clear";
//--End lib


client.on("ready", () => {
    console.log("Who is called my name ???, Daddy's home");
});
client.on('guildMemberAdd', member => {
    member.guild.channels.get('channelID').send("Welcome to our channel, You can call me Syl and I'm your assistant bot, created by Sylitas, who is home owner"); 
});
client.on("message", msg => {
    if (msg.channel.type != 'text' || msg.author.bot || !msg.content.startsWith(prefix)) {
        return;
    }
    let message = msg.content.split(" "); // "prefix" + message[1] + message[2] + message[3] ...
    const serverQueue = queue.get(msg.guild.id);
    switch (message[0].replace("~","")) {
        //For changing prefix valuable
        case change:
            let str = "-" + msg.content.charAt(msg.content.length - 1) + " ";
            if (str !== sign) {
                msg.reply(`I had changed ${sign} to ${str}`);
                sign = str;
            }
            break;
        //For playing music form Youtube
        case play:
            if (message.length < 2) {
                msg.reply("Play what ???");
            } else {
                f_execute(msg, serverQueue);
            }
            break;
        case skip:
            f_skip(msg, serverQueue);
            break;
        case stop:
            f_stop(msg, serverQueue);
            break;
        case c_queue:
            if(serverQueue.songs.length == 0){
                msg.channel.send("What are you looking for ? Playlist ?I'm not singing now dude !!?!")
            }else{
                let playlist = serverQueue.songs;
                let content = "Playlist:";
                if(playlist.length>11){
                    for(let i=0;i<10;i++){
                        let count = i+1;
                        content += `\n` + `${count}: ${playlist[i].title}`;
                        if(i == 9){
                            content = content + `\n` + `...`;
                        }
                    }
                }else{
                    for(let i=0;i<playlist.length;i++){
                        content += `\n` + `${i+1}: ${playlist[i].title}`
                    }
                }
                msg.channel.send(content);
            }
            break;
        case clear:
            serverQueue.songs = [];
            f_play(msg.guild, serverQueue.songs[0]);
            msg.reply("Why i need to clean the list for u ??? However, because of my kindness, so i did it");
        }
});


//function for music-------------------------
async function f_execute(message, serverQueue) {
    const youtube = new YouTube(process.env.YOUTUBE_API);
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send(
            "Yoo! Dont be cheated on me,dude. You need to be in a voice channel to hear my voice!"
        );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "No permissions to join and sing for you guys! Give me it!?!!"
        );
    }
    if (args[1].includes('list=')) {//for whole playlist
        if(args[1].includes('start_radio=')){//if the url contain "start_radio=" --> youtube generate automatically
            youtube.getVideo(args[1])
            .then(video => {
                var songList = [];
                var first_video= {
                    title : video.title,
                    url : 'https://www.youtube.com/watch?v=' + video.id,
                }
                songList.push(first_video);
                youtube.getPlaylist(args[1])
                .then(playlist => {
                    playlist.getVideos()
                        .then(async songInfo => {
                            for (let i = 0; i < songInfo.length; i++) {
                                var song = {
                                    title: songInfo[i].title,
                                    url: 'https://www.youtube.com/watch?v=' + songInfo[i].id,
                                };
                                songList.push(song);
                            }
                            if (!serverQueue) {
                                const queueContruct = {
                                    textChannel: message.channel,
                                    voiceChannel: voiceChannel,
                                    connection: null,
                                    songs: [],
                                    volume: 5,
                                    playing: true
                                };
                                queue.set(message.guild.id, queueContruct);
                                for (let i = 0; i < songList.length; i++) {
                                    queueContruct.songs.push(songList[i]);
                                }
                                try {
                                    var connection = await voiceChannel.join();
                                    queueContruct.connection = connection;
                                    f_play(message.guild, queueContruct.songs[0]);
                                } catch (err) {
                                    console.log(err);
                                    queue.delete(message.guild.id);
                                    return message.channel.send(err);
                                }
                            } else {
                                serverQueue.songs.push(song);
                                return message.channel.send(`${song.title} has been added to the queue!`);
                            }
                        })
                        .catch(console.log);
                })
                .catch(console.log);
            })
            .catch(console.log);
        }else if(args[1].includes('v=')){//if the url contain "v=" --> user's playlist
                youtube.getVideo(args[1])
                .then(video => {
                    var songList = [];
                    var first_video= {
                        title : video.title,
                        url : 'https://www.youtube.com/watch?v=' + video.id,
                    }
                    songList.push(first_video);
                    youtube.getPlaylist(args[1])
                    .then(playlist => {
                        playlist.getVideos()
                            .then(async songInfo => {
                                for (let i = 0; i < songInfo.length; i++) {
                                    if(songInfo[i].id == video.id){
                                        i++;
                                        for(let j = i;j<songInfo.length;j++){
                                            var song = {
                                                title: songInfo[j].title,
                                                url: 'https://www.youtube.com/watch?v=' + songInfo[j].id,
                                            };
                                            songList.push(song);
                                        }
                                    }
                                }
                                if (!serverQueue) {
                                    const queueContruct = {
                                        textChannel: message.channel,
                                        voiceChannel: voiceChannel,
                                        connection: null,
                                        songs: [],
                                        volume: 5,
                                        playing: true
                                    };
                                    queue.set(message.guild.id, queueContruct);
                                    for (let i = 0; i < songList.length; i++) {
                                        queueContruct.songs.push(songList[i]);
                                    }
                                    try {
                                        var connection = await voiceChannel.join();
                                        queueContruct.connection = connection;
                                        f_play(message.guild, queueContruct.songs[0]);
                                    } catch (err) {
                                        console.log(err);
                                        queue.delete(message.guild.id);
                                        return message.channel.send(err);
                                    }
                                }
                            })
                            .catch(console.log);
                    })
                    .catch(console.log);
                })
                .catch(console.log);
        }else{
            youtube.getPlaylist(args[1])
            .then(playlist => {
                playlist.getVideos()
                    .then(async songInfo => {
                        var songList = [];
                        for (let i = 0; i < songInfo.length; i++) {
                            var song = {
                                title: songInfo[i].title,
                                url: 'https://www.youtube.com/watch?v=' + songInfo[i].id,
                            };
                            songList.push(song);
                        }
                        if (!serverQueue) {
                            const queueContruct = {
                                textChannel: message.channel,
                                voiceChannel: voiceChannel,
                                connection: null,
                                songs: [],
                                volume: 5,
                                playing: true
                            };
                            queue.set(message.guild.id, queueContruct);
                            for (let i = 0; i < songList.length; i++) {
                                queueContruct.songs.push(songList[i]);
                            }
                            try {
                                var connection = await voiceChannel.join();
                                queueContruct.connection = connection;
                                f_play(message.guild, queueContruct.songs[0]);
                            } catch (err) {
                                console.log(err);
                                queue.delete(message.guild.id);
                                return message.channel.send(err);
                            }
                        }
                    })
                    .catch(console.log);
            })
            .catch(console.log);
        }
    } else { //for single song
        const songInfo = await ytdl.getInfo(args[1]);
        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
        };
        if (!serverQueue) {
            const queueContruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };
            queue.set(message.guild.id, queueContruct);
            queueContruct.songs.push(song);
            try {
                var connection = await voiceChannel.join();
                queueContruct.connection = connection;
                f_play(message.guild, queueContruct.songs[0]);
            } catch (err) {
                console.log(err);
                queue.delete(message.guild.id);
                return message.channel.send(err);
            }
        } else {
            serverQueue.songs.push(song);
            return message.channel.send(`${song.title} has been added to the queue!`);
        }
    }

};
function f_skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        );
    if (!serverQueue)
        return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
};
function f_stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "Heyy!!! You have to be in a voice channel to stop me, Idiot!"
        );

    if (!serverQueue)
        return message.channel.send("Did you look the list yet ?, There is no song to stop, dummy!!!");

    serverQueue.songs = [];
    message.channel.send(`You just fucking turn me off, you son of a "BEACH" ${message.author}. I will never sing for you again!`);
    serverQueue.connection.dispatcher.end();
};
function f_play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            f_play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`I'm singing the song named: **${song.title}**`);
};
client.login(process.env.TOKEN);