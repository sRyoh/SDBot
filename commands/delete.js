const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
client.meetings = require('../meetings.json');
client.deadlines = require('../deadlines.json');

// import { meetings, deadlines } from './show.js';
// const file1 = require("./show.js")

module.exports = {
    name : 'delete',
    description : 'Delete a meeting or deadline by giving the ID',
    args: true,
    usage : '<meeting/deadline> <ID>',
    execute(message, args) {
        if(args[0] === 'meeting') {
            delete client.meetings[args[1]];
            fs.writeFile('./meetings.json', JSON.stringify(client.meetings, null, 4), err => {
                if(err) {
                    message.channel.send("error"); 
                    throw err;
                }
            });
            message.channel.send(`${message.author} here is the updated list of meetings.`);
            createEmbed('#0099ff', 'Meetings','List of all upcoming meetings', 
                        'https://i.ibb.co/VgRkdt8/baseline-schedule-white-18dp.png',
                        'SD Bot [meetings]', message.channel);
        } else if(args[0] === 'deadline') {
            delete client.deadlines[args[1]];
            fs.writeFile('./deadlines.json', JSON.stringify(client.deadlines, null, 4), err => {
                if(err) { 
                    message.channel.send("error"); 
                    throw err;
                }
            });
            message.channel.send(`${message.author} here is the updated list of meetings.`);
            createEmbed('#9e0000', 'Deadlines','List of all upcoming deadlines',
                        'https://i.ibb.co/2M6jJkq/baseline-event-white-18dp.png', 
                        'SD Bot [deadlines]', message.channel);
        }
    },
};

function createEmbed(color, title, description, thumbnail, footer, channel) {
    // Create an array of either deadline sor meetings
    // Used for adding fields to the embed to show the deadlines or meetings
    let list = [];
    if(title === 'Meetings') {
        for(meeting in client.meetings) {
            let m = client.meetings[meeting];
            list.push({
                "id" : meeting,
                "date" : m.date,
                "time" : m.time,
                "meridiem" : m.meridiem
            });
        }
    } else if(title === 'Deadlines') {
        for(deadline in client.deadlines) {
            let d = client.deadlines[deadline];
            list.push({
                "id" : deadline,
                "name" : d.name,
                "date" : d.date,
                "time" : d.time,
                "meridiem" : d.meridiem
            });
        }
    }

    // Sort the array based on the dates
    list.sort(function (a, b) {
        return new Date(`${a.date} ${a.time} ${a.meridiem}`) - new Date(`${b.date} ${b.time} ${b.meridiem}`);
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
                channel.send(embed)
                .catch(console.error);
        } else if(title === 'Deadlines') {
            list.forEach(entry => {
                embed.addField(`(ID:${entry.id}) ${entry.name}`, `${entry.date} ${entry.time} ${entry.meridiem}`)
            });
                channel.send(embed)
                .catch(console.error);
    }
};