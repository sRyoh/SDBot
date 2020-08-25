const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
client.deadlines = require('../deadlines.json');

module.exports = {
    name: 'deadline',
    description: 'Create a deadline that will be pinged a week before it is due.',
    args: true,
    usage: '<name> <MM/DD/YYYY> <HH:MM> <AM/PM>' ,
    execute(message, args) {
        if(args.length !== 4) {
            let reply = `You didn't the proper arguments, ${message.author}`;
            reply += `\nType !help or !help deadline for the proper usage.`;
            message.channel.send(reply);
            return;
        } else if(args[1].length !== 10) {
            let reply = `Invalid date format, ${message.author}`;
            reply += `\nExample format: 01/01/2020`
            message.channel.send(reply);
            return;
        } else if(args[2].length !== 5) {
            let reply = `Invalid time format, ${message.author}`;
            reply += `\nExample format: 01:00`
            message.channel.send(reply);
            return;
        } else if(args[3].toUpperCase() !== 'AM') {
            if(args[3].toUpperCase() !== 'PM') {
                let reply = `Invalid meridiem format, ${message.author}`;
                reply += `\nExample format: 01:00 PM`
                message.channel.send(reply);
                return;
            }
        }
        
        let index = 0;
        if(!client.deadlines.length) {
            for(deadline in client.deadlines) {
                index = deadline;
            }
        }

        client.deadlines[parseInt(index) + 1] = {
            name : args[0],
            date : args[1],
            time : args[2],
            meridiem : args[3].toUpperCase()
        }

        fs.writeFile('./deadlines.json', JSON.stringify(client.deadlines, null, 4), err => {
            if(err) { 
                message.channel.send("error"); 
                throw err;
            } else {
                message.channel.send("Created deadline.")
                .catch(console.error);
            }
        });
    },
}