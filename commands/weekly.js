const fs = require('fs');
const functions = require('../functions.js');

module.exports = {
    name: 'weekly',
    description: 'Create a meeting that repeats weekly, pinging everyone an hour before and when the meeting starts.',
    args: true,
    usage: '<Monday/Tuesday/Wednesday/Thursday/Friday/Saturday/Sunday> <HH:MM> <AM/PM>' ,
    execute(message, args) {
        if(!functions.checkArgsLength('weekly', args.length, 3, message)) return;
        if(!functions.checkDayFormat(args[0], message)) return;
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
            weekly : 1
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