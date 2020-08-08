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
            meetings(message);
        } else if(args[0] === 'deadline') {
            delete client.deadlines[args[1]];
            fs.writeFile('./deadlines.json', JSON.stringify(client.deadlines, null, 4), err => {
                if(err) { 
                    message.channel.send("error"); 
                    throw err;
                }
            });
            message.channel.send(`${message.author} here is the updated list of meetings.`);
            deadlines(message);
        }
    },
};

function meetings(message) {
    let reply = "```List of all meetings";
    reply += "\n--------------------"
    for(meeting in client.meetings) {
        let m = client.meetings[meeting];
        reply += `\n${m.date} ${m.time} ${m.meridiem}`;
    }
    message.channel.send(reply + "```")
    .catch(console.error);
};

function deadlines(message) {
    let reply = "```List of all deadlines";
    reply += "\n--------------------"
    for(deadline in client.deadlines) {
        let d = client.deadlines[deadline];
        reply += `\n${d.name} ${d.date}`;
    }
    message.channel.send(reply + "```")
    .catch(console.error);
}