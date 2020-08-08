const fs = require('fs');
const Discord = require('discord.js');
const { bot_commands } = require('../config.json');

const client = new Discord.Client();
client.meetings = require('../meetings.json');
client.deadlines = require('../deadlines.json');

module.exports = {
    name : 'show',
    description : 'Shows the current meetings and deadlines, can specify to show only one of them',
    args : true,
    usage : '<meetings/deadlines/all>',
    execute(message, args) {
        if(args[0] === 'meetings') {
            createEmbed('#0099ff', 'Meetings','List of all upcoming meetings', 
                        'https://i.ibb.co/VgRkdt8/baseline-schedule-white-18dp.png',
                        'SD Bot [meetings]', bot_commands);
        } else if (args[0] === 'deadlines') {
            createEmbed('#9e0000', 'Deadlines','List of all upcoming deadlines',
                        'https://i.ibb.co/2M6jJkq/baseline-event-white-18dp.png', 
                        'SD Bot [deadlines]', bot_commands);
        } else if (args[0] === 'all') {
            createEmbed('#9e0000', 'Deadlines','List of all upcoming deadlines',
                        'https://i.ibb.co/2M6jJkq/baseline-event-white-18dp.png',
                        'SD Bot [deadlines]', bot_commands);
            createEmbed('#0099ff', 'Meetings','List of all upcoming meetings', 
                        'https://i.ibb.co/VgRkdt8/baseline-schedule-white-18dp.png',
                        'SD Bot [meetings]', bot_commands);
        }
    },
};

function createEmbed(color, title, description, thumbnail, footer, channel) {
    let botChannel = client.channels.cache.get(channel);

    let list = [];
    if(title === 'Meetings') {
        for(meeting in client.meetings) {
            let m = client.meetings[meeting];
            list.push({
                "id" : meeting,
                "date" : m.date,
                "time" : m.time,
                'meridiem' : m.meridiem
            });
        }
    } else if(title === 'Deadlines') {
        for(deadline in client.deadlines) {
            let d = client.deadlines[deadline];
            list.push({
                "id" : deadline,
                "name" : d.name,
                "date" : d.date
            });
        }
    }

    list.sort(function (a, b) {
        if(title === 'Meetings') {
            return new Date(`${a.date} ${a.time} ${a.meridiem}`) - new Date(`${b.date} ${b.time} ${b.meridiem}`);
        } else if(title === 'Deadlines') {
            let date1 = a.date.split('/');
            let date2 = b.date.split('/');
            return date1[2] - date2[2] || date1[0] - date2[0] || date1[1] - date2[1];
        }
    });

    const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .setURL('http://endlesslearner.com/home') //this doesn't work
        .setAuthor('Senior Design Bot', 'https://i.ibb.co/vxcQxLc/DBicon.png')
        .setDescription(description)
        .setThumbnail(thumbnail)
        .setTimestamp()
        .setFooter(footer)
        if(title === 'Meetings') {
            list.forEach(entry => {
                embed.addField(`(ID:${entry.id}) Meeting`, `${entry.date} ${entry.time} ${entry.meridiem}`)
            });
                botChannel.send(embed)
                .catch(console.error);
        } else if(title === 'Deadlines') {
            list.forEach(entry => {
                embed.addField(`(ID:${entry.id}) ${entry.name}`, `${entry.date}`)
            });
                botChannel.send(embed)
                .catch(console.error);
    }
};