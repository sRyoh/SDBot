const fs = require('fs');
const functions = require('../functions.js');

module.exports = {
    name: 'meeting',
    description: 'Create a one-time meeting that will ping everyone an hour before and when the meeting starts.',
	args: true,
	usage : '<MM/DD/YYYY> <HH:MM> <AM/PM>',
	execute(message, args) {
        if(!functions.checkArgsLength('meeting', args.length, 3, message)) return;
        if(!functions.checkDateFormat(args[0], message)) return;
        if(!functions.checkTimeFormat(args[1], message)) return;
        if(!functions.checkMeridiemFormat(args[2], message)) return;
        
        let index = 0;
        if(!message.client.meetings.length) {
            for(meeting in message.client.meetings) {
                index = meeting;
            }
        }

        message.client.meetings[parseInt(index, 10) + 1] = {
            date : args[0],
            time : args[1],
            meridiem : args[2].toUpperCase(),
            weekly : 0
        }

        fs.writeFile('./meetings.json', JSON.stringify(message.client.meetings, null, 4), err => {
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