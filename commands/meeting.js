const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
client.meetings = require('../meetings.json');

module.exports = {
    name: 'meeting',
    description: 'Create a meeting that will ping everyone an hour before meeting starts.',
	args: true,
	usage : '<MM/DD/YYYY> <HH:MM> <AM/PM>',
	execute(message, args) {
        if(args.length !== 3) {
            let reply = `You didn't provide enough arguments, ${message.author}`;
            reply += `\nType !help or !help meeting for the proper usage.`;
            message.channel.send(reply);
            return;
        } else if(args[0].length !== 10) {
            let reply = `Invalid date format, ${message.author}`;
            reply += `\nExample format: 01/01/2020`
            message.channel.send(reply);
            return;
        } else if(args[1].length !== 5) {
            let reply = `Invalid time format, ${message.author}`;
            reply += `\nExample format: 01:00`
            message.channel.send(reply);
            return;
        }
        
        let index = 0;
        if(!client.meetings.length) {
            for(meeting in client.meetings) {
                index = meeting;
            }
        }

        client.meetings[parseInt(index) + 1] = {
            date : args[0],
            time : args[1],
            meridiem : args[2].toUpperCase()
        }

        fs.writeFile('./meetings.json', JSON.stringify(client.meetings, null, 4), err => {
            if(err) {
                message.channel.send("error"); 
                throw err;
            } else {
                message.channel.send("Created meeting.")
                .catch(console.error);
            }   
        });
	},
}