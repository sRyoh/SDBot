const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
client.deadlines = require('../deadlines.json');

module.exports = {
    name : 'deadline',
    description : 'Create a deadline that will be pinged a week before it is due.',
    args : true,
    usage : '<name> <MM/DD/YYYY>',
    execute(message, args) {
        if(args.length !== 2) {
            let reply = `You didn't provide enough arguments, ${message.author}`;
            reply += `\nType !help or !help deadline for the proper usage.`;
            message.channel.send(reply);
            return;
        }

        let index = 0;
        if(!client.deadlines.length) {
            for(deadline in client.deadlines) {
                index = deadline;
            }
        }

        client.deadlines[parseInt(index) + 1] = {
            name : args[0],
            date : args[1]
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